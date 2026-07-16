"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { revalidatePath } from "next/cache";
import {
  broadcastQuestReleaseNotification,
  sendOutbidNotification,
  broadcastNodeCaptureNotification,
  sendWhatsAppMessage,
  getOperationHeliosGroupId,
} from "@/lib/whatsapp";
import { Faction, QuestPhase, ShopItemType, VerificationType } from "@prisma/client";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-for-goal-rush-fundraising-portal"
);

// Helper to hash answers (SHA-256)
function hashAnswer(answer: string): string {
  return createHash("sha256").update(answer.trim().toLowerCase()).digest("hex");
}
// Helper to log system audits in database
export async function logSystemAction(action: string, details: string) {
  try {
    await prisma.whatsAppLog.create({
      data: {
        phone: "SYSTEM",
        body: action,
        status: "LOG",
        error: details,
      },
    });
  } catch (err) {
    console.error("[Logger] Failed to write system log to database:", err);
  }
}

// 1. Session Auth Helper
export async function getRoverSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;
    
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      include: { roverProfile: true },
    });

    if (!profile) return null;

    try {
      await prisma.profile.update({
        where: { id: userId },
        data: { lastActiveAt: new Date() },
      });
    } catch (_) {}

    // Auto-create RoverProfile if it does not exist for the scout user
    if (!profile.roverProfile) {
      const newRoverProfile = await prisma.roverProfile.create({
        data: {
          profileId: userId,
          roverCredits: 0,
          faction: null,
          phoneNumber: "",
        },
      });
      return { profile, roverProfile: newRoverProfile };
    }

    return { profile, roverProfile: profile.roverProfile };
  } catch (err) {
    return null;
  }
}



// 2. Submit Quest Code
export async function submitQuestCode(questId: string, answerCode: string) {
  const session = await getRoverSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const quest = await prisma.quest.findUnique({ where: { id: questId } });
  if (!quest) return { success: false, error: "Quest not found" };
  if (!quest.isReleased) return { success: false, error: "Quest is locked" };
  if (quest.expiresAt && new Date() > new Date(quest.expiresAt)) {
    return { success: false, error: "Challenge has expired. Submission closed." };
  }

  if (quest.verificationType !== VerificationType.DIGITAL_CODE) {
    return { success: false, error: "Quest requires leader sign-off verification" };
  }

  // Blind intake matrix check
  if (quest.isBlind) {
    const existingCompletion = await prisma.questCompletion.findUnique({
      where: {
        roverId_questId: {
          roverId: session.profile.id,
          questId,
        },
      },
    });
    if (existingCompletion) {
      return { success: false, error: "Quest already completed and verified." };
    }

    const submissionsCount = await prisma.questSubmission.count({
      where: { roverId: session.profile.id, questId }
    });

    if (submissionsCount >= 2) {
      return { success: false, error: "LIMIT_REACHED: You have already submitted 2 answers for this blind quest." };
    }

    await prisma.questSubmission.create({
      data: {
        roverId: session.profile.id,
        questId,
        answer: answerCode
      }
    });

    return {
      success: true,
      isBlind: true,
      message: `SUBMISSION_RECEIVED: Answer logged in the Black-Box matrix (Attempt ${submissionsCount + 1}/2). Results will be processed at midnight.`
    };
  }

  const hashedAnswer = hashAnswer(answerCode);
  if (hashedAnswer !== quest.encryptedAnswerHash) {
    return { success: false, error: "Incorrect answer code. Cipher verification failed." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Check if already completed
      const existing = await tx.questCompletion.findUnique({
        where: {
          roverId_questId: {
            roverId: session.profile.id,
            questId,
          },
        },
      });

      if (existing) {
        throw new Error("Quest already completed");
      }

      // Create completion (isVerified = true)
      await tx.questCompletion.create({
        data: {
          roverId: session.profile.id,
          questId,
          isVerified: true,
        },
      });

      // Award credits
      const updatedRover = await tx.roverProfile.update({
        where: { profileId: session.profile.id },
        data: { roverCredits: { increment: quest.creditReward } },
      });

      return updatedRover;
    }, { timeout: 15000 });

    revalidatePath("/rovers/terminal");

    console.log(`[AuditLog] Rover "${session.profile.fullName}" (${session.profile.id}) successfully decrypted quest "${quest.title}". Awarded ${quest.creditReward} CR.`);
    await logSystemAction("QUEST_DECRYPTED", `Rover "${session.profile.fullName}" (${session.profile.id}) successfully decrypted quest "${quest.title}". Awarded +${quest.creditReward} CR.`);

    // Notify the rover via WhatsApp
    if (session.roverProfile?.phoneNumber) {
      try {
        const message = `✅ *HELIOS MISSION DECRYPTED* ✅\n\nWell done, Rover! You solved the code for *"${quest.title}"*!\n\n💰 Reward: *+${quest.creditReward} Credits* has been added to your balance.`;
        await sendWhatsAppMessage(session.roverProfile.phoneNumber, message);
      } catch (waErr) {
        console.error("[WAHA] Failed to send decryption message to rover:", waErr);
      }
    }

    return { success: true, reward: quest.creditReward, newCredits: result.roverCredits };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to submit quest code" };
  }
}

// 3. Request Leader Sign-Off
export async function requestQuestLeaderSignOff(questId: string) {
  const session = await getRoverSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const quest = await prisma.quest.findUnique({ where: { id: questId } });
  if (!quest) return { success: false, error: "Quest not found" };
  if (!quest.isReleased) return { success: false, error: "Quest is locked" };
  if (quest.expiresAt && new Date() > new Date(quest.expiresAt)) {
    return { success: false, error: "Challenge has expired. Submission closed." };
  }

  if (quest.verificationType !== VerificationType.LEADER_SIGN_OFF) {
    return { success: false, error: "Quest evaluates answers via digital code ciphers" };
  }

  try {
    const existing = await prisma.questCompletion.findUnique({
      where: {
        roverId_questId: {
          roverId: session.profile.id,
          questId,
        },
      },
    });

    if (existing) {
      if (existing.isVerified) {
        return { success: false, error: "Quest already completed and verified" };
      }
      return { success: false, error: "Already awaiting leader sign-off verification" };
    }

    // Create completion record as unverified (awaiting sign off)
    await prisma.questCompletion.create({
      data: {
        roverId: session.profile.id,
        questId,
        isVerified: false,
      },
    });

    console.log(`[AuditLog] Rover "${session.profile.fullName}" (${session.profile.id}) requested leader sign-off for quest "${quest.title}".`);
    await logSystemAction("QUEST_SIGN_OFF_REQUESTED", `Rover "${session.profile.fullName}" (${session.profile.id}) requested leader sign-off verification for quest "${quest.title}".`);

    // Notify leader (+96170078138) about pending sign-off verification
    try {
      const leaderPhone = "+96170078138";
      const leaderMessage = `🛡️ *HELIOS MILESTONE: APPROVAL REQUEST* 🛡️\n\nScout *${session.profile.fullName}* requested leader sign-off for challenge *"${quest.title}"* (+${quest.creditReward} CR).\n\nReview and approve here: https://sdcsaintjeanmarc.org/en/rovers/admin`;
      await sendWhatsAppMessage(leaderPhone, leaderMessage);
    } catch (waErr) {
      console.error("[WAHA] Failed to notify leader about sign-off request:", waErr);
    }

    revalidatePath("/rovers/terminal");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to request sign-off" };
  }
}

// 4. Purchase Shop Item (Fixed Price)
export async function purchaseShopItem(itemId: string) {
  const session = await getRoverSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.shopItem.findUnique({ where: { id: itemId } });
      if (!item) throw new Error("Item not found");
      if (item.type !== ShopItemType.FIXED_PRICE) {
        throw new Error("Item is not a fixed price item");
      }
      if (!item.isAvailable) throw new Error("Item is currently unavailable");
      if (item.stock <= 0) throw new Error("Item out of stock");

      const rover = await tx.roverProfile.findUnique({
        where: { profileId: session.profile.id },
      });

      if (!rover) throw new Error("Rover profile not found");
      if (rover.roverCredits < item.priceOrCurrentBid) {
        throw new Error(`Insufficient credits. Requires ${item.priceOrCurrentBid} credits.`);
      }

      // Deduct credits
      const updatedRover = await tx.roverProfile.update({
        where: { profileId: session.profile.id },
        data: { roverCredits: { decrement: item.priceOrCurrentBid } },
      });

      // Decrement stock
      await tx.shopItem.update({
        where: { id: itemId },
        data: { stock: { decrement: 1 } },
      });

      // Create Purchase record
      await tx.shopPurchase.create({
        data: {
          shopItemId: itemId,
          roverId: session.profile.id,
          pricePaid: item.priceOrCurrentBid,
          isDelivered: false
        }
      });

      return { updatedRover, item };
    }, { timeout: 15000 });

    revalidatePath("/rovers/shop");

    // Log synchronously (fast, no network)
    console.log(`[AuditLog] Rover "${session.profile.fullName}" (${session.profile.id}) purchased item "${result.item.title}" for ${result.item.priceOrCurrentBid} CR. New balance: ${result.updatedRover.roverCredits} CR.`);
    // Fire-and-forget: log to DB in background, don't block the response
    logSystemAction("MARKETPLACE_PURCHASE", `Rover "${session.profile.fullName}" (${session.profile.id}) purchased item "${result.item.title}" for ${result.item.priceOrCurrentBid} CR. New balance: ${result.updatedRover.roverCredits} CR.`)
      .catch(err => console.error("[Log] Failed to write system action:", err));

    // ── Fire-and-forget WhatsApp notifications ──────────────────────────────
    // Build messages first (sync), then dispatch all sends without awaiting.
    const isHintItem = !!result.item.hintText;
    const roverPhone = session.roverProfile?.phoneNumber;

    if (roverPhone) {
      const roverMessage = isHintItem
        ? `🔑 *HELIOS MARKETPLACE: HINT UNLOCKED* 🔑\n\nYou purchased *"${result.item.title}"* for *${result.item.priceOrCurrentBid} CR*.\n\nYour new balance is *${result.updatedRover.roverCredits} CR*.\n\n✅ Your hint has been revealed on-screen in the marketplace. Check your device now!`
        : `🛍️ *HELIOS MARKETPLACE: PURCHASE PERK* 🛍️\n\nCongratulations! You purchased *"${result.item.title}"* for *${result.item.priceOrCurrentBid} CR*.\n\nYour new balance is *${result.updatedRover.roverCredits} CR*. Present this message to the Command Tent to collect your perk.`;
      sendWhatsAppMessage(roverPhone, roverMessage)
        .catch(err => console.error("[WAHA] Failed to send purchase confirmation to rover:", err));
    }

    const hintSection = result.item.hintText
      ? `\n\n🔑 *HINT TO DELIVER:*\n_${result.item.hintText}_\n\nScout has already seen this on-screen. Mark as delivered when done.`
      : "";
    const adminMessage = `🛒 *HELIOS MARKETPLACE: NEW PURCHASE* 🛒\n\nScout *${session.profile.fullName}* purchased *"${result.item.title}"* for *${result.item.priceOrCurrentBid} CR*.${hintSection}\n\nManage purchases here: https://sdcsaintjeanmarc.org/en/rovers/admin`;

    sendWhatsAppMessage("+96170078138", adminMessage)
      .catch(err => console.error("[WAHA] Failed to notify main admin:", err));

    prisma.profile.findMany({ where: { role: "admin" }, include: { roverProfile: true } })
      .then(admins => {
        for (const admin of admins) {
          if (admin.roverProfile?.phoneNumber && admin.roverProfile.phoneNumber !== "+96170078138") {
            sendWhatsAppMessage(admin.roverProfile.phoneNumber, adminMessage)
              .catch(err => console.error("[WAHA] Failed to notify admin:", err));
          }
        }
      })
      .catch(err => console.error("[WAHA] Failed to fetch admins for notification:", err));
    // ────────────────────────────────────────────────────────────────────────

    return { success: true, newCredits: result.updatedRover.roverCredits, hintText: result.item.hintText ?? null };

  } catch (err: any) {
    return { success: false, error: err.message || "Failed to purchase item" };
  }
}

// 5. Place Bid (Live Auctions)
export async function placeBid(itemId: string, bidAmount: number) {
  const session = await getRoverSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const transactionResult = await prisma.$transaction(async (tx) => {
      const item = await tx.shopItem.findUnique({ where: { id: itemId } });
      if (!item) throw new Error("Item not found");
      if (item.type !== ShopItemType.AUCTION) {
        throw new Error("Item is not an auction item");
      }
      if (!item.isAvailable) throw new Error("Auction is closed");
      if (bidAmount <= item.priceOrCurrentBid) {
        throw new Error(`Bid must be higher than current highest bid (${item.priceOrCurrentBid} credits)`);
      }

      const rover = await tx.roverProfile.findUnique({
        where: { profileId: session.profile.id },
      });

      if (!rover) throw new Error("Rover profile not found");
      if (rover.roverCredits < bidAmount) {
        throw new Error(`Insufficient credits. You only have ${rover.roverCredits} credits.`);
      }

      let outbidUserPhone: string | null = null;
      let outbidItemTitle = item.title;

      // Refund the previous highest bidder if one exists
      if (item.highestBidderId) {
        const prevRover = await tx.roverProfile.findUnique({
          where: { profileId: item.highestBidderId },
          select: { phoneNumber: true },
        });
        if (prevRover) {
          outbidUserPhone = prevRover.phoneNumber;
        }

        await tx.roverProfile.update({
          where: { profileId: item.highestBidderId },
          data: { roverCredits: { increment: item.priceOrCurrentBid } },
        });
      }

      // Deduct bid from current user
      const updatedRover = await tx.roverProfile.update({
        where: { profileId: session.profile.id },
        data: { roverCredits: { decrement: bidAmount } },
      });

      const isInitialBid = !item.highestBidderId;

      // Update auction state
      const updatedItem = await tx.shopItem.update({
        where: { id: itemId },
        data: {
          priceOrCurrentBid: bidAmount,
          highestBidderId: session.profile.id,
        },
      });

      return { updatedRover, updatedItem, outbidUserPhone, outbidItemTitle, isInitialBid };
    }, { timeout: 15000 });

    // Notify outbid user outside the transaction to prevent holding locks
    if (transactionResult.outbidUserPhone) {
      try {
        await sendOutbidNotification(
          transactionResult.outbidUserPhone,
          transactionResult.outbidItemTitle,
          bidAmount
        );
      } catch (waErr) {
        console.error("[WAHA] Failed to send outbid notification:", waErr);
      }
    }

    console.log(`[AuditLog] Rover "${session.profile.fullName}" (${session.profile.id}) bid ${bidAmount} CR on auction item "${transactionResult.outbidItemTitle}".`);
    await logSystemAction("MARKETPLACE_BID", `Rover "${session.profile.fullName}" (${session.profile.id}) bid ${bidAmount} CR on auction item "${transactionResult.outbidItemTitle}".`);

    // Notify Leader (+96170078138) about the new high bid
    try {
      const leaderPhone = "+96170078138";
      const leaderMessage = `💸 *HELIOS MARKET: NEW BID PLACED* 💸\n\nRover *${session.profile.fullName}* placed a high bid of *${bidAmount} CR* on auction item *"${transactionResult.outbidItemTitle}"*.`;
      await sendWhatsAppMessage(leaderPhone, leaderMessage);
    } catch (waErr) {
      console.error("[WAHA] Failed to notify leader about new bid:", waErr);
    }

    // Send WhatsApp Group notification on initial bid
    if (transactionResult.isInitialBid) {
      try {
        const groupId = await getOperationHeliosGroupId();
        const groupMessage = `💸 *HELIOS MARKET: INITIAL BID PLACED* 💸\n\nScout *${session.profile.fullName}* placed the initial bid of *${bidAmount} CR* on auction item *"${transactionResult.outbidItemTitle}"*!`;
        await sendWhatsAppMessage(groupId, groupMessage);
      } catch (waErr) {
        console.error("[WAHA] Failed to send initial bid group notification:", waErr);
      }
    }

    revalidatePath("/rovers/shop");
    return { success: true, newCredits: transactionResult.updatedRover.roverCredits };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to place bid" };
  }
}

// Haversine Distance Formula Helper
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// 6. Capture Node by Passcode
export async function captureNodeByPasscode(nodeId: string, passcode: string, lat?: number, lng?: number) {
  const session = await getRoverSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const faction = session.roverProfile?.faction;
  if (!faction) {
    return { success: false, error: "You must be assigned to a faction (ALPHA/BRAVO) to capture nodes" };
  }

  const node = await prisma.geoNode.findUnique({ where: { id: nodeId } });
  if (!node) return { success: false, error: "Node not found" };

  if (node.shieldExpiresAt && node.shieldExpiresAt > new Date()) {
    return { success: false, error: "SHIELD_ACTIVE: Target node is shielded by an electromagnetic defense grid." };
  }

  if (lat !== undefined && lng !== undefined) {
    const distance = getDistanceMeters(lat, lng, node.latitude, node.longitude);
    const perimeterSetting = await prisma.systemSetting.findUnique({
      where: { key: "capture_perimeter_meters" },
    });
    const maxDistance = perimeterSetting ? parseInt(perimeterSetting.value, 10) : 100;
    if (distance > maxDistance) {
      return {
        success: false,
        error: `You are too far away (${Math.round(distance)}m). You must be physically near the node (within ${maxDistance}m) to check in.`,
      };
    }
  }

  if (node.secretPasscode.trim().toLowerCase() !== passcode.trim().toLowerCase()) {
    return { success: false, error: "Incorrect secret passcode for this node location." };
  }

  // Check if there is an active opposing hack to allow defense disruption
  const windowStart = new Date(Date.now() - 60000);
  const activeOpposingHack = await prisma.nodeCheckIn.findFirst({
    where: {
      nodeId,
      faction: { not: faction },
      createdAt: { gte: windowStart }
    }
  });

  if (node.controllingFaction === faction && !activeOpposingHack) {
    return { success: false, error: `This node is already controlled by your faction (${faction})` };
  }


  // Dynamic recapture cooldown: opposing faction cannot retake a hotspot for X hours after it was captured
  if (node.isHotSpot && node.capturedAt && node.controllingFaction && node.controllingFaction !== faction) {
    const cooldownSetting = await prisma.systemSetting.findUnique({
      where: { key: "hotspot_cooldown_hours" },
    });
    const cooldownHours = cooldownSetting ? parseFloat(cooldownSetting.value) : 6;
    const cooldownMs = cooldownHours * 60 * 60 * 1000;
    const elapsed = Date.now() - new Date(node.capturedAt).getTime();
    if (elapsed < cooldownMs) {
      const remainingMs = cooldownMs - elapsed;
      const remainingHrs = Math.floor(remainingMs / 3600000);
      const remainingMins = Math.floor((remainingMs % 3600000) / 60000);
      return {
        success: false,
        error: `🔒 COOLDOWN_ACTIVE: This Hot-Spot was recently captured by Faction ${node.controllingFaction}. Recapture is locked for ${remainingHrs}h ${remainingMins}m.`,
      };
    }
  }


  if (node.isHotSpot) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const now = new Date();
        const windowStart = new Date(now.getTime() - 60000); // 60 seconds ago

        // 1. Wipe check-ins older than 60 seconds at this node
        await tx.nodeCheckIn.deleteMany({
          where: {
            nodeId,
            createdAt: { lt: windowStart }
          }
        });

        // 2. Fetch all active check-ins at this node in the last 30 seconds
        const activeCheckIns = await tx.nodeCheckIn.findMany({
          where: { nodeId }
        });

        // 3. Check for opposing faction active queue
        const opposingCheckIn = activeCheckIns.find(c => c.faction !== faction);
        if (opposingCheckIn) {
          // INTERRUPTION EVENT: Wipes check-in queue to abort the hack.
          await tx.nodeCheckIn.deleteMany({
            where: { nodeId }
          });
          return {
            status: "INTERRUPTED",
            opposingFaction: opposingCheckIn.faction,
            message: `🛡️ HACK INTERRUPTED! You successfully disrupted Faction ${opposingCheckIn.faction}'s capture attempt on Hot-Spot "${node.name}"! The zone has been secured.`
          };
        }


        // 4. Block duplicate check-in
        const alreadyCheckedIn = activeCheckIns.some(c => c.roverId === session.profile.id);
        if (alreadyCheckedIn) {
          return {
            status: "ALREADY_CHECKED_IN",
            message: "⚠️ You have already checked in to this Hot-Spot. Your teammates must check in to complete the capture!"
          };
        }

        await tx.nodeCheckIn.create({
          data: { nodeId, roverId: session.profile.id, faction }
        });

        // 5. Query active unique check-ins again (including this one)
        const updatedCheckIns = await tx.nodeCheckIn.findMany({
          where: { nodeId, faction },
          distinct: ['roverId']
        });

        // 6. Query total scouts assigned to this faction
        const totalFactionScouts = await tx.roverProfile.count({
          where: { faction }
        });

        const activeUniqueScouts = updatedCheckIns.length;
        
        const thresholdSetting = await tx.systemSetting.findUnique({
          where: { key: "hotspot_scout_threshold" }
        });
        const overrideThreshold = thresholdSetting ? parseInt(thresholdSetting.value, 10) : null;
        const requiredCount = overrideThreshold !== null && !isNaN(overrideThreshold) 
          ? overrideThreshold 
          : Math.max(1, totalFactionScouts);

        console.log(`[CAPTURE_DEBUG_PASSCODE] faction="${faction}", totalFactionScouts=${totalFactionScouts}, overrideThreshold=${overrideThreshold}, requiredCount=${requiredCount}, activeUniqueScouts=${activeUniqueScouts}`);

        if (activeUniqueScouts >= requiredCount) {
          // VICTORY! Conquer the Hotspot
          await tx.geoNode.update({
            where: { id: nodeId },
            data: {
              controllingFaction: faction,
              capturedAt: now,
            }
          });

          // Award credits (+150 CR) to all participating members in transaction
          const participatingIds = updatedCheckIns.map(c => c.roverId);
          await tx.roverProfile.updateMany({
            where: { profileId: { in: participatingIds } },
            data: { roverCredits: { increment: 150 } }
          });

          // Wipe check-ins
          await tx.nodeCheckIn.deleteMany({ where: { nodeId } });

          return {
            status: "CAPTURED",
            message: `🎉 Success! Your team secured Hot-Spot "${node.name}"!`
          };
        }

        const isNewQueue = activeCheckIns.length === 0;
        return {
          status: "PROGRESSING",
          isNewQueue,
          message: `📡 Secured check-in. Faction: ${activeUniqueScouts}/${requiredCount} Scouts. Stay in range!`
        };
      }, { timeout: 15000 });

      revalidatePath("/rovers/nav");
      revalidatePath("/rovers/admin");

      if (result.status === "CAPTURED") {
        logSystemAction("GEONODE_HOTSPOT_CONQUERED", `Faction ${faction} conquered Hot-Spot "${node.name}".`);
        const alertMessage = `🎉 *HELIOS TACTICAL UPDATE: SECTOR CONQUERED!* 🎉\n\nFaction *${faction}* has successfully conquered the active Hot-Spot *"${node.name}"*!\n\nAll participating team members have been awarded +150 Credits.`;
        prisma.geoNode.count({ where: { controllingFaction: "ALPHA" } }).then(alphaCount => {
          prisma.geoNode.count({ where: { controllingFaction: "BRAVO" } }).then(bravoCount => {
            broadcastNodeCaptureNotification(
              session.profile.fullName,
              node.name,
              faction,
              alphaCount,
              bravoCount
            ).catch(waErr => console.error("[WAHA] Failed to broadcast node conquer notification:", waErr));
          });
        });
        sendWhatsAppMessage("+961700078138", alertMessage).catch(waErr => console.error("[WAHA] Failed to notify admin:", waErr));
      }

      if (result.status === "PROGRESSING" && result.isNewQueue) {
        const alertMsg = `🚨 *HELIOS SECURITY BREACH: UNDER SIEGE!* 🚨\n\nFaction *${faction}* has initiated a hack on Hot-Spot *"${node.name}"*!\n\nOccupying Faction: *${node.controllingFaction || "NEUTRAL"}*\nTime remaining to defend: *60 seconds*!\nNavigate: https://sdcsaintjeanmarc.space/rovers/nav`;
        getOperationHeliosGroupId().then(groupId => {
          sendWhatsAppMessage(groupId, alertMsg).catch(waErr => 
            console.error("[WAHA] Failed to broadcast siege notification:", waErr)
          );
        }).catch(err => console.error("Failed to query group JID:", err));
      }

      if (result.status === "INTERRUPTED") {
        logSystemAction("GEONODE_HOTSPOT_DEFENDED", `Faction ${faction} disrupted Faction ${result.opposingFaction}'s capture attempt on Hot-Spot "${node.name}".`);
        const alertMsg = `🛡️ *HELIOS DEFENSE SECURED!* 🛡️\n\nFaction *${faction}* has successfully intercepted and disrupted Faction *${result.opposingFaction}*'s hack on Hot-Spot *"${node.name}"*!\n\nThe zone has been secured.`;
        getOperationHeliosGroupId().then(groupId => {
          sendWhatsAppMessage(groupId, alertMsg).catch(waErr => 
            console.error("[WAHA] Failed to broadcast defense notification:", waErr)
          );
        }).catch(err => console.error("Failed to query group JID:", err));
        return { success: true, message: result.message };
      }

      if (result.status === "BLOCKED") {
        return { success: false, error: result.message };
      }


      return {
        success: result.status === "CAPTURED" || result.status === "PROGRESSING",
        message: result.message
      };

    } catch (err: any) {
      return { success: false, error: err.message || "Failed to check in to Hot-Spot." };
    }
  }

  try {
    const { alphaCount, bravoCount } = await prisma.$transaction(async (tx) => {
      // Flip control
      await tx.geoNode.update({
        where: { id: nodeId },
        data: { controllingFaction: faction },
      });

      // Award credits to the capture team rover
      await tx.roverProfile.update({
        where: { profileId: session.profile.id },
        data: { roverCredits: { increment: 50 } }, // 50 credits for capturing a node
      });

      const alpha = await tx.geoNode.count({ where: { controllingFaction: Faction.ALPHA } });
      const bravo = await tx.geoNode.count({ where: { controllingFaction: Faction.BRAVO } });

      return { alphaCount: alpha, bravoCount: bravo };
    }, { timeout: 15000 });

    // Notify all Rovers
    try {
      await broadcastNodeCaptureNotification(
        session.profile.fullName,
        node.name,
        faction,
        alphaCount,
        bravoCount
      );
    } catch (waErr) {
      console.error("[WAHA] Failed to broadcast node capture notification:", waErr);
    }

    await logSystemAction("GEONODE_CAPTURED", `Rover "${session.profile.fullName}" (${session.profile.id}) captured node "${node.name}" for faction ${faction} via passcode.`);
    revalidatePath("/rovers/nav");
    return { success: true, message: `Successfully captured Node: ${node.name} for Faction ${faction}!` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to capture node" };
  }
}

// 6b. Check-In by QR Passcode (Bypasses GPS)
export async function checkInByQR(passcode: string) {
  try {
    const session = await getRoverSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const node = await prisma.geoNode.findFirst({
      where: {
        secretPasscode: {
          equals: passcode.trim(),
          mode: "insensitive"
        }
      }
    });
    if (!node) {
      return { success: false, error: "Invalid QR code passcode scanned." };
    }

    return await captureNodeByPasscode(node.id, passcode);
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to process QR check-in" };
  }
}

// 7. Capture Node by GPS Validation
export async function captureNodeByGPS(nodeId: string, lat: number, lng: number) {
  const session = await getRoverSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const faction = session.roverProfile?.faction;
  if (!faction) {
    return { success: false, error: "You must be assigned to a faction (ALPHA/BRAVO) to capture nodes" };
  }

  const node = await prisma.geoNode.findUnique({ where: { id: nodeId } });
  if (!node) return { success: false, error: "Node not found" };

  if (node.shieldExpiresAt && node.shieldExpiresAt > new Date()) {
    return { success: false, error: "SHIELD_ACTIVE: Target node is shielded by an electromagnetic defense grid." };
  }

  // Check if there is an active opposing hack to allow defense disruption
  const windowStart = new Date(Date.now() - 60000);
  const activeOpposingHack = await prisma.nodeCheckIn.findFirst({
    where: {
      nodeId,
      faction: { not: faction },
      createdAt: { gte: windowStart }
    }
  });

  if (node.controllingFaction === faction && !activeOpposingHack) {
    return { success: false, error: `This node is already controlled by your faction (${faction})` };
  }


  const distance = getDistanceMeters(lat, lng, node.latitude, node.longitude);
  const perimeterSetting = await prisma.systemSetting.findUnique({
    where: { key: "capture_perimeter_meters" },
  });
  const maxDistance = perimeterSetting ? parseInt(perimeterSetting.value, 10) : 100;
  if (distance > maxDistance) {
    return {
      success: false,
      error: `You are out of range (${Math.round(distance)}m away). Must be physically near the node (within ${maxDistance}m) to check in.`,
    };
  }

  // Dynamic recapture cooldown: opposing faction cannot retake a hotspot for X hours after it was captured
  if (node.isHotSpot && node.capturedAt && node.controllingFaction && node.controllingFaction !== faction) {
    const cooldownSetting = await prisma.systemSetting.findUnique({
      where: { key: "hotspot_cooldown_hours" },
    });
    const cooldownHours = cooldownSetting ? parseFloat(cooldownSetting.value) : 6;
    const cooldownMs = cooldownHours * 60 * 60 * 1000;
    const elapsed = Date.now() - new Date(node.capturedAt).getTime();
    if (elapsed < cooldownMs) {
      const remainingMs = cooldownMs - elapsed;
      const remainingHrs = Math.floor(remainingMs / 3600000);
      const remainingMins = Math.floor((remainingMs % 3600000) / 60000);
      return {
        success: false,
        error: `🔒 COOLDOWN_ACTIVE: This Hot-Spot was recently captured by Faction ${node.controllingFaction}. Recapture is locked for ${remainingHrs}h ${remainingMins}m.`,
      };
    }
  }


  if (node.isHotSpot) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const now = new Date();
        const windowStart = new Date(now.getTime() - 60000); // 60 seconds ago

        // 1. Wipe check-ins older than 60 seconds at this node
        await tx.nodeCheckIn.deleteMany({
          where: {
            nodeId,
            createdAt: { lt: windowStart }
          }
        });

        // 2. Fetch all active check-ins at this node in the last 30 seconds
        const activeCheckIns = await tx.nodeCheckIn.findMany({
          where: { nodeId }
        });

        // 3. Check for opposing faction active queue
        const opposingCheckIn = activeCheckIns.find(c => c.faction !== faction);
        if (opposingCheckIn) {
          // INTERRUPTION EVENT: Wipes check-in queue to abort the hack.
          await tx.nodeCheckIn.deleteMany({
            where: { nodeId }
          });
          return {
            status: "INTERRUPTED",
            opposingFaction: opposingCheckIn.faction,
            message: `🛡️ HACK INTERRUPTED! You successfully disrupted Faction ${opposingCheckIn.faction}'s capture attempt on Hot-Spot "${node.name}"! The zone has been secured.`
          };
        }


        // 4. Block duplicate check-in
        const alreadyCheckedIn = activeCheckIns.some(c => c.roverId === session.profile.id);
        if (alreadyCheckedIn) {
          return {
            status: "ALREADY_CHECKED_IN",
            message: "⚠️ You have already checked in to this Hot-Spot. Your teammates must check in to complete the capture!"
          };
        }

        await tx.nodeCheckIn.create({
          data: { nodeId, roverId: session.profile.id, faction }
        });

        // 5. Query active unique check-ins again (including this one)
        const updatedCheckIns = await tx.nodeCheckIn.findMany({
          where: { nodeId, faction },
          distinct: ['roverId']
        });

        // 6. Query total scouts assigned to this faction
        const totalFactionScouts = await tx.roverProfile.count({
          where: { faction }
        });

        const activeUniqueScouts = updatedCheckIns.length;
        
        const thresholdSetting = await tx.systemSetting.findUnique({
          where: { key: "hotspot_scout_threshold" }
        });
        const overrideThreshold = thresholdSetting ? parseInt(thresholdSetting.value, 10) : null;
        const requiredCount = overrideThreshold !== null && !isNaN(overrideThreshold) 
          ? overrideThreshold 
          : Math.max(1, totalFactionScouts);

        console.log(`[CAPTURE_DEBUG_GPS] faction="${faction}", totalFactionScouts=${totalFactionScouts}, overrideThreshold=${overrideThreshold}, requiredCount=${requiredCount}, activeUniqueScouts=${activeUniqueScouts}`);

        if (activeUniqueScouts >= requiredCount) {
          // VICTORY! Conquer the Hotspot!
          await tx.geoNode.update({
            where: { id: nodeId },
            data: {
              controllingFaction: faction,
              capturedAt: now,
            }
          });

          // Award credits (+150 CR) to all participating members in transaction
          const participatingIds = updatedCheckIns.map(c => c.roverId);
          await tx.roverProfile.updateMany({
            where: { profileId: { in: participatingIds } },
            data: { roverCredits: { increment: 150 } }
          });

          // Wipe check-ins
          await tx.nodeCheckIn.deleteMany({ where: { nodeId } });

          return {
            status: "CAPTURED",
            message: `🎉 Success! Your team secured Hot-Spot "${node.name}"!`
          };
        }

        const isNewQueue = activeCheckIns.length === 0;
        return {
          status: "PROGRESSING",
          isNewQueue,
          message: `📡 Secured check-in. Faction: ${activeUniqueScouts}/${requiredCount} Scouts. Stay in range!`
        };
      }, { timeout: 15000 });

      revalidatePath("/rovers/nav");
      revalidatePath("/rovers/admin");

      if (result.status === "CAPTURED") {
        logSystemAction("GEONODE_HOTSPOT_CONQUERED", `Faction ${faction} conquered Hot-Spot "${node.name}".`);
        const alertMessage = `🎉 *HELIOS TACTICAL UPDATE: SECTOR CONQUERED!* 🎉\n\nFaction *${faction}* has successfully conquered the active Hot-Spot *"${node.name}"*!\n\nAll participating team members have been awarded +150 Credits.`;
        prisma.geoNode.count({ where: { controllingFaction: "ALPHA" } }).then(alphaCount => {
          prisma.geoNode.count({ where: { controllingFaction: "BRAVO" } }).then(bravoCount => {
            broadcastNodeCaptureNotification(
              session.profile.fullName,
              node.name,
              faction,
              alphaCount,
              bravoCount
            ).catch(waErr => console.error("Failed to broadcast hot-spot capture notification:", waErr));
          });
        });
        sendWhatsAppMessage("+961700078138", alertMessage).catch(waErr => console.error("Failed to send admin notification:", waErr));
      }

      if (result.status === "INTERRUPTED") {
        logSystemAction("GEONODE_HOTSPOT_DEFENDED", `Faction ${faction} disrupted Faction ${result.opposingFaction}'s capture attempt on Hot-Spot "${node.name}".`);
        const alertMsg = `🛡️ *HELIOS DEFENSE SECURED!* 🛡️\n\nFaction *${faction}* has successfully intercepted and disrupted Faction *${result.opposingFaction}*'s hack on Hot-Spot *"${node.name}"*!\n\nThe zone has been secured.`;
        getOperationHeliosGroupId().then(groupId => {
          sendWhatsAppMessage(groupId, alertMsg).catch(waErr => 
            console.error("[WAHA] Failed to broadcast defense notification:", waErr)
          );
        }).catch(err => console.error("Failed to query group JID:", err));
        return { success: true, message: result.message };
      }

      if (result.status === "PROGRESSING" && result.isNewQueue) {
        const alertMsg = `🚨 *HELIOS SECURITY BREACH: UNDER SIEGE!* 🚨\n\nFaction *${faction}* has initiated a hack on Hot-Spot *"${node.name}"*!\n\nOccupying Faction: *${node.controllingFaction || "NEUTRAL"}*\nTime remaining to defend: *60 seconds*!\nNavigate: https://sdcsaintjeanmarc.space/rovers/nav`;
        getOperationHeliosGroupId().then(groupId => {
          sendWhatsAppMessage(groupId, alertMsg).catch(waErr => 
            console.error("[WAHA] Failed to broadcast siege notification:", waErr)
          );
        }).catch(err => console.error("Failed to query group JID:", err));
        return { success: true, message: result.message };
      } else if (result.status === "BLOCKED" || result.status === "ALREADY_CHECKED_IN") {
        await logSystemAction("GEONODE_HOTSPOT_BLOCKED", `Rover "${session.profile.fullName}" attempted check-in at Hot-Spot "${node.name}", but check-in failed or was blocked: ${result.message}`);
        return { success: false, error: result.message };
      } else {
        return { success: true, message: result.message };
      }

    } catch (err: any) {
      return { success: false, error: err.message || "Failed to check in to Hot-Spot" };
    }
  }

  // Normal node capture path
  try {
    const { alphaCount, bravoCount } = await prisma.$transaction(async (tx) => {
      // Flip control
      await tx.geoNode.update({
        where: { id: nodeId },
        data: { controllingFaction: faction },
      });

      // Award credits to capturing user
      await tx.roverProfile.update({
        where: { profileId: session.profile.id },
        data: { roverCredits: { increment: 50 } }, // 50 credits for capturing a node
      });

      const alpha = await tx.geoNode.count({ where: { controllingFaction: Faction.ALPHA } });
      const bravo = await tx.geoNode.count({ where: { controllingFaction: Faction.BRAVO } });

      return { alphaCount: alpha, bravoCount: bravo };
    }, { timeout: 15000 });

    // Notify all Rovers
    try {
      await broadcastNodeCaptureNotification(
        session.profile.fullName,
        node.name,
        faction,
        alphaCount,
        bravoCount
      );
    } catch (waErr) {
      console.error("[WAHA] Failed to broadcast node capture notification:", waErr);
    }

    await logSystemAction("GEONODE_GPS_CAPTURED", `Rover "${session.profile.fullName}" (${session.profile.id}) captured node "${node.name}" for faction ${faction} via GPS validation.`);
    revalidatePath("/rovers/nav");
    return { success: true, message: `Successfully captured Node: ${node.name} for Faction ${faction}!` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to capture node" };
  }
}

// ==========================================
// ADMIN SERVER ACTIONS
// ==========================================

// Helper to check admin session
async function checkAdminSession() {
  const session = await getRoverSession();
  if (!session || session.profile.role !== "admin") {
    throw new Error("Access Denied: Admin authorization required");
  }
  return session;
}



// 8. Admin Release/Toggle Quest
export async function adminReleaseQuest(questId: string, isReleased: boolean) {
  try {
    await checkAdminSession();

    const quest = await prisma.quest.update({
      where: { id: questId },
      data: { isReleased },
    });

    if (isReleased) {
      // Trigger WhatsApp broadcast to all Rovers
      try {
        await broadcastQuestReleaseNotification(quest.title, quest.creditReward, quest.clueHint);
      } catch (waErr) {
        console.error("[WAHA] Failed to broadcast quest release notification:", waErr);
      }
    }

    revalidatePath("/rovers/admin");
    revalidatePath("/rovers/terminal");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update quest release status" };
  }
}

// 8b. Admin Reveal Blind Quest Results
export async function adminRevealBlindQuestResults(questId: string, correctAnswer: string) {
  try {
    await checkAdminSession();

    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      include: { completions: true }
    });
    if (!quest) return { success: false, error: "Quest not found" };
    if (!quest.isBlind) return { success: false, error: "Quest is not a blind submission challenge" };

    const hashedCorrect = hashAnswer(correctAnswer);

    // Get all submissions for this quest
    const submissions = await prisma.questSubmission.findMany({
      where: { questId },
      include: {
        rover: {
          include: { roverProfile: true }
        }
      }
    });

    // Group submissions by scout ID
    const submissionsByRover: Record<string, typeof submissions> = {};
    submissions.forEach(sub => {
      if (!submissionsByRover[sub.roverId]) {
        submissionsByRover[sub.roverId] = [];
      }
      submissionsByRover[sub.roverId].push(sub);
    });

    let correctCount = 0;
    let incorrectCount = 0;

    for (const roverId of Object.keys(submissionsByRover)) {
      const roverSubs = submissionsByRover[roverId];
      const hasCorrectAnswer = roverSubs.some(sub => sub.answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase());
      
      const scout = roverSubs[0].rover;
      const phone = scout.roverProfile?.phoneNumber;

      if (hasCorrectAnswer) {
        correctCount++;
        // Check if completion already exists
        const existing = await prisma.questCompletion.findUnique({
          where: {
            roverId_questId: {
              roverId,
              questId
            }
          }
        });

        if (!existing) {
          await prisma.$transaction(async (tx) => {
            await tx.questCompletion.create({
              data: {
                roverId,
                questId,
                isVerified: true
              }
            });
            await tx.roverProfile.update({
              where: { profileId: roverId },
              data: { roverCredits: { increment: quest.creditReward } }
            });
          });
        }

        // Notify winner
        if (phone) {
          const successMessage = `🎉 *HELIOS CYBER-INTEGRITY STATUS* 🎉\n\nYour blind submission for *"${quest.title}"* has been decrypted! You got it *CORRECT*! *${quest.creditReward} CR* has been successfully credited to your account.\n\nThank you for securing the timeline.`;
          await sendWhatsAppMessage(phone, successMessage).catch(err => console.error(err));
        }
      } else {
        incorrectCount++;
        // Notify loser
        if (phone) {
          const failMessage = `❌ *HELIOS CYBER-INTEGRITY STATUS* ❌\n\nYour blind submission for *"${quest.title}"* has been decrypted. Unfortunately, your calculations were *INCORRECT*. Keep tracking the timeline for future decrypt keys.`;
          await sendWhatsAppMessage(phone, failMessage).catch(err => console.error(err));
        }
      }
    }

    // Set quest's answer hash and turn off isBlind so it acts like a normal solved quest now
    await prisma.quest.update({
      where: { id: questId },
      data: {
        isBlind: false,
        encryptedAnswerHash: hashedCorrect
      }
    });

    await logSystemAction("ADMIN_BLIND_QUEST_REVEALED", `Admin processed blind quest "${quest.title}" results: ${correctCount} correct, ${incorrectCount} incorrect.`);

    revalidatePath("/rovers/admin");
    revalidatePath("/rovers/terminal");
    return { success: true, correctCount, incorrectCount };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reveal results." };
  }
}

// 9. Admin Approve Leader Sign-Off
export async function adminApproveSignOff(roverId: string, questId: string) {
  try {
    await checkAdminSession();

    const quest = await prisma.quest.findUnique({ where: { id: questId } });
    if (!quest) throw new Error("Quest not found");

    const result = await prisma.$transaction(async (tx) => {
      // Update completion record as verified
      const completion = await tx.questCompletion.upsert({
        where: {
          roverId_questId: {
            roverId,
            questId,
          },
        },
        update: {
          isVerified: true,
        },
        create: {
          roverId,
          questId,
          isVerified: true,
        },
      });

      // Award credits
      await tx.roverProfile.update({
        where: { profileId: roverId },
        data: { roverCredits: { increment: quest.creditReward } },
      });

      return completion;
    }, { timeout: 15000 });

    revalidatePath("/rovers/admin");
    revalidatePath("/rovers/terminal");

    // Fetch rover details to get phone number
    const rover = await prisma.profile.findUnique({
      where: { id: roverId },
      include: { roverProfile: true },
    });

    console.log(`[AuditLog] Admin approved sign-off for Rover "${rover?.fullName}" (${roverId}) for quest "${quest.title}". Reward: +${quest.creditReward} CR.`);
    await logSystemAction("ADMIN_QUEST_APPROVED", `Admin approved sign-off for Rover "${rover?.fullName || roverId}" on quest "${quest.title}". Reward: +${quest.creditReward} CR.`);

    // Notify the rover via WhatsApp
    if (rover?.roverProfile?.phoneNumber) {
      try {
        const message = `✅ *HELIOS MISSION STATUS: APPROVED* ✅\n\nGood work, Rover! Your sign-off request for *"${quest.title}"* has been officially verified by a Troop Leader.\n\n💰 Reward: *+${quest.creditReward} Credits* has been added to your account.`;
        await sendWhatsAppMessage(rover.roverProfile.phoneNumber, message);
      } catch (waErr) {
        console.error("[WAHA] Failed to send approval message to rover:", waErr);
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to approve sign-off" };
  }
}

// 9.5 Admin Decline Leader Sign-Off
export async function adminDeclineSignOff(roverId: string, questId: string, message: string) {
  try {
    await checkAdminSession();

    const quest = await prisma.quest.findUnique({ where: { id: questId } });
    if (!quest) throw new Error("Quest not found");

    // Delete the pending completion record
    await prisma.questCompletion.delete({
      where: {
        roverId_questId: {
          roverId,
          questId,
        },
      },
    });

    revalidatePath("/rovers/admin");
    revalidatePath("/rovers/terminal");

    // Fetch rover details to get phone number
    const rover = await prisma.profile.findUnique({
      where: { id: roverId },
      include: { roverProfile: true },
    });

    console.log(`[AuditLog] Admin declined sign-off for Rover "${rover?.fullName}" (${roverId}) for quest "${quest.title}".`);
    await logSystemAction("ADMIN_QUEST_DECLINED", `Admin declined sign-off for Rover "${rover?.fullName || roverId}" on quest "${quest.title}". Reason: "${message}".`);

    // Notify the rover via WhatsApp
    if (rover?.roverProfile?.phoneNumber) {
      try {
        const alertMessage = `❌ *HELIOS MISSION STATUS: DECLINED* ❌\n\n⚠️ Your Milestone sign-off request for *"${quest.title}"* was declined by a troop leader.\n\n📝 *Feedback / Reason*:\n"${message}"\n\nYou can address the leader's comments and submit your request again in your terminal: https://sdcsaintjeanmarc.org/en/rovers/terminal`;
        await sendWhatsAppMessage(rover.roverProfile.phoneNumber, alertMessage);
      } catch (waErr) {
        console.error("[WAHA] Failed to send decline message to rover:", waErr);
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to decline sign-off" };
  }
}

// 10. Admin Adjust Credits Manually
export async function adminAdjustCredits(roverId: string, amount: number, reason: string) {
  try {
    await checkAdminSession();

    const updated = await prisma.roverProfile.update({
      where: { profileId: roverId },
      data: {
        roverCredits: { increment: amount }, // increment handles positive or negative (deduct) values
      },
    });

    console.log(`[AuditLog] Admin adjusted Rover "${roverId}" credits by ${amount}. Reason: "${reason}". New balance: ${updated.roverCredits} CR.`);
    await logSystemAction("ADMIN_CREDITS_ADJUSTED", `Admin adjusted Rover "${roverId}" credits by ${amount}. Reason: "${reason}". New balance: ${updated.roverCredits} CR.`);

    // Optionally notify the user via WhatsApp about manual adjustments
    if (updated.phoneNumber) {
      try {
        const message = `🛠️ *HELIOS ADMIN: BALANCE ADJUSTMENT* 🛠️\n\n💰 An admin has updated your credits.\n📊 Adjust: ${amount >= 0 ? `+${amount}` : `${amount}`} Credits\n📝 Reason: ${reason}\n\nBalance: ${updated.roverCredits} Credits`;
        await sendWhatsAppMessage(updated.phoneNumber, message);
      } catch (waErr) {
        console.error("[WAHA] Failed to send manual balance adjust alert:", waErr);
      }
    }

    revalidatePath("/rovers/admin");
    revalidatePath("/rovers/terminal");
    revalidatePath("/rovers/shop");
    return { success: true, newCredits: updated.roverCredits };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to adjust credits" };
  }
}

// 11. Update Rover Phone Number
export async function updateRoverPhoneNumber(roverId: string, phoneNumber: string) {
  const session = await getRoverSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const isAdmin = session.profile.role === "admin";
  const isSelf = session.profile.id === roverId;

  if (!isAdmin && !isSelf) {
    return { success: false, error: "Access Denied: Unauthorized to edit this profile" };
  }

  try {
    const updated = await prisma.roverProfile.update({
      where: { profileId: roverId },
      data: {
        phoneNumber: phoneNumber.trim(),
      },
    });

    revalidatePath("/rovers/admin");
    revalidatePath("/rovers/terminal");
    revalidatePath("/rovers/shop");
    revalidatePath("/rovers/nav");
    return { success: true, phoneNumber: updated.phoneNumber };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update phone number" };
  }
}

// 12. Logout Rover
export async function logoutRover() {
  const cookieStore = await cookies();
  cookieStore.set("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
  redirect("/");
}

// 13. Admin Toggle Night Nav Setting
export async function adminToggleNightNav(active: boolean) {
  try {
    await checkAdminSession();

    await prisma.systemSetting.upsert({
      where: { key: "night_nav_active" },
      update: { value: String(active) },
      create: { key: "night_nav_active", value: String(active) },
    });

    await logSystemAction("ADMIN_NIGHT_NAV_TOGGLED", `Admin toggled night navigation status to: ${active}.`);

    revalidatePath("/rovers/admin");
    revalidatePath("/rovers/nav");
    revalidatePath("/rovers/terminal");
    revalidatePath("/rovers/shop");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update Night Nav status" };
  }
}

// 13b. Admin Toggle Lucky Wheel
export async function adminToggleLuckyWheel(active: boolean) {
  try {
    await checkAdminSession();

    await prisma.systemSetting.upsert({
      where: { key: "lucky_wheel_active" },
      update: { value: String(active) },
      create: { key: "lucky_wheel_active", value: String(active) },
    });

    await logSystemAction("ADMIN_LUCKY_WHEEL_TOGGLED", `Admin toggled lucky spin wheel status to: ${active}.`);

    revalidatePath("/rovers/admin");
    revalidatePath("/rovers/shop");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update Lucky Wheel status" };
  }
}

// 13c. Admin Update Capture Perimeter
export async function adminUpdateCapturePerimeter(meters: number) {
  try {
    await checkAdminSession();

    await prisma.systemSetting.upsert({
      where: { key: "capture_perimeter_meters" },
      update: { value: String(meters) },
      create: { key: "capture_perimeter_meters", value: String(meters) },
    });

    await logSystemAction("ADMIN_PERIMETER_UPDATED", `Admin updated GPS capture perimeter to: ${meters} meters.`);

    revalidatePath("/rovers/admin");
    revalidatePath("/rovers/nav");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update capture perimeter." };
  }
}

// 14. Admin Invite User via WhatsApp
export async function adminInviteUser(userId: string, tempPassword?: string) {
  try {
    await checkAdminSession();

    const user = await prisma.profile.findUnique({
      where: { id: userId },
      include: { roverProfile: true },
    });

    if (!user) {
      return { success: false, error: "User not found." };
    }

    const phone = user.roverProfile?.phoneNumber;
    if (!phone) {
      return { success: false, error: "This user does not have a registered WhatsApp number." };
    }

    const passwordMsg = tempPassword ? `*Password:* ${tempPassword}` : `*Password:* (Use the password provided to you by your admin)`;
    const inviteMessage = `⛺ *SDC Saint Jean Marc Portal Invitation* ⛺\n\n` +
      `Hello *${user.fullName}*,\n` +
      `You are invited to log in to the Rovers Portal!\n\n` +
      `🔗 *Portal URL:* https://www.sdcsaintjeanmarc.org/login\n` +
      `📧 *Email:* ${user.email}\n` +
      `${passwordMsg}\n\n` +
      `⚠️ _Note: You will be requested to change your password immediately upon your first login for security reasons._\n\n` +
      `See you on the field! ⛺`;

    await sendWhatsAppMessage(phone, inviteMessage);

    await logSystemAction("ADMIN_INVITE_SENT", `Admin sent portal invitation to scout ${user.fullName} (${user.email}).`);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to send WhatsApp invite" };
  }
}

// 14. Admin Create Rover User
import bcrypt from "bcryptjs";

export async function adminCreateRover(data: {
  email: string;
  fullName: string;
  passwordHex: string;
  role: "scout" | "admin";
  unit?: string | null;
  faction?: Faction | null;
  phoneNumber?: string;
}) {
  try {
    await checkAdminSession();

    const cleanEmail = data.email.trim().toLowerCase();
    
    // Check if user exists
    const existing = await prisma.profile.findUnique({
      where: { email: cleanEmail },
    });
    if (existing) {
      return { success: false, error: "User with this email already exists" };
    }

    const hashedPassword = await bcrypt.hash(data.passwordHex, 10);

    const profile = await prisma.profile.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        fullName: data.fullName.trim(),
        role: data.role,
        unit: data.unit || null,
      },
    });

    if (data.role === "scout") {
      await prisma.roverProfile.create({
        data: {
          profileId: profile.id,
          roverCredits: 0,
          faction: data.faction || null,
          phoneNumber: data.phoneNumber ? data.phoneNumber.trim() : "",
        },
      });
    }

    await logSystemAction("ADMIN_USER_CREATED", `Admin created user "${profile.fullName}" with role "${profile.role}".`);

    revalidatePath("/rovers/admin");
    return { success: true, roverId: profile.id };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create user" };
  }
}

// 15. Admin Create Challenge (Quest)
export async function adminCreateQuest(data: {
  title: string;
  description: string;
  clueHint?: string | null;
  verificationType: VerificationType;
  answerCode?: string;
  creditReward: number;
  unlockedAtDate: string; // ISO string
  expiresAt?: string | null; // ISO string or null
  phase: QuestPhase;
  isReleased: boolean;
  isBlind?: boolean;
}) {
  try {
    await checkAdminSession();

    let encryptedAnswerHash = null;
    if (data.verificationType === VerificationType.DIGITAL_CODE && data.answerCode) {
      encryptedAnswerHash = hashAnswer(data.answerCode);
    }

    const quest = await prisma.quest.create({
      data: {
        title: data.title.trim(),
        description: data.description.trim(),
        clueHint: data.clueHint ? data.clueHint.trim() : null,
        verificationType: data.verificationType,
        encryptedAnswerHash,
        creditReward: Number(data.creditReward),
        isBlind: !!data.isBlind,
        unlockedAtDate: new Date(data.unlockedAtDate),
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        phase: data.phase,
        isReleased: data.isReleased,
      },
    });

    const campNow = new Date(Date.now() + 3 * 60 * 60 * 1000);
    if (data.isReleased && new Date(data.unlockedAtDate) <= campNow) {
      // Trigger WhatsApp broadcast if released and already unlocked
      try {
        await broadcastQuestReleaseNotification(quest.title, quest.creditReward, quest.clueHint);
      } catch (waErr) {
        console.error("[WAHA] Failed to broadcast quest release notification:", waErr);
      }
    }

    await logSystemAction("ADMIN_QUEST_CREATED", `Admin created challenge "${quest.title}" rewarding ${quest.creditReward} CR.`);

    revalidatePath("/rovers/admin");
    revalidatePath("/rovers/terminal");
    return { success: true, questId: quest.id };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create challenge" };
  }
}

// 16. Admin Close Auction Item and Award to Highest Bidder
export async function adminCloseAuction(itemId: string) {
  try {
    await checkAdminSession();

    // Fetch the shop item and highest bidder profile details
    const item = await prisma.shopItem.findUnique({
      where: { id: itemId },
      include: {
        highestBidder: {
          include: {
            roverProfile: true,
          },
        },
      },
    });

    if (!item) throw new Error("Item not found");
    if (item.type !== ShopItemType.AUCTION) throw new Error("Item is not an auction");
    if (!item.isAvailable) throw new Error("Auction is already closed");

    // Close auction item
    await prisma.shopItem.update({
      where: { id: itemId },
      data: { isAvailable: false },
    });

    const winner = item.highestBidder;
    const finalBid = item.priceOrCurrentBid;
    const leaderPhone = "+96170078138";

    console.log(`[AuditLog] Admin closed auction for item "${item.title}" (${itemId}). Winner: "${winner?.fullName || "None"}". Final Bid: ${finalBid} CR.`);
    await logSystemAction("MARKETPLACE_AUCTION_CLOSED", `Admin closed auction for item "${item.title}". Winner: "${winner?.fullName || "None"}". Final Bid: ${finalBid} CR.`);

    if (winner) {
      // Create ShopPurchase record
      await prisma.shopPurchase.create({
        data: {
          shopItemId: itemId,
          roverId: winner.id,
          pricePaid: finalBid,
          isDelivered: false
        }
      });

      // 1. Notify the winner
      if (winner.roverProfile?.phoneNumber) {
        try {
          const winnerMessage = `🎉 *HELIOS MARKETPLACE: AUCTION WON* 🎉\n\nCongratulations! You won the auction for *"${item.title}"* with a final bid of *${finalBid} CR*.\n\nYour item has been successfully awarded! Contact leaders to redeem.`;
          await sendWhatsAppMessage(winner.roverProfile.phoneNumber, winnerMessage);
        } catch (waErr) {
          console.error("[WAHA] Failed to notify auction winner:", waErr);
        }
      }

      // 2. Notify the leader
      try {
        const leaderMessage = `📦 *HELIOS MARKETPLACE: AUCTION CLOSED* 📦\n\nAuction for *"${item.title}"* has been officially closed by an Admin.\n🏆 Winner: *${winner.fullName}*\n💰 Final Bid: *${finalBid} CR*`;
        await sendWhatsAppMessage(leaderPhone, leaderMessage);
      } catch (waErr) {
        console.error("[WAHA] Failed to notify leader about closed auction:", waErr);
      }
    } else {
      // Notify the leader that auction was closed with no bids
      try {
        const leaderMessage = `📦 *HELIOS MARKETPLACE: AUCTION CLOSED* 📦\n\nAuction for *"${item.title}"* was closed with no bids placed.`;
        await sendWhatsAppMessage(leaderPhone, leaderMessage);
      } catch (waErr) {
        console.error("[WAHA] Failed to notify leader about closed empty auction:", waErr);
      }
    }

    revalidatePath("/rovers/shop");
    revalidatePath("/rovers/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to close auction" };
  }
}

// 17. Admin Delete Quest
export async function adminDeleteQuest(questId: string) {
  try {
    await checkAdminSession();

    // Delete completions first to maintain database integrity
    await prisma.questCompletion.deleteMany({
      where: { questId },
    });

    await prisma.quest.delete({
      where: { id: questId },
    });

    await logSystemAction("ADMIN_QUEST_DELETED", `Admin deleted challenge ID: "${questId}".`);

    revalidatePath("/rovers/admin");
    revalidatePath("/rovers/terminal");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete quest" };
  }
}

// 18. Admin Update Quest
export async function adminUpdateQuest(
  questId: string,
  data: {
    title: string;
    description: string;
    clueHint: string | null;
    verificationType: "DIGITAL_CODE" | "LEADER_SIGN_OFF";
    answerCode?: string;
    creditReward: number;
    unlockedAtDate: string;
    expiresAt?: string | null;
    phase: "PRE_CAMP" | "LIVE_CAMP";
    isReleased: boolean;
    isBlind?: boolean;
  }
) {
  try {
    await checkAdminSession();

    const encryptedAnswerHash = data.answerCode ? hashAnswer(data.answerCode) : undefined;

    await prisma.quest.update({
      where: { id: questId },
      data: {
        title: data.title.trim(),
        description: data.description.trim(),
        clueHint: data.clueHint ? data.clueHint.trim() : null,
        verificationType: data.verificationType,
        ...(encryptedAnswerHash ? { encryptedAnswerHash } : {}),
        creditReward: Number(data.creditReward),
        isBlind: !!data.isBlind,
        unlockedAtDate: new Date(data.unlockedAtDate),
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        phase: data.phase,
        isReleased: data.isReleased,
      },
    });

    await logSystemAction("ADMIN_QUEST_UPDATED", `Admin updated challenge "${data.title}" (ID: ${questId}).`);

    revalidatePath("/rovers/admin");
    revalidatePath("/rovers/terminal");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update quest" };
  }
}

// 19. Admin Create Shop Item
export async function adminCreateShopItem(data: {
  title: string;
  description: string;
  type: "FIXED_PRICE" | "AUCTION";
  priceOrCurrentBid: number;
  stock: number;
  isAvailable: boolean;
  hintText?: string;
}) {
  try {
    await checkAdminSession();

    const item = await prisma.shopItem.create({
      data: {
        title: data.title.trim(),
        description: data.description.trim(),
        type: data.type,
        priceOrCurrentBid: Number(data.priceOrCurrentBid),
        stock: Number(data.stock),
        isAvailable: data.isAvailable,
        hintText: data.hintText?.trim() || null,
      },
    });

    await logSystemAction("ADMIN_SHOP_ITEM_CREATED", `Admin created shop item "${item.title}".`);

    revalidatePath("/rovers/shop");
    revalidatePath("/rovers/admin");
    return { success: true, itemId: item.id };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create shop item" };
  }
}

// 20. Admin Update Shop Item
export async function adminUpdateShopItem(
  itemId: string,
  data: {
    title: string;
    description: string;
    type: "FIXED_PRICE" | "AUCTION";
    priceOrCurrentBid: number;
    stock: number;
    isAvailable: boolean;
    hintText?: string;
  }
) {
  try {
    await checkAdminSession();

    await prisma.shopItem.update({
      where: { id: itemId },
      data: {
        title: data.title.trim(),
        description: data.description.trim(),
        type: data.type,
        priceOrCurrentBid: Number(data.priceOrCurrentBid),
        stock: Number(data.stock),
        isAvailable: data.isAvailable,
        hintText: data.hintText?.trim() || null,
      },
    });

    await logSystemAction("ADMIN_SHOP_ITEM_UPDATED", `Admin updated shop item "${data.title}" (ID: ${itemId}).`);

    revalidatePath("/rovers/shop");
    revalidatePath("/rovers/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update shop item" };
  }
}

// 21. Admin Delete ShopItem
export async function adminDeleteShopItem(itemId: string) {
  try {
    await checkAdminSession();

    await prisma.shopItem.delete({
      where: { id: itemId },
    });

    await logSystemAction("ADMIN_SHOP_ITEM_DELETED", `Admin deleted shop item with ID "${itemId}".`);

    revalidatePath("/rovers/shop");
    revalidatePath("/rovers/admin");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete shop item" };
  }
}

// 22. Admin Update Rover Profile / User Account
export async function adminUpdateRover(
  userId: string,
  data: {
    fullName: string;
    email: string;
    role: string;
    unit?: string | null;
    faction?: "ALPHA" | "BRAVO" | null;
    phoneNumber?: string;
    password?: string;
  }
) {
  try {
    await checkAdminSession();

    const updateData: any = {
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      role: data.role,
      unit: data.unit ? data.unit.trim() : null,
    };

    if (data.password && data.password.trim() !== "") {
      updateData.password = await bcrypt.hash(data.password.trim(), 10);
      updateData.mustChangePassword = true;
    }

    // 1. Update Profile (auth record)
    await prisma.profile.update({
      where: { id: userId },
      data: updateData,
    });

    // 2. Update RoverProfile details if they exist and user is scout
    if (data.role === "scout") {
      await prisma.roverProfile.upsert({
        where: { profileId: userId },
        update: {
          faction: data.faction || null,
          phoneNumber: data.phoneNumber ? data.phoneNumber.trim() : "",
        },
        create: {
          profileId: userId,
          faction: data.faction || null,
          phoneNumber: data.phoneNumber ? data.phoneNumber.trim() : "",
          roverCredits: 0,
        },
      });
    }

    await logSystemAction("ADMIN_USER_UPDATED", `Admin updated profile for user "${data.fullName}" (ID: ${userId}).`);

    revalidatePath("/rovers/admin");
    revalidatePath("/rovers/terminal");
    revalidatePath("/rovers/shop");
    revalidatePath("/rovers/nav");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update user account" };
  }
}

// 23. Admin Delete Rover / User Account
export async function adminDeleteRover(userId: string) {
  try {
    await checkAdminSession();

    // Delete related records that don't cascade automatically, if any
    await prisma.questCompletion.deleteMany({
      where: { roverId: userId },
    });

    // Note: Profile deletion will cascade delete RoverProfile due to onDelete: Cascade
    await prisma.profile.delete({
      where: { id: userId },
    });

    await logSystemAction("ADMIN_USER_DELETED", `Admin deleted user account ID: "${userId}".`);

    revalidatePath("/rovers/admin");
    revalidatePath("/rovers/terminal");
    revalidatePath("/rovers/shop");
    revalidatePath("/rovers/nav");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete user account" };
  }
}

// 24. Admin Spawn Hot-Spot
export async function adminSpawnHotSpot(name: string, lat?: number, lng?: number, isHotSpot: boolean = true) {
  try {
    await checkAdminSession();

    let finalLat = lat;
    let finalLng = lng;

    if (finalLat === undefined || finalLng === undefined) {
      // Bounding box for SDC Jaj Campsite
      const minLat = 34.1190;
      const maxLat = 34.1250;
      const minLng = 35.6450;
      const maxLng = 35.6520;

      finalLat = Math.random() * (maxLat - minLat) + minLat;
      finalLng = Math.random() * (maxLng - minLng) + minLng;
    }

    const nodeName = name.trim() || `🚨 HOT-ZONE ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;

    const hotspotNode = await prisma.geoNode.create({
      data: {
        name: nodeName,
        latitude: finalLat,
        longitude: finalLng,
        radiusMeters: 25,
        secretPasscode: "HOTSPOT_" + Math.random().toString(36).substring(7).toUpperCase(),
        controllingFaction: null,
        isHotSpot: isHotSpot,
      },
    });

    await logSystemAction("ADMIN_HOTSPOT_SPAWNED", `Admin spawned Hot-Spot "${nodeName}" at coords: ${finalLat.toFixed(6)}, ${finalLng.toFixed(6)}.`);

    // Dispatch WhatsApp Broadcast Notification
    try {
      const alertMsg = `🚨 *HELIOS TACTICAL UPDATE: HOT-ZONE SPAWNED!* 🚨\n\nA new active capture point *"${nodeName}"* has been established!\n📍 Coords: *${finalLat.toFixed(6)}, ${finalLng.toFixed(6)}*\n\n🔥 Faction members must check in within 20s of each other to secure it. Opposing presence resets queue!\nNavigate: https://maps.google.com/?q=${finalLat.toFixed(6)},${finalLng.toFixed(6)}`;
      const groupId = await getOperationHeliosGroupId();
      await sendWhatsAppMessage(groupId, alertMsg);
    } catch (waErr) {
      console.error("[WAHA] Failed to broadcast hotspot spawn:", waErr);
    }

    revalidatePath("/rovers/admin");
    revalidatePath("/rovers/nav");
    revalidatePath("/rovers/terminal");

    return { success: true, node: hotspotNode };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to spawn hot-spot" };
  }
}

// 25. Admin Clear Hot-Spots
export async function adminClearHotSpots() {
  try {
    await checkAdminSession();

    // Delete check-ins first
    await prisma.nodeCheckIn.deleteMany({});
    
    // Delete hot spots
    const deleteRes = await prisma.geoNode.deleteMany({
      where: { isHotSpot: true }
    });

    await logSystemAction("ADMIN_HOTSPOTS_CLEARED", `Admin cleared all active Hot-Spots (${deleteRes.count} removed).`);

    revalidatePath("/rovers/admin");
    revalidatePath("/rovers/nav");
    revalidatePath("/rovers/terminal");

    return { success: true, count: deleteRes.count };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to clear hot-spots" };
  }
}

// 26. Change Password on First Login
export async function changeRoverPassword(newPasswordHex: string) {
  const session = await getRoverSession();
  if (!session) return { success: false, error: "Unauthorized" };

  if (newPasswordHex.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  const hashedPassword = await bcrypt.hash(newPasswordHex, 10);

  await prisma.profile.update({
    where: { id: session.profile.id },
    data: {
      password: hashedPassword,
      mustChangePassword: false,
    },
  });

  revalidatePath("/rovers");
  return { success: true };
}

// 27. Admin Batch Import/Mass Upload Profiles
export async function adminMassUploadRovers(usersList: {
  fullName: string;
  email: string;
  passwordHex: string;
  role: "scout" | "admin";
  unit?: string | null;
  faction?: "ALPHA" | "BRAVO" | null;
  phoneNumber?: string | null;
}[]) {
  try {
    await checkAdminSession();

    if (!Array.isArray(usersList) || usersList.length === 0) {
      return { success: false, error: "Empty or invalid users list." };
    }

    let createdCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const item of usersList) {
      try {
        const cleanEmail = item.email.trim().toLowerCase();
        if (!cleanEmail || !item.fullName) {
          skippedCount++;
          errors.push(`Row missing email or name`);
          continue;
        }

        const existing = await prisma.profile.findUnique({
          where: { email: cleanEmail },
        });

        if (existing) {
          skippedCount++;
          errors.push(`"${cleanEmail}" already exists`);
          continue;
        }

        // Default password if none provided is sdc123456
        const defaultPassword = item.passwordHex || "sdc123456";
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const profile = await prisma.profile.create({
          data: {
            email: cleanEmail,
            password: hashedPassword,
            fullName: item.fullName.trim(),
            role: item.role === "admin" ? "admin" : "scout",
            unit: item.unit ? String(item.unit).trim() : null,
            mustChangePassword: true,
          },
        });

        if (profile.role === "scout") {
          await prisma.roverProfile.create({
            data: {
              profileId: profile.id,
              roverCredits: 0,
              faction: item.faction || null,
              phoneNumber: item.phoneNumber ? String(item.phoneNumber).trim() : "",
            },
          });
        }

        createdCount++;
      } catch (rowErr: any) {
        skippedCount++;
        errors.push(`Error on "${item.email}": ${rowErr.message || "Unknown error"}`);
      }
    }

    await logSystemAction(
      "ADMIN_MASS_UPLOAD",
      `Admin batch imported users. Success: ${createdCount}, Skipped/Error: ${skippedCount}.`
    );

    revalidatePath("/rovers/admin");
    return { success: true, createdCount, skippedCount, errors };
  } catch (err: any) {
    return { success: false, error: err.message || "Mass upload operation failed" };
  }
}

// 28. Admin Batch Import Quests
export async function adminMassUploadQuests(questsList: {
  title: string;
  creditReward: number;
  description: string;
  clueHint?: string | null;
  verificationType: "DIGITAL_CODE" | "LEADER_SIGN_OFF";
  answerCode?: string | null;
  unlockedAtDate: string;
  expiresAt?: string | null;
}[]) {
  try {
    await checkAdminSession();

    if (!Array.isArray(questsList) || questsList.length === 0) {
      return { success: false, error: "Empty or invalid quests list." };
    }

    let createdCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const item of questsList) {
      try {
        if (!item.title.trim()) {
          skippedCount++;
          errors.push(`Row missing title`);
          continue;
        }

        let encryptedAnswerHash: string | null = null;
        if (item.verificationType === "DIGITAL_CODE" && item.answerCode) {
          encryptedAnswerHash = hashAnswer(item.answerCode);
        }

        await prisma.quest.create({
          data: {
            title: item.title.trim(),
            description: item.description.trim(),
            clueHint: item.clueHint ? item.clueHint.trim() : null,
            verificationType: item.verificationType,
            encryptedAnswerHash,
            creditReward: Number(item.creditReward),
            unlockedAtDate: new Date(item.unlockedAtDate),
            expiresAt: item.expiresAt ? new Date(item.expiresAt) : null,
            phase: "PRE_CAMP",
            isReleased: true,
          },
        });

        createdCount++;
      } catch (rowErr: any) {
        skippedCount++;
        errors.push(`Error on "${item.title}": ${rowErr.message || "Unknown error"}`);
      }
    }

    await logSystemAction(
      "ADMIN_MASS_UPLOAD_QUESTS",
      `Admin batch imported quests. Success: ${createdCount}, Skipped: ${skippedCount}.`
    );

    revalidatePath("/rovers/admin");
    revalidatePath("/rovers/terminal");
    return { success: true, createdCount, skippedCount, errors };
  } catch (err: any) {
    return { success: false, error: err.message || "Mass upload operation failed" };
  }
}

// 29. Admin Batch Import Shop Items
export async function adminMassUploadShopItems(itemsList: {
  title: string;
  price: number;
  description: string;
  type: "FIXED_PRICE" | "AUCTION";
  stock: number;
}[]) {
  try {
    await checkAdminSession();

    if (!Array.isArray(itemsList) || itemsList.length === 0) {
      return { success: false, error: "Empty or invalid shop items list." };
    }

    let createdCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const item of itemsList) {
      try {
        if (!item.title.trim()) {
          skippedCount++;
          errors.push(`Row missing title`);
          continue;
        }

        await prisma.shopItem.create({
          data: {
            title: item.title.trim(),
            description: item.description.trim(),
            priceOrCurrentBid: Number(item.price),
            type: item.type,
            stock: Number(item.stock),
            isAvailable: true,
          },
        });

        createdCount++;
      } catch (rowErr: any) {
        skippedCount++;
        errors.push(`Error on "${item.title}": ${rowErr.message || "Unknown error"}`);
      }
    }

    await logSystemAction(
      "ADMIN_MASS_UPLOAD_SHOP_ITEMS",
      `Admin batch imported shop items. Success: ${createdCount}, Skipped: ${skippedCount}.`
    );

    revalidatePath("/rovers/admin");
    revalidatePath("/rovers/shop");
    return { success: true, createdCount, skippedCount, errors };
  } catch (err: any) {
    return { success: false, error: err.message || "Mass upload operation failed" };
  }
}

// 12. Fetch Live Coordinates & Countdown Status
export async function getLiveGeoNodes() {
  const session = await getRoverSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const now = new Date();
  const windowStart = new Date(now.getTime() - 60000); // 60s window

  try {
    const thresholdSetting = await prisma.systemSetting.findUnique({
      where: { key: "hotspot_scout_threshold" }
    });
    const overrideThreshold = thresholdSetting ? parseInt(thresholdSetting.value, 10) : null;
    const hasOverride = overrideThreshold !== null && !isNaN(overrideThreshold);

    // Get all active check-ins within the 60 seconds window
    const allCheckIns = await prisma.nodeCheckIn.findMany({
      where: {
        createdAt: { gte: windowStart }
      },
      orderBy: { createdAt: "asc" }
    });

    // Cleanup expired decoy nodes
    await prisma.geoNode.deleteMany({
      where: {
        isDecoy: true,
        expiresAt: { lt: now }
      }
    });

    const nodes = await prisma.geoNode.findMany({
      where: {
        OR: [
          { isDecoy: false },
          {
            isDecoy: true,
            expiresAt: { gte: now }
          }
        ]
      },
      orderBy: { name: "asc" },
    });

    const alphaScouts = await prisma.roverProfile.count({
      where: { faction: "ALPHA" }
    });
    const bravoScouts = await prisma.roverProfile.count({
      where: { faction: "BRAVO" }
    });

    const nodesWithStatus = nodes.map(node => {
      const nodeCheckIns = allCheckIns.filter(c => c.nodeId === node.id);
      
      let activeFaction: string | null = null;
      let activeCount = 0;
      let remainingSeconds = 0;
      let checkedInRovers: string[] = [];
      const defaultReq = nodeCheckIns[0]?.faction === "ALPHA" ? Math.max(1, alphaScouts) : Math.max(1, bravoScouts);
      const requiredCount = hasOverride ? overrideThreshold : defaultReq;

      if (nodeCheckIns.length > 0) {
        activeFaction = nodeCheckIns[0].faction;
        const factionCheckIns = nodeCheckIns.filter(c => c.faction === activeFaction);
        activeCount = new Set(factionCheckIns.map(c => c.roverId)).size;
        checkedInRovers = Array.from(new Set(factionCheckIns.map(c => c.roverId)));
        
        const oldestCheckInTime = nodeCheckIns[0].createdAt.getTime();
        const elapsed = now.getTime() - oldestCheckInTime;
        remainingSeconds = Math.max(0, Math.ceil((60000 - elapsed) / 1000));
      }

      return {
        id: node.id,
        name: node.name,
        latitude: node.latitude,
        longitude: node.longitude,
        radiusMeters: node.radiusMeters,
        controllingFaction: node.controllingFaction,
        isHotSpot: node.isHotSpot,
        secretPasscode: node.secretPasscode,
        isDecoy: node.isDecoy,
        expiresAt: node.expiresAt,
        shieldExpiresAt: node.shieldExpiresAt,
        activeFaction,
        activeCount,
        requiredCount,
        remainingSeconds,
        checkedInRovers
      };
    });

    return {
      success: true,
      nodes: nodesWithStatus,
      alphaScouts,
      bravoScouts
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch live nodes" };
  }
}

// 27. Get Operation Helios Group ID from settings
export async function adminGetOperationHeliosGroup() {
  try {
    await checkAdminSession();
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "operation_helios_group_id" },
    });
    // live: 120363409250032589@g.us
    // test: 120363410563591186@g.us
    return { success: true, groupId: setting?.value || "120363410563591186@g.us" };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch group ID" };
  }
}

// 28. Send Quest Reminder WhatsApp message to group
export async function adminSendQuestReminder(questId: string, groupId: string) {
  try {
    await checkAdminSession();

    const quest = await prisma.quest.findUnique({ where: { id: questId } });
    if (!quest) throw new Error("Quest not found");

    if (!groupId || !groupId.trim()) {
      throw new Error("Group Chat ID is required");
    }

    // Save the group ID for future usage
    await prisma.systemSetting.upsert({
      where: { key: "operation_helios_group_id" },
      update: { value: groupId.trim() },
      create: { key: "operation_helios_group_id", value: groupId.trim() },
    });

    const message = `🔔 *HELIOS MISSION REMINDER* 🔔\n\n📢 Rovers! Don't forget to complete the active challenge: *"${quest.title}"*!\n💰 Reward: *${quest.creditReward} Credits*\n${quest.clueHint ? `🔍 Clue Hint: ${quest.clueHint}\n` : ""}\nLog in to your Helios Terminal and submit the decryption key: https://sdcsaintjeanmarc.org/en/rovers/terminal`;

    const success = await sendWhatsAppMessage(groupId.trim(), message);
    if (!success) {
      throw new Error("Failed to send WhatsApp message. Please verify gateway logs.");
    }

    await logSystemAction(
      "ADMIN_QUEST_REMINDER_SENT",
      `Admin sent quest reminder for "${quest.title}" to group "${groupId.trim()}".`
    );

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to send reminder" };
  }
}

// 29. Admin Update Hotspot Capture Threshold override
export async function adminUpdateHotspotThreshold(threshold: number | null) {
  try {
    await checkAdminSession();
    if (threshold === null || isNaN(threshold)) {
      await prisma.systemSetting.deleteMany({
        where: { key: "hotspot_scout_threshold" }
      });
    } else {
      await prisma.systemSetting.upsert({
        where: { key: "hotspot_scout_threshold" },
        update: { value: String(threshold) },
        create: { key: "hotspot_scout_threshold", value: String(threshold) },
      });
    }
    revalidatePath("/rovers/admin");
    revalidatePath("/rovers/nav");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update threshold setting" };
  }
}

// 29b. Admin Update Hotspot Cooldown
export async function adminUpdateHotspotCooldown(cooldownHours: number | null) {
  try {
    await checkAdminSession();
    if (cooldownHours === null || isNaN(cooldownHours)) {
      await prisma.systemSetting.deleteMany({
        where: { key: "hotspot_cooldown_hours" }
      });
    } else {
      await prisma.systemSetting.upsert({
        where: { key: "hotspot_cooldown_hours" },
        update: { value: String(cooldownHours) },
        create: { key: "hotspot_cooldown_hours", value: String(cooldownHours) },
      });
    }
    revalidatePath("/rovers/admin");
    revalidatePath("/rovers/nav");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update cooldown setting" };
  }
}


// 30. Admin Get Item Purchase History
export async function adminGetItemPurchaseHistory(itemTitle: string) {
  try {
    await checkAdminSession();
    const logs = await prisma.whatsAppLog.findMany({
      where: {
        phone: "SYSTEM",
        body: "MARKETPLACE_PURCHASE",
        error: {
          contains: `purchased item "${itemTitle}"`
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return { success: true, logs };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch purchase history" };
  }
}

// 31. Admin Send Leaderboard Update to WhatsApp Group
export async function adminSendLeaderboardUpdate() {
  try {
    await checkAdminSession();

    // Query leaderboard
    const leaderboard = await prisma.roverProfile.findMany({
      orderBy: [
        { roverCredits: "desc" },
        { updatedAt: "asc" }
      ],
      include: { profile: true },
      where: { faction: { not: null } }
    });

    const alphaTotal = leaderboard
      .filter((l) => l.faction === "ALPHA")
      .reduce((sum, current) => sum + current.roverCredits, 0);

    const bravoTotal = leaderboard
      .filter((l) => l.faction === "BRAVO")
      .reduce((sum, current) => sum + current.roverCredits, 0);

    // Build leaderboard message
    let message = `🏆 *HELIOS LEADERBOARD STATUS UPDATE* 🏆\n\n`;
    message += `📊 *Faction Stats:*\n🔴 ALPHA: *${alphaTotal} CR*\n🔵 BRAVO: *${bravoTotal} CR*\n\n`;
    message += `🥇 *Scout Rankings (Full Leaderboard):*\n`;

    leaderboard.forEach((rover, index) => {
      const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🔸";
      message += `${medal} ${index + 1}. *${rover.profile.fullName}* (${rover.faction}): *${rover.roverCredits} CR*\n`;
    });

    message += `\nKeep completing missions to earn points for your faction! 🚀\n🌐 View full rankings here: https://sdcsaintjeanmarc.org/en/rovers/leaderboard`;

    const groupId = await getOperationHeliosGroupId();
    await sendWhatsAppMessage(groupId, message);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to broadcast leaderboard update" };
  }
}

// 31b. Admin Get User Credit Transaction History
export async function adminGetUserPointHistory(userId: string) {
  try {
    await checkAdminSession();

    // 1. Fetch Quest Completions
    const completions = await prisma.questCompletion.findMany({
      where: { roverId: userId, isVerified: true },
      include: { quest: true },
      orderBy: { completedAt: "desc" },
    });

    // 2. Fetch Shop Purchases
    const purchases = await prisma.shopPurchase.findMany({
      where: { roverId: userId },
      include: { shopItem: true },
      orderBy: { createdAt: "desc" },
    });

    // 3. Fetch manual admin adjustments, node captures, and wheel spins from whatsAppLog system logs
    const userProfile = await prisma.profile.findUnique({
      where: { id: userId }
    });

    const logs = await prisma.whatsAppLog.findMany({
      where: {
        phone: "SYSTEM",
        body: { in: ["ADMIN_CREDITS_ADJUSTED", "GEONODE_CAPTURED", "GEONODE_GPS_CAPTURED", "LUCKY_WHEEL_SPIN"] },
        OR: [
          { error: { contains: userId } },
          ...(userProfile ? [{ error: { contains: userProfile.fullName } }] : [])
        ]
      },
      orderBy: { createdAt: "desc" }
    });

    // Map and combine them into a single timeline
    const history: Array<{
      id: string | number;
      type: "QUEST" | "PURCHASE" | "ADJUSTMENT" | "CAPTURE";
      description: string;
      change: number;
      timestamp: Date;
    }> = [];

    // Add Quest Completions
    completions.forEach((c) => {
      history.push({
        id: c.id,
        type: "QUEST",
        description: `Quest completed: ${c.quest.title}`,
        change: c.quest.creditReward,
        timestamp: c.completedAt,
      });
    });

    // Add Purchases
    purchases.forEach((p) => {
      history.push({
        id: p.id,
        type: "PURCHASE",
        description: `Purchased from Shop: ${p.shopItem.title}`,
        change: -p.pricePaid,
        timestamp: p.createdAt,
      });
    });

    // Add Logs (Adjustments / Captures / Wheel Spins)
    logs.forEach((log) => {
      if (log.body === "ADMIN_CREDITS_ADJUSTED") {
        // Try parsing the amount
        // Details look like: Admin adjusted Rover "..." credits by [amount]. Reason: "[reason]"...
        const amountMatch = log.error?.match(/credits by (-?\d+)/);
        const reasonMatch = log.error?.match(/Reason: "([^"]+)"/);
        const amount = amountMatch ? parseInt(amountMatch[1], 10) : 0;
        const reason = reasonMatch ? reasonMatch[1] : "Manual admin adjustment";

        history.push({
          id: log.id,
          type: "ADJUSTMENT",
          description: `Admin Adjustment: ${reason}`,
          change: amount,
          timestamp: log.createdAt,
        });
      } else if (log.body === "GEONODE_CAPTURED" || log.body === "GEONODE_GPS_CAPTURED") {
        // Extract node name
        const nodeMatch = log.error?.match(/node "([^"]+)"/);
        const nodeName = nodeMatch ? nodeMatch[1] : "Unknown Node";

        history.push({
          id: log.id,
          type: "CAPTURE",
          description: `Captured Sector: ${nodeName}`,
          change: 50,
          timestamp: log.createdAt,
        });
      } else if (log.body === "LUCKY_WHEEL_SPIN") {
        const costMatch = log.error?.match(/paid (\d+) CR/);
        const spinCost = costMatch ? parseInt(costMatch[1], 10) : 50;

        history.push({
          id: `${log.id}-spin`,
          type: "PURCHASE",
          description: "Spun the Cyber-Wheel (Cost)",
          change: -spinCost,
          timestamp: log.createdAt,
        });

        const wonMatch = log.error?.match(/Won \+(\d+) CR/);
        const wonAmount = wonMatch ? parseInt(wonMatch[1], 10) : 0;
        if (wonAmount > 0) {
          history.push({
            id: `${log.id}-win`,
            type: "QUEST",
            description: "Won credits on Cyber-Wheel",
            change: wonAmount,
            timestamp: log.createdAt,
          });
        }
      }
    });

    // Sort by timestamp descending
    history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return { success: true, history };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch points history" };
  }
}

// 31b. Get Scout own point history
export async function getScoutPointHistory() {
  const session = await getRoverSession();
  if (!session) return { success: false, error: "Unauthorized" };
  const userId = session.profile.id;

  try {
    const completions = await prisma.questCompletion.findMany({
      where: { roverId: userId, isVerified: true },
      include: { quest: true },
      orderBy: { completedAt: "desc" },
    });

    const purchases = await prisma.shopPurchase.findMany({
      where: { roverId: userId },
      include: { shopItem: true },
      orderBy: { createdAt: "desc" },
    });

    const userProfile = await prisma.profile.findUnique({
      where: { id: userId }
    });

    const logs = await prisma.whatsAppLog.findMany({
      where: {
        phone: "SYSTEM",
        body: { in: ["ADMIN_CREDITS_ADJUSTED", "GEONODE_CAPTURED", "GEONODE_GPS_CAPTURED", "LUCKY_WHEEL_SPIN"] },
        OR: [
          { error: { contains: userId } },
          ...(userProfile ? [{ error: { contains: userProfile.fullName } }] : [])
        ]
      },
      orderBy: { createdAt: "desc" }
    });

    const history: Array<{
      id: string | number;
      type: "QUEST" | "PURCHASE" | "ADJUSTMENT" | "CAPTURE";
      description: string;
      change: number;
      timestamp: Date;
    }> = [];

    completions.forEach((c) => {
      history.push({
        id: c.id,
        type: "QUEST",
        description: `Quest completed: ${c.quest.title}`,
        change: c.quest.creditReward,
        timestamp: c.completedAt,
      });
    });

    purchases.forEach((p) => {
      history.push({
        id: p.id,
        type: "PURCHASE",
        description: `Purchased from Shop: ${p.shopItem.title}`,
        change: -p.pricePaid,
        timestamp: p.createdAt,
      });
    });

    logs.forEach((log) => {
      if (log.body === "ADMIN_CREDITS_ADJUSTED") {
        const valMatch = log.error?.match(/by (-?\d+)/);
        const change = valMatch ? parseInt(valMatch[1], 10) : 0;
        history.push({
          id: log.id,
          type: "ADJUSTMENT",
          description: "System credits adjustment by Command",
          change,
          timestamp: log.createdAt,
        });
      } else if (log.body === "GEONODE_CAPTURED" || log.body === "GEONODE_GPS_CAPTURED") {
        const nodeMatch = log.error?.match(/node "([^"]+)"/);
        const nodeName = nodeMatch ? nodeMatch[1] : "Unknown Node";
        history.push({
          id: log.id,
          type: "CAPTURE",
          description: `Captured Sector: ${nodeName}`,
          change: 50,
          timestamp: log.createdAt,
        });
      } else if (log.body === "LUCKY_WHEEL_SPIN") {
        const costMatch = log.error?.match(/paid (\d+) CR/);
        const spinCost = costMatch ? parseInt(costMatch[1], 10) : 50;

        history.push({
          id: `${log.id}-spin`,
          type: "PURCHASE",
          description: "Spun the Cyber-Wheel (Cost)",
          change: -spinCost,
          timestamp: log.createdAt,
        });

        const wonMatch = log.error?.match(/Won \+(\d+) CR/);
        const wonAmount = wonMatch ? parseInt(wonMatch[1], 10) : 0;
        if (wonAmount > 0) {
          history.push({
            id: `${log.id}-win`,
            type: "QUEST",
            description: "Won credits on Cyber-Wheel",
            change: wonAmount,
            timestamp: log.createdAt,
          });
        }
      }
    });

    history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return { success: true, history };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch points history" };
  }
}


// 32. Admin Get All Quest Completions Flat List
export async function adminGetQuestCompletions() {
  try {
    await checkAdminSession();
    const completions = await prisma.questCompletion.findMany({
      include: {
        rover: {
          select: {
            id: true,
            fullName: true,
            email: true,
            unit: true,
          }
        },
        quest: {
          select: {
            id: true,
            title: true,
            verificationType: true,
            creditReward: true,
          }
        }
      },
      orderBy: { completedAt: "desc" }
    });
    return { success: true, completions };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch quest completions" };
  }
}

// 32b. Admin Get All Quest Submissions (Blind entries)
export async function adminGetQuestSubmissions() {
  try {
    await checkAdminSession();
    const submissions = await prisma.questSubmission.findMany({
      include: {
        rover: {
          select: {
            id: true,
            fullName: true,
            email: true,
            unit: true,
          }
        },
        quest: {
          select: {
            id: true,
            title: true,
            verificationType: true,
            creditReward: true,
          }
        }
      },
      orderBy: { submittedAt: "desc" }
    });
    return { success: true, submissions };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch quest submissions" };
  }
}

// 32c. Admin Get Blind Quest Submissions for a specific quest (with correct/incorrect status)
export async function adminGetBlindQuestSubmissions(questId: string) {
  try {
    await checkAdminSession();

    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      select: { id: true, title: true, encryptedAnswerHash: true, isBlind: true }
    });
    if (!quest) return { success: false, error: "Quest not found" };

    const submissions = await prisma.questSubmission.findMany({
      where: { questId },
      include: {
        rover: {
          select: {
            id: true,
            fullName: true,
            email: true,
            unit: true,
          }
        }
      },
      orderBy: { submittedAt: "asc" }
    });

    // Also load completions for this quest to know who was awarded
    const completions = await prisma.questCompletion.findMany({
      where: { questId },
      select: { roverId: true, isVerified: true }
    });
    const completedRoverIds = new Set(completions.filter(c => c.isVerified).map(c => c.roverId));

    // Group by rover
    const grouped: Record<string, {
      rover: typeof submissions[0]["rover"];
      answers: { answer: string; submittedAt: Date }[];
      isCorrect: boolean | null;
      wasAwarded: boolean;
    }> = {};

    for (const sub of submissions) {
      if (!grouped[sub.roverId]) {
        grouped[sub.roverId] = {
          rover: sub.rover,
          answers: [],
          isCorrect: null,
          wasAwarded: completedRoverIds.has(sub.roverId),
        };
      }
      grouped[sub.roverId].answers.push({ answer: sub.answer, submittedAt: sub.submittedAt });
    }

    // Determine isCorrect per rover using hash if available
    if (quest.encryptedAnswerHash) {
      for (const roverId of Object.keys(grouped)) {
        const anyCorrect = grouped[roverId].answers.some(
          a => hashAnswer(a.answer) === quest.encryptedAnswerHash
        );
        grouped[roverId].isCorrect = anyCorrect;
      }
    }

    return {
      success: true,
      questTitle: quest.title,
      isBlind: quest.isBlind,
      isRevealed: !!quest.encryptedAnswerHash,
      groups: Object.values(grouped)
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch blind quest submissions" };
  }
}

// 33. Admin Get Marketplace Purchases List
export async function adminGetMarketplacePurchases() {
  try {
    await checkAdminSession();
    const purchases = await prisma.shopPurchase.findMany({
      include: {
        rover: {
          select: {
            id: true,
            fullName: true,
            email: true,
            unit: true,
          }
        },
        shopItem: {
          select: {
            id: true,
            title: true,
            type: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return { success: true, purchases };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch purchases" };
  }
}

// 34. Admin Toggle Purchase Delivery Status
export async function adminTogglePurchaseDelivery(purchaseId: string) {
  try {
    await checkAdminSession();
    const purchase = await prisma.shopPurchase.findUnique({
      where: { id: purchaseId }
    });
    if (!purchase) throw new Error("Purchase not found");

    const updated = await prisma.shopPurchase.update({
      where: { id: purchaseId },
      data: { isDelivered: !purchase.isDelivered },
      include: {
        rover: {
          select: {
            id: true,
            fullName: true,
          }
        },
        shopItem: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    });

    await logSystemAction(
      "MARKETPLACE_DELIVERY_TOGGLED",
      `Admin toggled delivery status of item "${updated.shopItem.title}" purchased by "${updated.rover.fullName}" to ${updated.isDelivered ? "GIVEN" : "PENDING"}.`
    );

    return { success: true, purchase: updated };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to toggle delivery status" };
  }
}

// 35. Deploy Decoy Node
export async function deployDecoyNode(latitude: number, longitude: number) {
  const session = await getRoverSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const faction = session.profile.roverProfile?.faction;
  if (!faction) {
    return { success: false, error: "You must be assigned to a faction to deploy decoys." };
  }

  try {
    // Find an unused purchase of a Decoy Node Launcher
    const purchase = await prisma.shopPurchase.findFirst({
      where: {
        roverId: session.profile.id,
        shopItem: {
          title: { contains: "Decoy", mode: "insensitive" }
        },
        isDelivered: false
      }
    });

    if (!purchase) {
      return { success: false, error: "Deployment failed: No available Decoy Node Launcher in your inventory." };
    }

    const decoyName = `SECTOR_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const decoyPasscode = `SEC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Create the temporary decoy GeoNode
    await prisma.geoNode.create({
      data: {
        name: decoyName,
        latitude,
        longitude,
        radiusMeters: 20,
        secretPasscode: decoyPasscode,
        controllingFaction: faction,
        isHotSpot: true,
        isDecoy: true,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      }
    });

    // Mark the launcher item as consumed/delivered
    await prisma.shopPurchase.update({
      where: { id: purchase.id },
      data: { isDelivered: true }
    });

    // Send deceptive WhatsApp Group notification
    try {
      const groupId = await getOperationHeliosGroupId();
      const message = `🚨 *HELIOS SATELLITE INTERCEPT: NEW GRID SECTOR* 🚨\n\nFaction *${faction}* has secured a new active Hot-Spot: *"${decoyName}"*!\n\nCoordinates locked: [${latitude.toFixed(5)}, ${longitude.toFixed(5)}]. Grid territory updated.`;
      await sendWhatsAppMessage(groupId, message);
    } catch (waErr) {
      console.error("[WAHA] Failed to send decoy group notification:", waErr);
    }

    await logSystemAction(
      "DECOY_DEPLOYED",
      `Rover "${session.profile.fullName}" deployed a decoy node "${decoyName}" at [${latitude}, ${longitude}] expiring in 30 minutes.`
    );

    revalidatePath("/rovers/nav");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to deploy decoy node" };
  }
}

// 36. Activate Capture Shield
export async function activateCaptureShield(nodeId: string) {
  const session = await getRoverSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const faction = session.profile.roverProfile?.faction;
  if (!faction) {
    return { success: false, error: "You must be assigned to a faction to activate shields." };
  }

  try {
    const node = await prisma.geoNode.findUnique({
      where: { id: nodeId }
    });

    if (!node) return { success: false, error: "Node not found." };
    if (node.controllingFaction !== faction) {
      return { success: false, error: "You can only shield nodes controlled by your own faction." };
    }

    // Find an unused purchase of a Capture Shield Generator
    const purchase = await prisma.shopPurchase.findFirst({
      where: {
        roverId: session.profile.id,
        shopItem: {
          title: { contains: "Shield", mode: "insensitive" }
        },
        isDelivered: false
      }
    });

    if (!purchase) {
      return { success: false, error: "Shield activation failed: No available Capture Shield Generator in your inventory." };
    }

    // Update the node's shield expiration to 2 hours from now
    await prisma.geoNode.update({
      where: { id: nodeId },
      data: {
        shieldExpiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000)
      }
    });

    // Mark the shield item as consumed/delivered
    await prisma.shopPurchase.update({
      where: { id: purchase.id },
      data: { isDelivered: true }
    });

    await logSystemAction(
      "SHIELD_ACTIVATED",
      `Rover "${session.profile.fullName}" activated a 2-hour capture shield on node "${node.name}".`
    );

    revalidatePath("/rovers/nav");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to activate capture shield" };
  }
}

// 37. Get Rover Inventory (Counts available decoy launchers and shield generators)
export async function getRoverInventory() {
  const session = await getRoverSession();
  if (!session) return { success: false, decoys: 0, shields: 0 };

  try {
    const decoys = await prisma.shopPurchase.count({
      where: {
        roverId: session.profile.id,
        shopItem: {
          title: { contains: "Decoy", mode: "insensitive" }
        },
        isDelivered: false
      }
    });

    const shields = await prisma.shopPurchase.count({
      where: {
        roverId: session.profile.id,
        shopItem: {
          title: { contains: "Shield", mode: "insensitive" }
        },
        isDelivered: false
      }
    });

    return { success: true, decoys, shields };
  } catch (err) {
    console.error("Failed to fetch rover inventory:", err);
    return { success: false, decoys: 0, shields: 0 };
  }
}

// 38. Spin Cyber-Spin Lucky Wheel
export async function spinLuckyWheel() {
  const session = await getRoverSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const wheelSetting = await prisma.systemSetting.findUnique({
    where: { key: "lucky_wheel_active" },
  });
  const luckyWheelActive = wheelSetting?.value === "true";
  if (!luckyWheelActive) {
    return { success: false, error: "ACCESS_DENIED: The Cyber-Spin Wheel has been temporarily disabled by Command." };
  }

  const profile = await prisma.profile.findUnique({
    where: { id: session.profile.id },
    include: { roverProfile: true }
  });

  if (!profile || !profile.roverProfile) {
    return { success: false, error: "Rover profile not found." };
  }

  const SPIN_COST = 50;
  if (profile.roverProfile.roverCredits < SPIN_COST) {
    return { success: false, error: `INSUFFICIENT_CREDITS: You need ${SPIN_COST} CR to spin the Cyber-Wheel.` };
  }

  // Deduct credits first
  await prisma.roverProfile.update({
    where: { id: profile.roverProfile.id },
    data: { roverCredits: { decrement: SPIN_COST } }
  });

  // Weighted Selection
  const outcomes = [
    { type: "LOSE", label: "Better luck next time!", weight: 350 },
    { type: "SMALL_CREDITS", label: "Won +10 CR!", weight: 250 },
    { type: "SOCIAL_ANTHEM", label: "Challenge: Sing SDC Anthem (+60 CR)", weight: 150 },
    { type: "MED_CREDITS", label: "Won +30 CR!", weight: 100 },
    { type: "BIG_CREDITS", label: "Won +50 CR!", weight: 50 },
    { type: "SOCIAL_LEAVES", label: "Challenge: Leaf Collector (+50 CR)", weight: 50 },
    { type: "DECOY_LAUNCHER", label: "Won 1x Decoy Node Launcher!", weight: 25 },
    { type: "SHIELD_GENERATOR", label: "Won 1x Capture Shield Generator!", weight: 20 },
    { type: "JACKPOT", label: "JACKPOT! Won +150 CR!", weight: 5 }
  ];

  const totalWeight = outcomes.reduce((acc, curr) => acc + curr.weight, 0);
  let random = Math.floor(Math.random() * totalWeight);
  
  let selected = outcomes[0];
  for (const outcome of outcomes) {
    if (random < outcome.weight) {
      selected = outcome;
      break;
    }
    random -= outcome.weight;
  }

  let creditReward = 0;
  let wonItemTitle = "";
  let pendingQuestTitle = "";
  let pendingQuestDescription = "";
  let pendingQuestReward = 0;

  if (selected.type === "SMALL_CREDITS") creditReward = 10;
  else if (selected.type === "MED_CREDITS") creditReward = 30;
  else if (selected.type === "BIG_CREDITS") creditReward = 50;
  else if (selected.type === "JACKPOT") creditReward = 150;
  else if (selected.type === "DECOY_LAUNCHER") wonItemTitle = "Decoy Node Launcher";
  else if (selected.type === "SHIELD_GENERATOR") wonItemTitle = "Capture Shield Generator";
  else if (selected.type === "SOCIAL_ANTHEM") {
    pendingQuestTitle = "Social Challenge: Sing SDC Anthem";
    pendingQuestDescription = "Sing the official Scouts des Cèdres anthem in front of a Leader to claim your reward.";
    pendingQuestReward = 60;
  } else if (selected.type === "SOCIAL_LEAVES") {
    pendingQuestTitle = "Social Challenge: Leaf Collector";
    pendingQuestDescription = "Collect 3 different leaves from the camp grounds and present them to the Command Tent.";
    pendingQuestReward = 50;
  }

  // Apply rewards
  if (creditReward > 0) {
    await prisma.roverProfile.update({
      where: { id: profile.roverProfile.id },
      data: { roverCredits: { increment: creditReward } }
    });
  } else if (wonItemTitle) {
    const shopItem = await prisma.shopItem.findFirst({
      where: { title: { contains: wonItemTitle, mode: "insensitive" } }
    });
    if (shopItem) {
      await prisma.shopPurchase.create({
        data: {
          roverId: profile.id,
          shopItemId: shopItem.id,
          isDelivered: false,
          pricePaid: 0
        }
      });
    }
  } else if (pendingQuestTitle) {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const personalQuestTitle = `${pendingQuestTitle} (${profile.fullName}) [${timeStr}]`;

    const quest = await prisma.quest.create({
      data: {
        title: personalQuestTitle,
        description: pendingQuestDescription,
        verificationType: "LEADER_SIGN_OFF",
        creditReward: pendingQuestReward,
        isReleased: false,
        unlockedAtDate: new Date(),
        phase: "LIVE_CAMP"
      }
    });


    const existingCompletion = await prisma.questCompletion.findUnique({
      where: {
        roverId_questId: {
          roverId: profile.id,
          questId: quest.id
        }
      }
    });

    if (!existingCompletion) {
      await prisma.questCompletion.create({
        data: {
          roverId: profile.id,
          questId: quest.id,
          isVerified: false
        }
      });
    }
  }

  const updatedProfile = await prisma.roverProfile.findUnique({
    where: { id: profile.roverProfile.id }
  });

  await logSystemAction(
    "LUCKY_WHEEL_SPIN",
    `Rover "${profile.fullName}" spun the Cyber-Wheel, paid ${SPIN_COST} CR, and outcome was "${selected.label}". [USER_ID: ${profile.id}]`
  );

  return {
    success: true,
    outcome: selected.type,
    label: selected.label,
    remainingCredits: updatedProfile?.roverCredits || 0
  };
}

// 39. Get Rover Identity Data (for Cyber-ID Badge)
export async function getRoverIdentityData() {
  const session = await getRoverSession();
  if (!session) return null;

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: session.profile.id },
      include: {
        roverProfile: true,
        questCompletions: {
          where: { isVerified: true },
          include: {
            quest: {
              select: { id: true, title: true }
            }
          }
        }
      }
    });

    if (!profile || !profile.roverProfile) return null;

    const completedQuests = profile.questCompletions.map(c => ({
      id: c.quest.id,
      title: c.quest.title,
      category: "CURRICULUM"
    }));

    return {
      fullName: profile.fullName,
      faction: profile.roverProfile.faction || "UNASSIGNED",
      credits: profile.roverProfile.roverCredits,
      completedQuests
    };
  } catch (err) {
    console.error("Failed to load rover identity data:", err);
    return null;
  }
}


