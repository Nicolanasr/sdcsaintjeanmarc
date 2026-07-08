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

      return { updatedRover, item };
    }, { timeout: 15000 });

    revalidatePath("/rovers/shop");

    console.log(`[AuditLog] Rover "${session.profile.fullName}" (${session.profile.id}) purchased item "${result.item.title}" for ${result.item.priceOrCurrentBid} CR. New balance: ${result.updatedRover.roverCredits} CR.`);
    await logSystemAction("MARKETPLACE_PURCHASE", `Rover "${session.profile.fullName}" (${session.profile.id}) purchased item "${result.item.title}" for ${result.item.priceOrCurrentBid} CR. New balance: ${result.updatedRover.roverCredits} CR.`);

    // Notify the rover via WhatsApp
    if (session.roverProfile?.phoneNumber) {
      try {
        const message = `🛍️ *HELIOS MARKETPLACE: PURCHASE PERK* 🛍️\n\nCongratulations! You purchased *"${result.item.title}"* for *${result.item.priceOrCurrentBid} CR*.\n\nYour new balance is *${result.updatedRover.roverCredits} CR*. Present this message to the Command Tent to collect your perk.`;
        await sendWhatsAppMessage(session.roverProfile.phoneNumber, message);
      } catch (waErr) {
        console.error("[WAHA] Failed to send purchase confirmation to rover:", waErr);
      }
    }

    return { success: true, newCredits: result.updatedRover.roverCredits };
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

      // Update auction state
      const updatedItem = await tx.shopItem.update({
        where: { id: itemId },
        data: {
          priceOrCurrentBid: bidAmount,
          highestBidderId: session.profile.id,
        },
      });

      return { updatedRover, updatedItem, outbidUserPhone, outbidItemTitle };
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

  if (lat === undefined || lng === undefined) {
    return { success: false, error: "GPS coordinates are required to verify physical presence." };
  }

  const distance = getDistanceMeters(lat, lng, node.latitude, node.longitude);
  if (distance > 200) {
    return {
      success: false,
      error: `You are too far away (${Math.round(distance)}m). You must be physically near the node (within 200m) to check in.`,
    };
  }

  if (node.secretPasscode.trim().toLowerCase() !== passcode.trim().toLowerCase()) {
    return { success: false, error: "Incorrect secret passcode for this node location." };
  }

  if (node.controllingFaction === faction) {
    return { success: false, error: `This node is already controlled by your faction (${faction})` };
  }

  if (node.isHotSpot) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const now = new Date();
        const windowStart = new Date(now.getTime() - 20000); // 20 seconds ago

        // 1. Wipe check-ins older than 20 seconds at this node
        await tx.nodeCheckIn.deleteMany({
          where: {
            nodeId,
            createdAt: { lt: windowStart }
          }
        });

        // 2. Fetch all active check-ins at this node in the last 20 seconds
        const activeCheckIns = await tx.nodeCheckIn.findMany({
          where: { nodeId }
        });

        // 3. Check for interruption (opposing team presence)
        const opposingCheckIn = activeCheckIns.find(c => c.faction !== faction);
        if (opposingCheckIn) {
          // Reset capture queue for this node
          await tx.nodeCheckIn.deleteMany({ where: { nodeId } });
          
          // Add current scout as starting point
          await tx.nodeCheckIn.create({
            data: { nodeId, roverId: session.profile.id, faction }
          });

          return {
            status: "INTERRUPTED",
            message: "⚠️ Opposing team presence detected in range! Capture progress has been reset."
          };
        }

        // 4. Create check-in if not already present
        const alreadyCheckedIn = activeCheckIns.some(c => c.roverId === session.profile.id);
        if (!alreadyCheckedIn) {
          await tx.nodeCheckIn.create({
            data: { nodeId, roverId: session.profile.id, faction }
          });
        }

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
        const requiredCount = Math.max(1, totalFactionScouts);

        if (activeUniqueScouts >= requiredCount) {
          // VICTORY! Conquer the Hotspot
          await tx.geoNode.update({
            where: { id: nodeId },
            data: {
              controllingFaction: faction,
              isHotSpot: false,
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

        return {
          status: "PROGRESSING",
          message: `📡 Secured check-in. Faction: ${activeUniqueScouts}/${requiredCount} Scouts. Stay in range!`
        };
      }, { timeout: 15000 });

      revalidatePath("/rovers/nav");
      revalidatePath("/rovers/admin");

      if (result.status === "CAPTURED") {
        await logSystemAction("GEONODE_HOTSPOT_CONQUERED", `Faction ${faction} conquered Hot-Spot "${node.name}".`);
        try {
          const alertMessage = `🎉 *HELIOS TACTICAL UPDATE: SECTOR CONQUERED!* 🎉\n\nFaction *${faction}* has successfully conquered the active Hot-Spot *"${node.name}"*!\n\nAll participating team members have been awarded +150 Credits.`;
          await broadcastNodeCaptureNotification(
            session.profile.fullName,
            node.name,
            faction,
            0,
            0
          );
          await sendWhatsAppMessage("+961700078138", alertMessage);
        } catch (waErr) {
          console.error("[WAHA] Failed to broadcast node conquer notification:", waErr);
        }
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

  if (!node.isHotSpot && node.controllingFaction === faction) {
    return { success: false, error: `This node is already controlled by your faction (${faction})` };
  }

  const distance = getDistanceMeters(lat, lng, node.latitude, node.longitude);
  const gpsAccuracyBuffer = 35; // 35m allowance for mobile GPS drift
  if (distance > node.radiusMeters + gpsAccuracyBuffer) {
    return {
      success: false,
      error: `You are out of range (${Math.round(distance)}m away). Must be within ${node.radiusMeters + gpsAccuracyBuffer}m (includes 35m GPS drift margin).`,
    };
  }

  if (node.isHotSpot) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const now = new Date();
        const windowStart = new Date(now.getTime() - 20000); // 20 seconds ago

        // 1. Wipe check-ins older than 20 seconds at this node
        await tx.nodeCheckIn.deleteMany({
          where: {
            nodeId,
            createdAt: { lt: windowStart }
          }
        });

        // 2. Fetch all active check-ins at this node in the last 20 seconds
        const activeCheckIns = await tx.nodeCheckIn.findMany({
          where: { nodeId }
        });

        // 3. Check for interruption (opposing team presence)
        const opposingCheckIn = activeCheckIns.find(c => c.faction !== faction);
        if (opposingCheckIn) {
          // Reset capture queue for this node!
          await tx.nodeCheckIn.deleteMany({ where: { nodeId } });
          
          // Add current scout as starting point
          await tx.nodeCheckIn.create({
            data: { nodeId, roverId: session.profile.id, faction }
          });

          return {
            status: "INTERRUPTED",
            message: "⚠️ Opposing team presence detected in range! Capture progress has been reset."
          };
        }

        // 4. Create check-in if not already present
        const alreadyCheckedIn = activeCheckIns.some(c => c.roverId === session.profile.id);
        if (!alreadyCheckedIn) {
          await tx.nodeCheckIn.create({
            data: { nodeId, roverId: session.profile.id, faction }
          });
        }

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
        const requiredCount = Math.max(1, totalFactionScouts);

        if (activeUniqueScouts >= requiredCount) {
          // VICTORY! Conquer the Hotspot!
          await tx.geoNode.update({
            where: { id: nodeId },
            data: {
              controllingFaction: faction,
              isHotSpot: false,
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

        return {
          status: "PROGRESSING",
          message: `📡 Secured check-in. Faction: ${activeUniqueScouts}/${requiredCount} Scouts. Stay in range!`
        };
      }, { timeout: 15000 });

      revalidatePath("/rovers/nav");
      revalidatePath("/rovers/admin");

      if (result.status === "CAPTURED") {
        await logSystemAction("GEONODE_HOTSPOT_CONQUERED", `Faction ${faction} conquered Hot-Spot "${node.name}".`);
        try {
          const alertMessage = `🎉 *HELIOS TACTICAL UPDATE: SECTOR CONQUERED!* 🎉\n\nFaction *${faction}* has successfully conquered the active Hot-Spot *"${node.name}"*!\n\nAll participating team members have been awarded +150 Credits.`;
          await broadcastNodeCaptureNotification(
            session.profile.fullName,
            node.name,
            faction,
            0,
            0
          );
          await sendWhatsAppMessage("+961700078138", alertMessage);
        } catch (waErr) {
          console.error("Failed to broadcast hot-spot capture notification:", waErr);
        }
        return { success: true, message: result.message };
      } else if (result.status === "INTERRUPTED") {
        await logSystemAction("GEONODE_HOTSPOT_INTERRUPTED", `Rover "${session.profile.fullName}" checked in at Hot-Spot "${node.name}", but opposing team presence reset the queue.`);
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
  }
) {
  try {
    await checkAdminSession();

    // 1. Update Profile (auth record)
    await prisma.profile.update({
      where: { id: userId },
      data: {
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        role: data.role,
        unit: data.unit ? data.unit.trim() : null,
      },
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
export async function adminSpawnHotSpot(name: string, lat?: number, lng?: number) {
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
        isHotSpot: true,
      },
    });

    await logSystemAction("ADMIN_HOTSPOT_SPAWNED", `Admin spawned Hot-Spot "${nodeName}" at coords: ${finalLat.toFixed(6)}, ${finalLng.toFixed(6)}.`);

    // Dispatch WhatsApp Broadcast Notification
    try {
      const alertMsg = `🚨 *HELIOS TACTICAL UPDATE: HOT-ZONE SPAWNED!* 🚨\n\nA new active capture point *"${nodeName}"* has been established!\n📍 Coords: *${finalLat.toFixed(6)}, ${finalLng.toFixed(6)}*\n\n🔥 Faction members must check in within 20s of each other to secure it. Opposing presence resets queue!\nNavigate: https://maps.google.com/?q=${finalLat.toFixed(6)},${finalLng.toFixed(6)}`;
      await sendWhatsAppMessage("+961700078138", alertMsg);
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
  const windowStart = new Date(now.getTime() - 20000); // 20s window

  try {
    // Wipe expired check-ins older than 20 seconds
    await prisma.nodeCheckIn.deleteMany({
      where: {
        createdAt: { lt: windowStart }
      }
    });

    const nodes = await prisma.geoNode.findMany({
      orderBy: { name: "asc" },
    });

    // Get all active check-ins
    const allCheckIns = await prisma.nodeCheckIn.findMany({
      orderBy: { createdAt: "asc" }
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
      const requiredCount = nodeCheckIns[0]?.faction === "ALPHA" ? Math.max(1, alphaScouts) : Math.max(1, bravoScouts);

      if (nodeCheckIns.length > 0) {
        activeFaction = nodeCheckIns[0].faction;
        const factionCheckIns = nodeCheckIns.filter(c => c.faction === activeFaction);
        activeCount = new Set(factionCheckIns.map(c => c.roverId)).size;
        
        const oldestCheckInTime = nodeCheckIns[0].createdAt.getTime();
        const elapsed = now.getTime() - oldestCheckInTime;
        remainingSeconds = Math.max(0, Math.ceil((20000 - elapsed) / 1000));
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
        activeFaction,
        activeCount,
        requiredCount,
        remainingSeconds
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
