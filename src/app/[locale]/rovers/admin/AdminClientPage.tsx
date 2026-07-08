"use client";

import React, { useState } from "react";
import {
  adminReleaseQuest,
  adminApproveSignOff,
  adminAdjustCredits,
  updateRoverPhoneNumber,
  adminToggleNightNav,
  adminCreateRover,
  adminCreateQuest,
  adminDeleteQuest,
  adminUpdateQuest,
  adminCreateShopItem,
  adminUpdateShopItem,
  adminDeleteShopItem,
  adminUpdateRover,
  adminDeleteRover,
  adminSpawnHotSpot,
  adminClearHotSpots,
} from "@/app/actions/rovers";

interface Quest {
  id: string;
  title: string;
  description?: string;
  clueHint?: string | null;
  creditReward: number;
  isReleased: boolean;
  unlockedAtDate: Date;
  verificationType: "DIGITAL_CODE" | "LEADER_SIGN_OFF";
  phase?: "PRE_CAMP" | "LIVE_CAMP";
  answerCode?: string;
}

interface Rover {
  id: string;
  fullName: string;
  email?: string;
  role?: string;
  unit: string | null;
  roverProfile: {
    roverCredits: number;
    faction: "ALPHA" | "BRAVO" | null;
    phoneNumber: string;
  } | null;
  questCompletions: {
    questId: string;
    isVerified: boolean;
    quest: Quest;
  }[];
}

interface ShopItem {
  id: string;
  title: string;
  description: string;
  type: "FIXED_PRICE" | "AUCTION";
  priceOrCurrentBid: number;
  stock: number;
  isAvailable: boolean;
  highestBidder: {
    id: string;
    fullName: string;
  } | null;
}

interface SystemLog {
  id: number;
  phone: string;
  body: string;
  status: string;
  error: string | null;
  createdAt: Date | string;
}

interface AdminClientPageProps {
  initialQuests: Quest[];
  initialRovers: Rover[];
  initialShopItems?: ShopItem[];
  initialLogs?: SystemLog[];
  locale: string;
  initialNightNavActive: boolean;
}

export default function AdminClientPage({
  initialQuests,
  initialRovers,
  initialShopItems = [],
  initialLogs = [],
  locale,
  initialNightNavActive,
}: AdminClientPageProps) {
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [rovers, setRovers] = useState<Rover[]>(initialRovers);
  const [shopItems, setShopItems] = useState<ShopItem[]>(initialShopItems);
  const [logs, setLogs] = useState<SystemLog[]>(initialLogs);
  const [nightNavActive, setNightNavActive] = useState(initialNightNavActive);

  // Workstation active tab state
  const [activeTab, setActiveTab] = useState<"scouts" | "challenges" | "registry" | "marketplace" | "logs">("scouts");

  // Inline Credits Adjuster state
  const [adjustingCreditsId, setAdjustingCreditsId] = useState<string | null>(null);
  const [inlineCreditsAmount, setInlineCreditsAmount] = useState<number | "">("");
  const [inlineAdjustReason, setInlineAdjustReason] = useState("");

  // Phone Editor state
  const [editingPhoneId, setEditingPhoneId] = useState<string | null>(null);
  const [phoneVal, setPhoneVal] = useState("");

  // Add User form state
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"scout" | "admin">("scout");
  const [newUserUnit, setNewUserUnit] = useState("");
  const [newUserFaction, setNewUserFaction] = useState<"ALPHA" | "BRAVO" | "">("");
  const [newUserPhone, setNewUserPhone] = useState("");

  // Add Quest form state
  const [newQuestTitle, setNewQuestTitle] = useState("");
  const [newQuestDesc, setNewQuestDesc] = useState("");
  const [newQuestHint, setNewQuestHint] = useState("");
  const [newQuestType, setNewQuestType] = useState<"DIGITAL_CODE" | "LEADER_SIGN_OFF">("DIGITAL_CODE");
  const [newQuestAnswer, setNewQuestAnswer] = useState("");
  const [newQuestReward, setNewQuestReward] = useState<number | "">("");
  const [newQuestPhase, setNewQuestPhase] = useState<"PRE_CAMP" | "LIVE_CAMP">("PRE_CAMP");
  const [newQuestDate, setNewQuestDate] = useState("");
  const [newQuestReleased, setNewQuestReleased] = useState(false);

  // Hot Spot form state
  const [hotspotName, setHotspotName] = useState("");
  const [hotspotLat, setHotspotLat] = useState("");
  const [hotspotLng, setHotspotLng] = useState("");

  // Edit overlays state
  const [editingRover, setEditingRover] = useState<Rover | null>(null);
  const [editRoverName, setEditRoverName] = useState("");
  const [editRoverEmail, setEditRoverEmail] = useState("");
  const [editRoverRole, setEditRoverRole] = useState("scout");
  const [editRoverUnit, setEditRoverUnit] = useState("");
  const [editRoverFaction, setEditRoverFaction] = useState<"ALPHA" | "BRAVO" | "">("");
  const [editRoverPhone, setEditRoverPhone] = useState("");

  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [editQuestTitle, setEditQuestTitle] = useState("");
  const [editQuestReward, setEditQuestReward] = useState<number | "">("");
  const [editQuestDesc, setEditQuestDesc] = useState("");
  const [editQuestHint, setEditQuestHint] = useState("");
  const [editQuestType, setEditQuestType] = useState<"DIGITAL_CODE" | "LEADER_SIGN_OFF">("DIGITAL_CODE");
  const [editQuestAnswer, setEditQuestAnswer] = useState("");
  const [editQuestDate, setEditQuestDate] = useState("");
  const [editQuestPhase, setEditQuestPhase] = useState<"PRE_CAMP" | "LIVE_CAMP">("PRE_CAMP");
  const [editQuestReleased, setEditQuestReleased] = useState(false);

  const [editingShopItem, setEditingShopItem] = useState<ShopItem | null>(null);
  const [editShopTitle, setEditShopTitle] = useState("");
  const [editShopDesc, setEditShopDesc] = useState("");
  const [editShopType, setEditShopType] = useState<"FIXED_PRICE" | "AUCTION">("FIXED_PRICE");
  const [editShopPrice, setEditShopPrice] = useState<number | "">("");
  const [editShopStock, setEditShopStock] = useState<number | "">("");
  const [editShopAvailable, setEditShopAvailable] = useState(true);

  // ShopItem Creation form state
  const [newShopTitle, setNewShopTitle] = useState("");
  const [newShopDesc, setNewShopDesc] = useState("");
  const [newShopType, setNewShopType] = useState<"FIXED_PRICE" | "AUCTION">("FIXED_PRICE");
  const [newShopPrice, setNewShopPrice] = useState<number | "">("");
  const [newShopStock, setNewShopStock] = useState<number | "">("");
  const [newShopAvailable, setNewShopAvailable] = useState(true);

  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const startEditPhone = (roverId: string, currentPhone: string) => {
        setEditingPhoneId(roverId);
        setPhoneVal(currentPhone);
    };

    const handleSavePhone = async (roverId: string) => {
        setLoading(`phone-${roverId}`);
        setMessage(null);
        try {
            const res = await updateRoverPhoneNumber(roverId, phoneVal);
            if (res.success) {
                setRovers((prev) =>
                    prev.map((r) => {
                        if (r.id === roverId && r.roverProfile) {
                            return {
                                ...r,
                                roverProfile: {
                                    ...r.roverProfile,
                                    phoneNumber: res.phoneNumber || "",
                                },
                            };
                        }
                        return r;
                    })
                );
                setEditingPhoneId(null);
                setMessage({
                    type: "success",
                    text: `PHONE_UPDATED: Mobile number updated successfully.`,
                });
            } else {
                setMessage({
                    type: "error",
                    text: `PHONE_UPDATE_FAILED: ${res.error || "Could not update phone number."}`,
                });
            }
        } catch (err: any) {
            setMessage({
                type: "error",
                text: `SYSTEM_ERROR: ${err.message || "Failed to update phone number."}`,
            });
        } finally {
            setLoading(null);
        }
    };

    // Handle release toggle
    const handleToggleRelease = async (questId: string, currentStatus: boolean) => {
        setLoading(`quest-${questId}`);
        setMessage(null);

        try {
            const res = await adminReleaseQuest(questId, !currentStatus);
            if (res.success) {
                setQuests((prev) =>
                    prev.map((q) => (q.id === questId ? { ...q, isReleased: !currentStatus } : q))
                );
                setMessage({
                    type: "success",
                    text: `QUEST_STATUS_UPDATED: Quest ${!currentStatus ? "released (WhatsApp broadcast sent)" : "locked"}.`,
                });
            } else {
                setMessage({
                    type: "error",
                    text: `UPDATE_FAILED: ${res.error || "Could not toggle quest release."}`,
                });
            }
        } catch (err: any) {
            setMessage({
                type: "error",
                text: `SYSTEM_ERROR: ${err.message || "Request failed."}`,
            });
        } finally {
            setLoading(null);
        }
    };

    // Handle Hot-Spot spawning
    const handleSpawnHotSpot = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading("spawn-hotspot");
        setMessage(null);
        try {
            const latNum = hotspotLat ? Number(hotspotLat) : undefined;
            const lngNum = hotspotLng ? Number(hotspotLng) : undefined;
            const res = await adminSpawnHotSpot(hotspotName, latNum, lngNum);
            if (res.success) {
                setMessage({ text: `SUCCESS: Hot-Spot "${res.node?.name}" spawned successfully at ${res.node?.latitude.toFixed(6)}, ${res.node?.longitude.toFixed(6)}!`, type: "success" });
                setHotspotName("");
                setHotspotLat("");
                setHotspotLng("");
            } else {
                setMessage({ text: `SPAWN_FAILED: ${res.error}`, type: "error" });
            }
        } catch (err: any) {
            setMessage({ text: `SYSTEM_ERROR: ${err.message}`, type: "error" });
        } finally {
            setLoading(null);
        }
    };

    // Handle clearing all Hot-Spots
    const handleClearHotSpots = async () => {
        if (!confirm("Are you sure you want to clear all active Hot-Spots and reset all capture queues?")) return;
        setLoading("clear-hotspots");
        setMessage(null);
        try {
            const res = await adminClearHotSpots();
            if (res.success) {
                setMessage({ text: `SUCCESS: Cleared all active Hot-Spots successfully (${res.count} removed).`, type: "success" });
            } else {
                setMessage({ text: `CLEAR_FAILED: ${res.error}`, type: "error" });
            }
        } catch (err: any) {
            setMessage({ text: `SYSTEM_ERROR: ${err.message}`, type: "error" });
        } finally {
            setLoading(null);
        }
    };

    // Handle milestone sign-off approval
    const handleApproveSignOff = async (roverId: string, questId: string, questTitle: string, roverName: string) => {
        setLoading(`approve-${roverId}-${questId}`);
        setMessage(null);

        try {
            const res = await adminApproveSignOff(roverId, questId);
            if (res.success) {
                // Update local state: mark quest completion as verified, and increment user credits in matrix
                setRovers((prev) =>
                    prev.map((r) => {
                        if (r.id === roverId) {
                            const updatedCompletions = r.questCompletions.map((c) =>
                                c.questId === questId ? { ...c, isVerified: true } : c
                            );
                            const originalQuest = quests.find((q) => q.id === questId);
                            const reward = originalQuest?.creditReward || 0;
                            const originalCredits = r.roverProfile?.roverCredits || 0;

                            return {
                                ...r,
                                roverProfile: r.roverProfile
                                    ? { ...r.roverProfile, roverCredits: originalCredits + reward }
                                    : null,
                                questCompletions: updatedCompletions,
                            };
                        }
                        return r;
                    })
                );

                setMessage({
                    type: "success",
                    text: `MILESTONE_APPROVED: "${questTitle}" signed off for ${roverName}. Credits awarded.`,
                });
            } else {
                setMessage({
                    type: "error",
                    text: `APPROVAL_FAILED: ${res.error || "Could not verify milestone."}`,
                });
            }
        } finally {
            setLoading(null);
        }
    };

    // Toggle Night Nav
    const handleToggleNightNav = async () => {
        setLoading("toggle-nav");
        setMessage(null);
        try {
            const nextStatus = !nightNavActive;
            const res = await adminToggleNightNav(nextStatus);
            if (res.success) {
                setNightNavActive(nextStatus);
                setMessage({
                    type: "success",
                    text: `SYSTEM_CONFIG: Night Nav is now ${nextStatus ? "ONLINE (NORMAL_ROVERS_AUTHORIZED)" : "OFFLINE (RESTRICTED)"}.`,
                });
            } else {
                setMessage({
                    type: "error",
                    text: `SYSTEM_CONFIG_FAILED: ${res.error || "Failed to update configuration."}`,
                });
            }
        } catch (err: any) {
            setMessage({
                type: "error",
                text: `SYSTEM_ERROR: ${err.message || "Failed to toggle configuration status."}`,
            });
        } finally {
            setLoading(null);
        }
    };

    // Add User Form Submission
    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUserEmail || !newUserFullName || !newUserPassword) return;

        setLoading("add-user");
        setMessage(null);

        try {
            const res = await adminCreateRover({
                email: newUserEmail,
                fullName: newUserFullName,
                passwordHex: newUserPassword,
                role: newUserRole,
                unit: newUserUnit || null,
                faction: newUserFaction === "" ? null : (newUserFaction as "ALPHA" | "BRAVO"),
                phoneNumber: newUserPhone,
            });

            if (res.success) {
                setMessage({
                    type: "success",
                    text: `USER_CREATED: Account for ${newUserFullName} initialized successfully.`,
                });
                setNewUserEmail("");
                setNewUserFullName("");
                setNewUserPassword("");
                setNewUserRole("scout");
                setNewUserUnit("");
                setNewUserFaction("");
                setNewUserPhone("");

                const dummyNewProfile = {
                    id: res.roverId || Math.random().toString(),
                    fullName: newUserFullName,
                    unit: newUserUnit || null,
                    roverProfile: newUserRole === "scout" ? {
                        roverCredits: 0,
                        faction: newUserFaction === "" ? null : (newUserFaction as "ALPHA" | "BRAVO"),
                        phoneNumber: newUserPhone,
                    } : null,
                    questCompletions: [],
                };
                setRovers((prev) => [...prev, dummyNewProfile].sort((a, b) => a.fullName.localeCompare(b.fullName)));
            } else {
                setMessage({
                    type: "error",
                    text: `CREATE_USER_FAILED: ${res.error || "Failed to create user."}`,
                });
            }
        } catch (err: any) {
            setMessage({
                type: "error",
                text: `SYSTEM_ERROR: ${err.message || "Unexpected exception during user insertion."}`,
            });
        } finally {
            setLoading(null);
        }
    };

    // Add Quest Form Submission
    const handleAddQuest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newQuestTitle || !newQuestDesc || newQuestReward === "" || !newQuestDate) return;

        setLoading("add-quest");
        setMessage(null);

        try {
            const res = await adminCreateQuest({
                title: newQuestTitle,
                description: newQuestDesc,
                clueHint: newQuestHint || null,
                verificationType: newQuestType,
                answerCode: newQuestType === "DIGITAL_CODE" ? newQuestAnswer : undefined,
                creditReward: Number(newQuestReward),
                unlockedAtDate: new Date(newQuestDate).toISOString(),
                phase: newQuestPhase,
                isReleased: newQuestReleased,
            });

            if (res.success) {
                setMessage({
                    type: "success",
                    text: `CHALLENGE_CREATED: '${newQuestTitle}' has been successfully scheduled.`,
                });
                setNewQuestTitle("");
                setNewQuestDesc("");
                setNewQuestHint("");
                setNewQuestType("DIGITAL_CODE");
                setNewQuestAnswer("");
                setNewQuestReward("");
                setNewQuestPhase("PRE_CAMP");
                setNewQuestDate("");
                setNewQuestReleased(false);

                const dummyNewQuest = {
                    id: res.questId || Math.random().toString(),
                    title: newQuestTitle,
                    creditReward: Number(newQuestReward),
                    isReleased: newQuestReleased,
                    unlockedAtDate: new Date(newQuestDate),
                    verificationType: newQuestType,
                };
                setQuests((prev) => [...prev, dummyNewQuest].sort((a, b) => new Date(a.unlockedAtDate).getTime() - new Date(b.unlockedAtDate).getTime()));
            } else {
                setMessage({
                    type: "error",
                    text: `CREATE_QUEST_FAILED: ${res.error || "Failed to create challenge."}`,
                });
            }
        } catch (err: any) {
            setMessage({
                type: "error",
                text: `SYSTEM_ERROR: ${err.message || "Unexpected exception during challenge scheduling."}`,
            });
        } finally {
            setLoading(null);
        }
    };

    // Handle inline credit adjustments
    const handleInlineAdjustCredits = async (roverId: string) => {
        if (inlineCreditsAmount === "" || !inlineAdjustReason.trim()) return;

        setLoading(`adjust-inline-${roverId}`);
        setMessage(null);

        try {
            const res = await adminAdjustCredits(roverId, Number(inlineCreditsAmount), inlineAdjustReason);
            if (res.success) {
                const adjustedRover = rovers.find((r) => r.id === roverId);
                const roverName = adjustedRover ? adjustedRover.fullName : "Rover";

                setRovers((prev) =>
                    prev.map((r) => {
                        if (r.id === roverId && r.roverProfile) {
                            return {
                                ...r,
                                roverProfile: {
                                    ...r.roverProfile,
                                    roverCredits: res.newCredits ?? r.roverProfile.roverCredits,
                                },
                            };
                        }
                        return r;
                    })
                );

                setMessage({
                    type: "success",
                    text: `CREDITS_ADJUSTED: Points updated inline for ${roverName}. Net shift: ${inlineCreditsAmount} CR.`,
                });

                // Close form and reset fields
                setAdjustingCreditsId(null);
                setInlineCreditsAmount("");
                setInlineAdjustReason("");
            } else {
                setMessage({
                    type: "error",
                    text: `ADJUSTMENT_FAILED: ${res.error || "Could not apply credit adjustment."}`,
                });
            }
        } catch (err: any) {
            setMessage({
                type: "error",
                text: `SYSTEM_ERROR: ${err.message || "Adjustment override failed."}`,
            });
        } finally {
            setLoading(null);
        }
    };

  // ==========================================
  // EDIT ACTION TRIGGERS & SUBMISSIONS
  // ==========================================

  // 1. Rover/User Handlers
  const handleEditRoverClick = (rover: Rover) => {
    setEditingRover(rover);
    setEditRoverName(rover.fullName);
    setEditRoverEmail(rover.email || "");
    setEditRoverRole(rover.role || "scout");
    setEditRoverUnit(rover.unit || "");
    setEditRoverFaction(rover.roverProfile?.faction || "");
    setEditRoverPhone(rover.roverProfile?.phoneNumber || "");
  };

  const handleEditRoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRover || !editRoverName || !editRoverEmail) return;

    setLoading(`edit-rover-${editingRover.id}`);
    setMessage(null);

    try {
      const res = await adminUpdateRover(editingRover.id, {
        fullName: editRoverName,
        email: editRoverEmail,
        role: editRoverRole,
        unit: editRoverUnit || null,
        faction: editRoverRole === "scout" && editRoverFaction !== "" ? editRoverFaction : null,
        phoneNumber: editRoverRole === "scout" ? editRoverPhone : undefined,
      });

      if (res.success) {
        setMessage({
          type: "success",
          text: `USER_UPDATED: Details for '${editRoverName}' saved successfully.`,
        });

        setRovers((prev) =>
          prev.map((r) => {
            if (r.id === editingRover.id) {
              return {
                ...r,
                fullName: editRoverName,
                email: editRoverEmail,
                role: editRoverRole,
                unit: editRoverUnit || null,
                roverProfile: editRoverRole === "scout" ? {
                  roverCredits: r.roverProfile?.roverCredits || 0,
                  faction: editRoverFaction !== "" ? editRoverFaction : null,
                  phoneNumber: editRoverPhone,
                } : null,
              };
            }
            return r;
          })
        );

        setEditingRover(null);
      } else {
        setMessage({
          type: "error",
          text: `UPDATE_USER_FAILED: ${res.error || "Failed to update user."}`,
        });
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: `SYSTEM_ERROR: ${err.message || "Failed to edit user account."}`,
      });
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteRover = async (userId: string, fullName: string) => {
    if (!confirm(`CAUTION: Are you sure you want to permanently delete user "${fullName}"? This will erase their login credentials and all associated profiles.`)) return;

    setLoading(`delete-rover-${userId}`);
    setMessage(null);

    try {
      const res = await adminDeleteRover(userId);
      if (res.success) {
        setMessage({
          type: "success",
          text: `USER_DELETED: '${fullName}' has been permanently removed.`,
        });
        setRovers((prev) => prev.filter((r) => r.id !== userId));
      } else {
        setMessage({
          type: "error",
          text: `DELETE_USER_FAILED: ${res.error || "Failed to delete user."}`,
        });
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: `SYSTEM_ERROR: ${err.message || "Delete transaction failed."}`,
      });
    } finally {
      setLoading(null);
    }
  };

  // 2. Quest/Challenge Handlers
  const handleEditQuestClick = (quest: Quest) => {
    setEditingQuest(quest);
    setEditQuestTitle(quest.title);
    setEditQuestReward(quest.creditReward);
    setEditQuestDesc(quest.description || "");
    setEditQuestHint(quest.clueHint || "");
    setEditQuestType(quest.verificationType);
    setEditQuestAnswer(quest.answerCode || "");
    setEditQuestPhase(quest.phase || "PRE_CAMP");
    setEditQuestReleased(quest.isReleased);
    
    // Format date for datetime-local input
    if (quest.unlockedAtDate) {
      const date = new Date(quest.unlockedAtDate);
      const tzOffset = date.getTimezoneOffset() * 60000;
      const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
      setEditQuestDate(localISOTime);
    } else {
      setEditQuestDate("");
    }
  };

  const handleEditQuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuest || !editQuestTitle || !editQuestDesc || editQuestReward === "" || !editQuestDate) return;

    setLoading(`edit-quest-${editingQuest.id}`);
    setMessage(null);

    try {
      const res = await adminUpdateQuest(editingQuest.id, {
        title: editQuestTitle,
        description: editQuestDesc,
        clueHint: editQuestHint || null,
        verificationType: editQuestType,
        answerCode: editQuestType === "DIGITAL_CODE" ? editQuestAnswer : undefined,
        creditReward: Number(editQuestReward),
        unlockedAtDate: new Date(editQuestDate).toISOString(),
        phase: editQuestPhase,
        isReleased: editQuestReleased,
      });

      if (res.success) {
        setMessage({
          type: "success",
          text: `CHALLENGE_UPDATED: '${editQuestTitle}' has been successfully saved.`,
        });

        setQuests((prev) =>
          prev.map((q) => {
            if (q.id === editingQuest.id) {
              return {
                ...q,
                title: editQuestTitle,
                description: editQuestDesc,
                clueHint: editQuestHint || null,
                verificationType: editQuestType,
                creditReward: Number(editQuestReward),
                unlockedAtDate: new Date(editQuestDate),
                phase: editQuestPhase,
                isReleased: editQuestReleased,
              };
            }
            return q;
          }).sort((a, b) => new Date(a.unlockedAtDate).getTime() - new Date(b.unlockedAtDate).getTime())
        );

        setEditingQuest(null);
      } else {
        setMessage({
          type: "error",
          text: `UPDATE_QUEST_FAILED: ${res.error || "Failed to update challenge."}`,
        });
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: `SYSTEM_ERROR: ${err.message || "Failed to communicate edit with server."}`,
      });
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteQuest = async (questId: string, title: string) => {
    if (!confirm(`CAUTION: Are you sure you want to permanently delete quest "${title}"? This will delete all completions related to it.`)) return;

    setLoading(`delete-quest-${questId}`);
    setMessage(null);

    try {
      const res = await adminDeleteQuest(questId);
      if (res.success) {
        setMessage({
          type: "success",
          text: `CHALLENGE_DELETED: '${title}' has been removed from database.`,
        });
        setQuests((prev) => prev.filter((q) => q.id !== questId));
      } else {
        setMessage({
          type: "error",
          text: `DELETE_QUEST_FAILED: ${res.error || "Failed to delete quest."}`,
        });
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: `SYSTEM_ERROR: ${err.message || "Delete transaction failed."}`,
      });
    } finally {
      setLoading(null);
    }
  };

  // 3. ShopItem/Marketplace Handlers
  const handleAddShopItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopTitle || !newShopDesc || newShopPrice === "") return;

    setLoading("add-shop");
    setMessage(null);

    try {
      const res = await adminCreateShopItem({
        title: newShopTitle,
        description: newShopDesc,
        type: newShopType,
        priceOrCurrentBid: Number(newShopPrice),
        stock: newShopType === "FIXED_PRICE" ? Number(newShopStock || 0) : 0,
        isAvailable: newShopAvailable,
      });

      if (res.success) {
        setMessage({
          type: "success",
          text: `SHOP_ITEM_CREATED: '${newShopTitle}' is now live in marketplace.`,
        });

        const dummyItem: ShopItem = {
          id: res.itemId || Math.random().toString(),
          title: newShopTitle,
          description: newShopDesc,
          type: newShopType,
          priceOrCurrentBid: Number(newShopPrice),
          stock: newShopType === "FIXED_PRICE" ? Number(newShopStock || 0) : 0,
          isAvailable: newShopAvailable,
          highestBidder: null,
        };

        setShopItems((prev) => [dummyItem, ...prev]);

        // Reset fields
        setNewShopTitle("");
        setNewShopDesc("");
        setNewShopType("FIXED_PRICE");
        setNewShopPrice("");
        setNewShopStock("");
        setNewShopAvailable(true);
      } else {
        setMessage({
          type: "error",
          text: `CREATE_SHOP_FAILED: ${res.error || "Failed to create shop item."}`,
        });
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: `SYSTEM_ERROR: ${err.message || "Failed to save shop item."}`,
      });
    } finally {
      setLoading(null);
    }
  };

  const handleEditShopClick = (item: ShopItem) => {
    setEditingShopItem(item);
    setEditShopTitle(item.title);
    setEditShopDesc(item.description);
    setEditShopType(item.type);
    setEditShopPrice(item.priceOrCurrentBid);
    setEditShopStock(item.stock);
    setEditShopAvailable(item.isAvailable);
  };

  const handleEditShopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShopItem || !editShopTitle || !editShopDesc || editShopPrice === "") return;

    setLoading(`edit-shop-${editingShopItem.id}`);
    setMessage(null);

    try {
      const res = await adminUpdateShopItem(editingShopItem.id, {
        title: editShopTitle,
        description: editShopDesc,
        type: editShopType,
        priceOrCurrentBid: Number(editShopPrice),
        stock: editShopType === "FIXED_PRICE" ? Number(editShopStock || 0) : 0,
        isAvailable: editShopAvailable,
      });

      if (res.success) {
        setMessage({
          type: "success",
          text: `SHOP_ITEM_UPDATED: '${editShopTitle}' updated successfully.`,
        });

        setShopItems((prev) =>
          prev.map((item) => {
            if (item.id === editingShopItem.id) {
              return {
                ...item,
                title: editShopTitle,
                description: editShopDesc,
                type: editShopType,
                priceOrCurrentBid: Number(editShopPrice),
                stock: editShopType === "FIXED_PRICE" ? Number(editShopStock || 0) : 0,
                isAvailable: editShopAvailable,
              };
            }
            return item;
          })
        );

        setEditingShopItem(null);
      } else {
        setMessage({
          type: "error",
          text: `UPDATE_SHOP_FAILED: ${res.error || "Failed to update item."}`,
        });
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: `SYSTEM_ERROR: ${err.message || "Failed to communicate edit with server."}`,
      });
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteShopItem = async (itemId: string, title: string) => {
    if (!confirm(`CAUTION: Are you sure you want to permanently delete item "${title}"?`)) return;

    setLoading(`delete-shop-${itemId}`);
    setMessage(null);

    try {
      const res = await adminDeleteShopItem(itemId);
      if (res.success) {
        setMessage({
          type: "success",
          text: `SHOP_ITEM_DELETED: '${title}' has been removed from catalog.`,
        });
        setShopItems((prev) => prev.filter((item) => item.id !== itemId));
      } else {
        setMessage({
          type: "error",
          text: `DELETE_SHOP_FAILED: ${res.error || "Failed to delete item."}`,
        });
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: `SYSTEM_ERROR: ${err.message || "Delete transaction failed."}`,
      });
    } finally {
      setLoading(null);
    }
  };

  return (
        <div className="flex flex-col gap-6">
            {/* Top Diagnostics Header / Warning Banner */}
            <section className="bg-amber-950/20 border border-amber-500/40 rounded-lg p-5 shadow-[0_0_15px_rgba(245,158,11,0.05)] flex flex-col gap-4">
                <div>
                    <h2 className="text-xl font-bold tracking-widest text-amber-400 uppercase">
                        🛡️ SYSTEM_CONTROL_MATRIX_
                    </h2>
                    <p className="text-zinc-500 text-xs mt-1">
                        Authorized Admin Gateway: Modify daily quest releases, review physical scout milestones, and apply manual credit overrides.
                    </p>
                </div>

                {/* Night Nav Status Toggler */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-amber-500/10">
                    <div>
                        <div className="text-xs font-bold text-zinc-300 uppercase">📡 Night Navigation Access:</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5 uppercase">
                            Current state: {nightNavActive ? "ONLINE (ALL ROVERS AUTHORIZED)" : "OFFLINE (RESTRICTED TO ADMINS)"}
                        </div>
                    </div>
                    <button
                        onClick={handleToggleNightNav}
                        disabled={loading === "toggle-nav"}
                        className={`px-4 py-2 text-xs font-extrabold rounded uppercase tracking-wider transition cursor-pointer ${nightNavActive
                            ? "bg-red-950/20 border border-red-500/40 text-red-500 hover:bg-red-950/40 hover:text-red-400"
                            : "bg-green-950/20 border border-green-500/40 text-green-500 hover:bg-green-950/40 hover:text-green-400"
                            }`}
                    >
                        {loading === "toggle-nav" ? "PROCESSING..." : nightNavActive ? "DEACTIVATE NIGHT_NAV" : "ACTIVATE NIGHT_NAV"}
                    </button>
                </div>

                {message && (
                    <div
                        className={`text-xs p-3 rounded border uppercase font-bold tracking-wide ${message.type === "success"
                            ? "bg-green-950/30 border-green-500/50 text-green-400 animate-pulse"
                            : "bg-red-950/30 border-red-500/50 text-red-400"
                            }`}
                    >
                        {message.text}
                    </div>
                )}
            </section>

            {/* Workstation Console Tabs */}
            <div className="flex flex-wrap border-b border-amber-500/20 bg-zinc-950/40 p-1.5 rounded-t-lg gap-2 text-xs font-bold uppercase tracking-wider">
                <button
                    onClick={() => setActiveTab("scouts")}
                    className={`px-4 py-2 rounded transition cursor-pointer ${activeTab === "scouts"
                        ? "bg-amber-500 text-black shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                        : "text-zinc-400 hover:text-amber-400 hover:bg-amber-950/15"
                        }`}
                >
                    👥 Scout Operations
                </button>
                <button
                    onClick={() => setActiveTab("challenges")}
                    className={`px-4 py-2 rounded transition cursor-pointer ${activeTab === "challenges"
                        ? "bg-amber-500 text-black shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                        : "text-zinc-400 hover:text-amber-400 hover:bg-amber-950/15"
                        }`}
                >
                    🔑 Challenge Control
                </button>
                <button
                    onClick={() => setActiveTab("registry")}
                    className={`px-4 py-2 rounded transition cursor-pointer ${activeTab === "registry"
                        ? "bg-amber-500 text-black shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                        : "text-zinc-400 hover:text-amber-400 hover:bg-amber-950/15"
                        }`}
                >
                    👤 User Registry
                </button>
                <button
                    onClick={() => setActiveTab("marketplace")}
                    className={`px-4 py-2 rounded transition cursor-pointer ${activeTab === "marketplace"
                        ? "bg-amber-500 text-black shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                        : "text-zinc-400 hover:text-amber-400 hover:bg-amber-950/15"
                        }`}
                >
                    🛒 Marketplace Control
                </button>
                <button
                    onClick={() => setActiveTab("logs")}
                    className={`px-4 py-2 rounded transition cursor-pointer ${activeTab === "logs"
                        ? "bg-amber-500 text-black shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                        : "text-zinc-400 hover:text-amber-400 hover:bg-amber-950/15"
                        }`}
                >
                    📋 System Logs
                </button>
            </div>

            {/* Tab Panels */}
            <div className="bg-zinc-950/20 border-x border-b border-amber-500/20 p-5 rounded-b-lg shadow-[0_4px_20px_rgba(0,0,0,0.5)] min-h-[400px]">
                {/* Tab 1: Scout Operations */}
                {activeTab === "scouts" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Side: Scout list */}
                        <div className="lg:col-span-8 flex flex-col gap-4">
                            <h3 className="text-xs font-bold text-amber-400/90 tracking-widest uppercase bg-amber-950/20 border border-amber-500/20 px-3 py-1.5 rounded w-fit">
                                📋 ROVER_MATRIX_&_SIGN_OFFS
                            </h3>

                            <div className="flex flex-col gap-4">
                                {rovers.length === 0 ? (
                                    <p className="text-zinc-600 text-xs py-2">No registered scouts found in database.</p>
                                ) : (
                                    rovers.map((rover) => {
                                        const pendingCompletions = rover.questCompletions.filter((c) => !c.isVerified);
                                        return (
                                            <div
                                                key={rover.id}
                                                className="border border-amber-500/10 bg-black/35 p-4 rounded-lg flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-amber-500/30 transition duration-300"
                                            >
                                                {/* Name & Metadata info */}
                                                <div className="flex-1 flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                        <span className="font-extrabold text-zinc-100 text-sm tracking-wide">{rover.fullName}</span>
                                                    </div>

                                                    <div className="text-[10px] text-zinc-500 uppercase flex flex-wrap gap-x-3 gap-y-1">
                                                        <span>Faction: <strong className="text-zinc-300">{rover.roverProfile?.faction || "NONE"}</strong></span>
                                                        <span>|</span>
                                                        <span>Unit: <strong className="text-zinc-300">{rover.unit || "N/A"}</strong></span>
                                                    </div>

                                                    {/* Phone Editor */}
                                                    <div className="text-[10px] uppercase flex items-center gap-2 mt-1">
                                                        <span className="text-zinc-500">Phone:</span>
                                                        {editingPhoneId === rover.id ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <input
                                                                    type="text"
                                                                    value={phoneVal}
                                                                    onChange={(e) => setPhoneVal(e.target.value)}
                                                                    disabled={loading === `phone-${rover.id}`}
                                                                    className="bg-black border border-amber-500/40 text-zinc-200 px-2 py-0.5 text-[9px] rounded focus:outline-none focus:border-amber-400 w-28 font-semibold"
                                                                />
                                                                <button
                                                                    onClick={() => handleSavePhone(rover.id)}
                                                                    disabled={loading === `phone-${rover.id}`}
                                                                    className="bg-green-500 hover:bg-green-400 text-black px-1.5 py-0.5 rounded text-[8px] font-extrabold cursor-pointer"
                                                                >
                                                                    SAVE
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingPhoneId(null)}
                                                                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded text-[8px] font-extrabold cursor-pointer"
                                                                >
                                                                    CANCEL
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-zinc-300 font-bold">{rover.roverProfile?.phoneNumber || "UNSPECIFIED"}</span>
                                                                <button
                                                                    onClick={() => startEditPhone(rover.id, rover.roverProfile?.phoneNumber || "")}
                                                                    className="text-amber-500 hover:underline text-[9px] cursor-pointer"
                                                                >
                                                                    [EDIT_]
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Credits modifier */}
                                                    {adjustingCreditsId === rover.id ? (
                                                        <div className="mt-3 p-3 bg-black/60 border border-amber-500/20 rounded flex flex-col gap-2 max-w-sm">
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    value={inlineCreditsAmount}
                                                                    onChange={(e) => {
                                                                        const v = e.target.value;
                                                                        setInlineCreditsAmount(v === "" ? "" : Number(v));
                                                                    }}
                                                                    placeholder="e.g. 100 or -50"
                                                                    disabled={loading === `credits-${rover.id}`}
                                                                    className="bg-zinc-950 border border-amber-500/35 text-zinc-100 text-xs px-2.5 py-1 rounded focus:outline-none focus:border-amber-400 w-32 font-semibold"
                                                                />
                                                                <span className="text-[10px] text-zinc-500">Credits (use negative to deduct)</span>
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={inlineAdjustReason}
                                                                onChange={(e) => setInlineAdjustReason(e.target.value)}
                                                                placeholder="Reason for adjustment"
                                                                disabled={loading === `credits-${rover.id}`}
                                                                className="bg-zinc-950 border border-amber-500/35 text-zinc-100 text-xs px-2.5 py-1 rounded focus:outline-none focus:border-amber-400 w-full"
                                                            />
                                                            <div className="flex gap-2 justify-end">
                                                                <button
                                                                    onClick={() => handleInlineAdjustCredits(rover.id)}
                                                                    disabled={loading === `credits-${rover.id}`}
                                                                    className="bg-amber-500 hover:bg-amber-400 text-black text-[9px] font-extrabold px-2.5 py-1 rounded cursor-pointer"
                                                                >
                                                                    CONFIRM_ADJUST
                                                                </button>
                                                                <button
                                                                    onClick={() => setAdjustingCreditsId(null)}
                                                                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[9px] font-extrabold px-2.5 py-1 rounded cursor-pointer"
                                                                >
                                                                    CANCEL
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-[10px] uppercase flex items-center gap-2 mt-1">
                                                            <span className="text-zinc-500">Balance:</span>
                                                            <span className="text-amber-400 font-extrabold">{rover.roverProfile?.roverCredits || 0} CR</span>
                                                            <button
                                                                onClick={() => {
                                                                    setAdjustingCreditsId(rover.id);
                                                                    setInlineCreditsAmount("");
                                                                    setInlineAdjustReason("");
                                                                }}
                                                                className="text-amber-500 hover:underline text-[9px] cursor-pointer"
                                                            >
                                                                [ADJUST_BALANCE_]
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Pending completions approvals */}
                                                <div className="flex flex-col gap-2 min-w-[200px] border-t md:border-t-0 md:border-l border-amber-500/10 pt-3 md:pt-0 md:pl-4">
                                                    <div className="text-[10px] text-zinc-500 uppercase mb-1">Awaiting Sign-Offs</div>
                                                    {pendingCompletions.length === 0 ? (
                                                        <div className="text-[10px] text-zinc-600 uppercase italic">
                                                            No pending approvals
                                                        </div>
                                                    ) : (
                                                        pendingCompletions.map((comp) => (
                                                            <div
                                                                key={comp.questId}
                                                                className="flex items-center justify-between gap-3 text-xs bg-amber-950/10 border border-amber-500/15 p-2 rounded"
                                                            >
                                                                <span className="font-semibold text-zinc-300 truncate max-w-[120px]" title={comp.quest.title}>
                                                                    {comp.quest.title} (+{comp.quest.creditReward} CR)
                                                                </span>
                                                                <button
                                                                    onClick={() =>
                                                                        handleApproveSignOff(
                                                                            rover.id,
                                                                            comp.questId,
                                                                            comp.quest.title,
                                                                            rover.fullName
                                                                        )
                                                                    }
                                                                    disabled={loading === `approve-${rover.id}-${comp.questId}`}
                                                                    className="bg-amber-500 hover:bg-amber-400 text-black text-[9px] font-extrabold px-2.5 py-1 rounded cursor-pointer transition uppercase whitespace-nowrap"
                                                                >
                                                                    {loading === `approve-${rover.id}-${comp.questId}`
                                                                        ? "VERIFYING..."
                                                                        : "APPROVE_"}
                                                                </button>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Right Side: Hot Spot controls */}
                        <div className="lg:col-span-4 flex flex-col gap-4">
                            <h3 className="text-xs font-bold text-amber-400/90 tracking-widest uppercase bg-amber-950/20 border border-amber-500/20 px-3 py-1.5 rounded w-fit">
                                🚨 HOT-SPOT_MANAGEMENT
                            </h3>

                            <div className="border border-amber-500/20 bg-black/40 p-4 rounded-lg flex flex-col gap-4">
                                <p className="text-[10px] text-zinc-400 uppercase leading-relaxed tracking-wider">
                                    Spawns an active King-of-the-Hill coordinate blip on the map. Scouts must coordinate checking in within 20s without opposing interruption to conquer it.
                                </p>

                                <form onSubmit={handleSpawnHotSpot} className="flex flex-col gap-3">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[9px] uppercase font-bold text-amber-500/80">Hot-Spot Name</label>
                                        <input
                                            type="text"
                                            value={hotspotName}
                                            onChange={(e) => setHotspotName(e.target.value)}
                                            placeholder="e.g. 🚨 HOT-ZONE CHARLIE"
                                            className="bg-black border border-amber-500/20 text-zinc-100 p-2 text-xs rounded focus:outline-none focus:border-amber-500 w-full font-mono font-semibold"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[9px] uppercase font-bold text-amber-500/80">Latitude (Optional)</label>
                                            <input
                                                type="number"
                                                step="any"
                                                value={hotspotLat}
                                                onChange={(e) => setHotspotLat(e.target.value)}
                                                placeholder="e.g. 34.1205"
                                                className="bg-black border border-amber-500/20 text-zinc-100 p-2 text-xs rounded focus:outline-none focus:border-amber-500 w-full font-mono"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[9px] uppercase font-bold text-amber-500/80">Longitude (Optional)</label>
                                            <input
                                                type="number"
                                                step="any"
                                                value={hotspotLng}
                                                onChange={(e) => setHotspotLng(e.target.value)}
                                                placeholder="e.g. 35.6482"
                                                className="bg-black border border-amber-500/20 text-zinc-100 p-2 text-xs rounded focus:outline-none focus:border-amber-500 w-full font-mono"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading === "spawn-hotspot"}
                                        className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs py-2.5 rounded transition uppercase cursor-pointer mt-2"
                                    >
                                        {loading === "spawn-hotspot" ? "SPAWNING..." : "🚨 SPAWN HOT-SPOT"}
                                    </button>
                                </form>

                                <div className="border-t border-amber-500/10 pt-4 flex flex-col gap-2">
                                    <span className="text-[9px] uppercase font-extrabold text-zinc-500">Global Controls</span>
                                    <button
                                        type="button"
                                        onClick={handleClearHotSpots}
                                        disabled={loading === "clear-hotspots"}
                                        className="w-full bg-red-950/20 border border-red-500/40 hover:bg-red-500 hover:text-black text-red-400 font-extrabold text-xs py-2 rounded transition uppercase cursor-pointer"
                                    >
                                        {loading === "clear-hotspots" ? "CLEARING..." : "❌ WIPE ALL HOT-SPOTS"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 2: Challenge Control */}
                {activeTab === "challenges" && (
                    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                        {/* Clue dropper list */}
                        <div className="flex-1 flex flex-col gap-4">
                            <h3 className="text-xs font-bold text-amber-400/90 tracking-widest uppercase bg-amber-950/20 border border-amber-500/20 px-3 py-1.5 rounded w-fit">
                                🔑 ACTIVE_QUESTS_&_CLUES
                            </h3>

                            <div className="bg-zinc-950/40 border border-amber-500/20 rounded-lg overflow-hidden shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="border-b border-amber-500/20 bg-black/40 text-amber-500/70 font-bold uppercase tracking-wider">
                                                <th className="p-3.5">Quest Title</th>
                                                <th className="p-3.5">Verify Method</th>
                                                <th className="p-3.5">Reward</th>
                                                <th className="p-3.5 text-center">Released</th>
                                                <th className="p-3.5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-amber-500/10 text-zinc-300">
                                            {quests.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="p-4 text-center text-zinc-500 italic">
                                                        No challenges created yet.
                                                    </td>
                                                </tr>
                                            ) : (
                                                quests.map((quest) => (
                                                    <tr key={quest.id} className="hover:bg-amber-950/5 transition">
                                                        <td className="p-3.5">
                                                            <div className="font-bold text-zinc-100">{quest.title}</div>
                                                            <div className="text-[10px] text-zinc-500 mt-0.5 uppercase">
                                                                Scheduled: {new Date(quest.unlockedAtDate).toLocaleString()}
                                                            </div>
                                                        </td>
                                                        <td className="p-3.5 text-[10px] uppercase font-bold text-zinc-400">
                                                            {quest.verificationType === "DIGITAL_CODE" ? "Cipher Hash" : "Leader Sign-Off"}
                                                        </td>
                                                        <td className="p-3.5 font-bold text-amber-300">+{quest.creditReward} CR</td>
                                                        <td className="p-3.5 text-center">
                                                            <button
                                                                onClick={() => handleToggleRelease(quest.id, quest.isReleased)}
                                                                disabled={loading === `quest-${quest.id}`}
                                                                className={`px-2 py-1 rounded text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition ${quest.isReleased
                                                                    ? "bg-green-950/30 border border-green-500/30 text-green-400 hover:bg-green-950/50"
                                                                    : "bg-red-950/30 border-red-500/30 text-red-400 hover:bg-red-950/50"
                                                                    }`}
                                                            >
                                                                {loading === `quest-${quest.id}`
                                                                    ? "WAIT_"
                                                                    : quest.isReleased
                                                                        ? "ACTIVE [ON]"
                                                                        : "LOCKED [OFF]"}
                                                            </button>
                                                        </td>
                                                        <td className="p-3.5 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => handleEditQuestClick(quest)}
                                                                    className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-black transition cursor-pointer text-[10px]"
                                                                >
                                                                    EDIT_
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteQuest(quest.id, quest.title)}
                                                                    disabled={loading === `delete-quest-${quest.id}`}
                                                                    className="px-2 py-1 rounded bg-red-950/30 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-black transition cursor-pointer text-[10px]"
                                                                >
                                                                    {loading === `delete-quest-${quest.id}` ? "DELETING..." : "DELETE_"}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Create challenge form */}
                        <div className="w-full lg:w-96 flex flex-col gap-4">
                            <h3 className="text-xs font-bold text-amber-400/90 tracking-widest uppercase bg-amber-950/20 border border-amber-500/20 px-3 py-1.5 rounded w-fit">
                                🏆 CREATE_CHALLENGE
                            </h3>

                            <form
                                onSubmit={handleAddQuest}
                                className="bg-zinc-950/40 border border-amber-500/20 rounded-lg p-5 flex flex-col gap-4 shadow-[0_0_10px_rgba(0,0,0,0.5)] text-left"
                            >
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] uppercase text-amber-500/60 font-bold">Title:</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Fire Building"
                                        value={newQuestTitle}
                                        onChange={(e) => setNewQuestTitle(e.target.value)}
                                        className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold placeholder:text-zinc-700"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] uppercase text-amber-500/60 font-bold">Reward (CR):</label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="e.g. 150"
                                        value={newQuestReward}
                                        onChange={(e) => setNewQuestReward(e.target.value === "" ? "" : Number(e.target.value))}
                                        className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold placeholder:text-zinc-700"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] uppercase text-amber-500/60 font-bold">Instructions:</label>
                                    <textarea
                                        required
                                        rows={3}
                                        placeholder="Challenge description..."
                                        value={newQuestDesc}
                                        onChange={(e) => setNewQuestDesc(e.target.value)}
                                        className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold placeholder:text-zinc-700 font-mono"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] uppercase text-amber-500/60 font-bold">Verification Type:</label>
                                    <select
                                        value={newQuestType}
                                        onChange={(e) => setNewQuestType(e.target.value as "DIGITAL_CODE" | "LEADER_SIGN_OFF")}
                                        className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
                                    >
                                        <option value="DIGITAL_CODE">Digital Code Entry</option>
                                        <option value="LEADER_SIGN_OFF">Scout Leader Sign-Off</option>
                                    </select>
                                </div>

                                {newQuestType === "DIGITAL_CODE" && (
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] uppercase text-amber-500/60 font-bold">Cipher Answer Key:</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. SUNRISE"
                                            value={newQuestAnswer}
                                            onChange={(e) => setNewQuestAnswer(e.target.value)}
                                            className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold placeholder:text-zinc-700"
                                        />
                                    </div>
                                )}

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] uppercase text-amber-500/60 font-bold">Unlock Date / Time:</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={newQuestDate}
                                        onChange={(e) => setNewQuestDate(e.target.value)}
                                        className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold placeholder:text-zinc-700"
                                    />
                                </div>

                                <div className="flex items-center gap-2 mt-2">
                                    <input
                                        type="checkbox"
                                        id="newQuestReleased"
                                        checked={newQuestReleased}
                                        onChange={(e) => setNewQuestReleased(e.target.checked)}
                                        className="w-4 h-4 rounded text-amber-500 bg-black border-amber-500/30 focus:ring-0 cursor-pointer"
                                    />
                                    <label htmlFor="newQuestReleased" className="text-xs uppercase text-zinc-300 font-bold cursor-pointer">
                                        Release immediately
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading === "add-quest"}
                                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs py-2.5 rounded transition uppercase cursor-pointer mt-2"
                                >
                                    {loading === "add-quest" ? "CREATING..." : "SCHEDULE_QUEST_"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Tab 3: User Registry */}
                {activeTab === "registry" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left Side: Create User Form */}
                        <div className="lg:col-span-4 flex flex-col gap-4">
                            <h3 className="text-xs font-bold text-amber-400/90 tracking-widest uppercase bg-amber-950/20 border border-amber-500/20 px-3 py-1.5 rounded w-fit">
                                👤 CREATE_USER_ACCOUNT
                            </h3>

                            <form
                                onSubmit={handleAddUser}
                                className="bg-zinc-950/40 border border-amber-500/20 rounded-lg p-5 flex flex-col gap-4 shadow-[0_0_10px_rgba(0,0,0,0.5)] text-left"
                            >
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] uppercase text-amber-500/60 font-bold">Full Name:</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Nicolas Nasr"
                                        value={newUserFullName}
                                        onChange={(e) => setNewUserFullName(e.target.value)}
                                        className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold placeholder:text-zinc-700"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] uppercase text-amber-500/60 font-bold">Email Address:</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="e.g. nicolas@sdc.org"
                                        value={newUserEmail}
                                        onChange={(e) => setNewUserEmail(e.target.value)}
                                        className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold placeholder:text-zinc-700"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] uppercase text-amber-500/60 font-bold">Password:</label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="Password string"
                                        value={newUserPassword}
                                        onChange={(e) => setNewUserPassword(e.target.value)}
                                        className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold placeholder:text-zinc-700"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] uppercase text-amber-500/60 font-bold">Role:</label>
                                    <select
                                        required
                                        value={newUserRole}
                                        onChange={(e) => setNewUserRole(e.target.value as "scout" | "admin")}
                                        className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
                                    >
                                        <option value="scout">Scout (Normal Rover)</option>
                                        <option value="admin">Administrator (Leader)</option>
                                    </select>
                                </div>

                                {newUserRole === "scout" && (
                                    <>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] uppercase text-amber-500/60 font-bold">Faction Assignment:</label>
                                            <select
                                                value={newUserFaction}
                                                onChange={(e) => setNewUserFaction(e.target.value as "ALPHA" | "BRAVO" | "")}
                                                className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
                                            >
                                                <option value="">Unassigned</option>
                                                <option value="ALPHA">ALPHA (Red Faction)</option>
                                                <option value="BRAVO">BRAVO (Blue Faction)</option>
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] uppercase text-amber-500/60 font-bold">WhatsApp Number:</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. +96170123456"
                                                value={newUserPhone}
                                                onChange={(e) => setNewUserPhone(e.target.value)}
                                                className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold placeholder:text-zinc-700"
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] uppercase text-amber-500/60 font-bold">Unit / Section (Optional):</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Rovers Ra"
                                        value={newUserUnit}
                                        onChange={(e) => setNewUserUnit(e.target.value)}
                                        className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold placeholder:text-zinc-700"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading === "add-user"}
                                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs py-2.5 rounded transition uppercase cursor-pointer mt-2"
                                >
                                    {loading === "add-user" ? "REGISTERING_USER..." : "INITIALIZE_ACCOUNT_"}
                                </button>
                            </form>
                        </div>

                        {/* Right Side: Registered Accounts Directory */}
                        <div className="lg:col-span-8 flex flex-col gap-4">
                            <h3 className="text-xs font-bold text-amber-400/90 tracking-widest uppercase bg-amber-950/20 border border-amber-500/20 px-3 py-1.5 rounded w-fit">
                                👥 ACCOUNTS_DIRECTORY ({rovers.length})
                            </h3>

                            <div className="bg-zinc-950/40 border border-amber-500/20 rounded-lg overflow-x-auto shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                                <table className="w-full text-left border-collapse text-xs font-semibold text-zinc-300">
                                    <thead>
                                        <tr className="border-b border-amber-500/20 bg-black/60 text-amber-500 uppercase text-[10px] tracking-wider">
                                            <th className="p-3 bg-black/40">Name / Email</th>
                                            <th className="p-3 bg-black/40">Role</th>
                                            <th className="p-3 bg-black/40">Faction / Unit</th>
                                            <th className="p-3 bg-black/40">Phone</th>
                                            <th className="p-3 text-right bg-black/40">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rovers.map((r) => (
                                            <tr key={r.id} className="border-b border-amber-500/10 hover:bg-amber-950/5">
                                                <td className="p-3">
                                                    <div className="font-bold text-zinc-200">{r.fullName}</div>
                                                    <div className="text-[10px] text-zinc-500">{r.email}</div>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                        r.role === "admin" 
                                                            ? "bg-purple-950/60 border border-purple-500/30 text-purple-400" 
                                                            : "bg-zinc-900 border border-zinc-700 text-zinc-400"
                                                    }`}>
                                                        {r.role?.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <div>
                                                        {r.roverProfile?.faction ? (
                                                            <span className={`font-bold ${r.roverProfile.faction === "ALPHA" ? "text-red-400" : "text-blue-400"}`}>
                                                                {r.roverProfile.faction}
                                                            </span>
                                                        ) : (
                                                            <span className="text-zinc-600">-</span>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-zinc-500">{r.unit || "No unit"}</div>
                                                </td>
                                                <td className="p-3 font-mono">{r.roverProfile?.phoneNumber || "-"}</td>
                                                <td className="p-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEditRoverClick(r)}
                                                            className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-black transition cursor-pointer text-[10px]"
                                                        >
                                                            EDIT_
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteRover(r.id, r.fullName)}
                                                            disabled={loading === `delete-rover-${r.id}`}
                                                            className="px-2 py-1 rounded bg-red-950/30 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-black transition cursor-pointer text-[10px]"
                                                        >
                                                            {loading === `delete-rover-${r.id}` ? "DELETING..." : "DELETE_"}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 4: Marketplace Control */}
                {activeTab === "marketplace" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left Side: Create Form */}
                        <div className="lg:col-span-4 flex flex-col gap-4">
                            <h3 className="text-xs font-bold text-amber-400/90 tracking-widest uppercase bg-amber-950/20 border border-amber-500/20 px-3 py-1.5 rounded w-fit">
                                🛒 ADD_MARKETPLACE_ITEM
                            </h3>

                            <form
                                onSubmit={handleAddShopItem}
                                className="bg-zinc-950/40 border border-amber-500/20 rounded-lg p-5 flex flex-col gap-4 shadow-[0_0_10px_rgba(0,0,0,0.5)] text-left"
                            >
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] uppercase text-amber-500/60 font-bold">Item Title:</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Solar Charger Pack"
                                        value={newShopTitle}
                                        onChange={(e) => setNewShopTitle(e.target.value)}
                                        className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold placeholder:text-zinc-700"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] uppercase text-amber-500/60 font-bold">Description:</label>
                                    <textarea
                                        required
                                        rows={3}
                                        placeholder="Camp equipment, food perks, or hacker ciphers..."
                                        value={newShopDesc}
                                        onChange={(e) => setNewShopDesc(e.target.value)}
                                        className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold placeholder:text-zinc-700 resize-none font-sans"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] uppercase text-amber-500/60 font-bold">Listing Type:</label>
                                    <select
                                        required
                                        value={newShopType}
                                        onChange={(e) => setNewShopType(e.target.value as "FIXED_PRICE" | "AUCTION")}
                                        className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
                                    >
                                        <option value="FIXED_PRICE">Fixed Price Store</option>
                                        <option value="AUCTION">Live Bidding Auction</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] uppercase text-amber-500/60 font-bold">
                                        {newShopType === "FIXED_PRICE" ? "Price (Credits):" : "Starting Bid (Credits):"}
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min={0}
                                        placeholder="e.g. 50"
                                        value={newShopPrice}
                                        onChange={(e) => setNewShopPrice(e.target.value === "" ? "" : Number(e.target.value))}
                                        className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold placeholder:text-zinc-700"
                                    />
                                </div>

                                {newShopType === "FIXED_PRICE" && (
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] uppercase text-amber-500/60 font-bold">Available Stock:</label>
                                        <input
                                            type="number"
                                            required
                                            min={1}
                                            placeholder="e.g. 10"
                                            value={newShopStock}
                                            onChange={(e) => setNewShopStock(e.target.value === "" ? "" : Number(e.target.value))}
                                            className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold placeholder:text-zinc-700"
                                        />
                                    </div>
                                )}

                                <div className="flex items-center gap-2 mt-1">
                                    <input
                                        type="checkbox"
                                        id="newShopAvailable"
                                        checked={newShopAvailable}
                                        onChange={(e) => setNewShopAvailable(e.target.checked)}
                                        className="accent-amber-500"
                                    />
                                    <label htmlFor="newShopAvailable" className="text-[10px] uppercase text-amber-500/80 font-bold cursor-pointer select-none">
                                        Is Available for purchase / bidding
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading === "add-shop"}
                                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs py-2.5 rounded transition uppercase cursor-pointer mt-2"
                                >
                                    {loading === "add-shop" ? "CREATING_ITEM..." : "CREATE_SHOP_ITEM_"}
                                </button>
                            </form>
                        </div>

                        {/* Right Side: Catalog table */}
                        <div className="lg:col-span-8 flex flex-col gap-4">
                            <h3 className="text-xs font-bold text-amber-400/90 tracking-widest uppercase bg-amber-950/20 border border-amber-500/20 px-3 py-1.5 rounded w-fit">
                                🛒 CATALOG_INDEX ({shopItems.length})
                            </h3>

                            <div className="bg-zinc-950/40 border border-amber-500/20 rounded-lg overflow-x-auto shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                                <table className="w-full text-left border-collapse text-xs font-semibold text-zinc-300">
                                    <thead>
                                        <tr className="border-b border-amber-500/20 bg-black/60 text-amber-500 uppercase text-[10px] tracking-wider">
                                            <th className="p-3 bg-black/40">Item details</th>
                                            <th className="p-3 bg-black/40">Type</th>
                                            <th className="p-3 bg-black/40">Value</th>
                                            <th className="p-3 bg-black/40">Status</th>
                                            <th className="p-3 text-right bg-black/40">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {shopItems.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-zinc-600">No shop items in catalog.</td>
                                            </tr>
                                        ) : (
                                            shopItems.map((item) => (
                                                <tr key={item.id} className="border-b border-amber-500/10 hover:bg-amber-950/5">
                                                    <td className="p-3">
                                                        <div className="font-bold text-zinc-200">{item.title}</div>
                                                        <div className="text-[10px] text-zinc-500 line-clamp-1">{item.description}</div>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                            item.type === "AUCTION" 
                                                                ? "bg-purple-950/50 border border-purple-500/30 text-purple-400" 
                                                                : "bg-blue-950/50 border border-blue-500/30 text-blue-400"
                                                        }`}>
                                                            {item.type}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 font-bold text-amber-400">
                                                        {item.priceOrCurrentBid} CR
                                                        {item.type === "FIXED_PRICE" && <span className="text-[10px] text-zinc-500 block font-normal">Stock: {item.stock}</span>}
                                                        {item.type === "AUCTION" && item.highestBidder && (
                                                            <span className="text-[10px] text-purple-400 block font-normal">Bid by: {item.highestBidder.fullName}</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                            item.isAvailable 
                                                                ? "bg-green-950/50 border border-green-500/30 text-green-400" 
                                                                : "bg-red-950/50 border border-red-500/30 text-red-400"
                                                        }`}>
                                                            {item.isAvailable ? "ACTIVE" : "LOCKED"}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                    onClick={() => handleEditShopClick(item)}
                                                                    className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-black transition cursor-pointer text-[10px]"
                                                            >
                                                                EDIT_
                                                            </button>
                                                            <button
                                                                    onClick={() => handleDeleteShopItem(item.id, item.title)}
                                                                    disabled={loading === `delete-shop-${item.id}`}
                                                                    className="px-2 py-1 rounded bg-red-950/30 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-black transition cursor-pointer text-[10px]"
                                                            >
                                                                {loading === `delete-shop-${item.id}` ? "DELETING..." : "DELETE_"}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 5: System Logs */}
                {activeTab === "logs" && (
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center bg-zinc-950/40 border border-amber-500/20 px-4 py-3 rounded-lg">
                            <div className="flex flex-col gap-0.5">
                                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                                    📋 SYSTEM_AUDIT_&_DISPATCH_LOGS
                                </h3>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                                    Displaying last 200 real-time events, WhatsApp receipts, and admin audits.
                                </p>
                            </div>
                            <button
                                onClick={async () => {
                                    setLoading("refresh-logs");
                                    try {
                                        const res = await fetch("/api/admin/logs");
                                        const data = await res.json();
                                        if (data.logs) {
                                            setLogs(data.logs);
                                            setMessage({ text: "SYSTEM LOG DATABASE SYNCED SUCCESSFULLY", type: "success" });
                                        }
                                    } catch (err) {
                                        setMessage({ text: "FAILED TO REFRESH LOG MATRIX", type: "error" });
                                    } finally {
                                        setLoading(null);
                                    }
                                }}
                                disabled={loading === "refresh-logs"}
                                className="px-3 py-1.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-black transition cursor-pointer text-xs font-bold uppercase tracking-wider"
                            >
                                {loading === "refresh-logs" ? "REFRESHING..." : "REFRESH LOGS"}
                            </button>
                        </div>

                        <div className="bg-zinc-950/40 border border-amber-500/20 rounded-lg overflow-x-auto shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                            <table className="w-full text-left border-collapse text-xs font-semibold text-zinc-300">
                                <thead>
                                    <tr className="border-b border-amber-500/20 bg-black/60 text-amber-500 uppercase text-[10px] tracking-wider">
                                        <th className="p-3 bg-black/40">Timestamp</th>
                                        <th className="p-3 bg-black/40">Log Category</th>
                                        <th className="p-3 bg-black/40">Details & Payload</th>
                                        <th className="p-3 bg-black/40 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-zinc-600">No logs found in registry.</td>
                                        </tr>
                                    ) : (
                                        logs.map((log) => (
                                            <tr key={log.id} className="border-b border-amber-500/10 hover:bg-amber-950/5 align-top">
                                                <td className="p-3 text-[10px] text-zinc-500 whitespace-nowrap">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </td>
                                                <td className="p-3">
                                                    <div className={`text-[10px] font-bold tracking-wide uppercase ${
                                                        log.phone === "SYSTEM" 
                                                            ? "text-amber-400" 
                                                            : "text-purple-400"
                                                    }`}>
                                                        {log.phone === "SYSTEM" ? "🛡️ SYSTEM_AUDIT" : `📱 WA: ${log.phone}`}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="text-zinc-200 font-mono text-[11px] max-w-xl break-words whitespace-pre-wrap">{log.body}</div>
                                                    {log.error && (
                                                        <div className="text-[10px] bg-red-950/30 border border-red-500/20 text-red-400 px-2 py-1 rounded mt-1.5 font-mono max-w-xl break-words">
                                                            {log.error}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                                        log.status === "LOG" 
                                                            ? "bg-amber-950/50 border border-amber-500/30 text-amber-400" 
                                                            : log.status === "SENT" 
                                                                ? "bg-green-950/50 border border-green-500/30 text-green-400" 
                                                                : "bg-red-950/50 border border-red-500/30 text-red-400"
                                                    }`}>
                                                        {log.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Overlays / Modals for Editing */}
            {editingRover && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-zinc-950 border-2 border-amber-500/40 rounded-lg max-w-md w-full p-6 shadow-[0_0_50px_rgba(245,158,11,0.15)] text-left font-mono">
                        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest border-b border-amber-500/20 pb-2 mb-4">
                            🔧 EDIT_USER_ACCOUNT: {editingRover.fullName}
                        </h3>

                        <form onSubmit={handleEditRoverSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase text-amber-500/60 font-bold">Full Name:</label>
                                <input
                                    type="text"
                                    required
                                    value={editRoverName}
                                    onChange={(e) => setEditRoverName(e.target.value)}
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase text-amber-500/60 font-bold">Email Address:</label>
                                <input
                                    type="email"
                                    required
                                    value={editRoverEmail}
                                    onChange={(e) => setEditRoverEmail(e.target.value)}
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase text-amber-500/60 font-bold">System Role:</label>
                                <select
                                    required
                                    value={editRoverRole}
                                    onChange={(e) => setEditRoverRole(e.target.value)}
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
                                >
                                    <option value="scout">Scout (Normal Rover)</option>
                                    <option value="admin">Administrator (Leader)</option>
                                </select>
                            </div>

                            {editRoverRole === "scout" && (
                                <>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] uppercase text-amber-500/60 font-bold">Faction Assignment:</label>
                                        <select
                                            value={editRoverFaction}
                                            onChange={(e) => setEditRoverFaction(e.target.value as "ALPHA" | "BRAVO" | "")}
                                            className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
                                        >
                                            <option value="">Unassigned</option>
                                            <option value="ALPHA">ALPHA (Red Faction)</option>
                                            <option value="BRAVO">BRAVO (Blue Faction)</option>
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] uppercase text-amber-500/60 font-bold">WhatsApp Number:</label>
                                        <input
                                            type="text"
                                            value={editRoverPhone}
                                            onChange={(e) => setEditRoverPhone(e.target.value)}
                                            className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
                                            placeholder="+961..."
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase text-amber-500/60 font-bold">Unit / Section (Optional):</label>
                                <input
                                    type="text"
                                    value={editRoverUnit}
                                    onChange={(e) => setEditRoverUnit(e.target.value)}
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
                                />
                            </div>

                            <div className="flex gap-3 justify-end mt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingRover(null)}
                                    className="px-4 py-2 border border-zinc-700 hover:bg-zinc-900 text-zinc-400 text-xs rounded transition uppercase cursor-pointer"
                                >
                                    CANCEL_
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading === `edit-rover-${editingRover.id}`}
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded transition uppercase cursor-pointer"
                                >
                                    {loading === `edit-rover-${editingRover.id}` ? "SAVING..." : "SAVE_CHANGES_"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editingQuest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
                    <div className="bg-zinc-950 border-2 border-amber-500/40 rounded-lg max-w-lg w-full p-6 shadow-[0_0_50px_rgba(245,158,11,0.15)] text-left font-mono my-8">
                        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest border-b border-amber-500/20 pb-2 mb-4">
                            🔧 EDIT_CHALLENGE: {editingQuest.title}
                        </h3>

                        <form onSubmit={handleEditQuestSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase text-amber-500/60 font-bold">Challenge Title:</label>
                                <input
                                    type="text"
                                    required
                                    value={editQuestTitle}
                                    onChange={(e) => setEditQuestTitle(e.target.value)}
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase text-amber-500/60 font-bold">Description / Prompt:</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={editQuestDesc}
                                    onChange={(e) => setEditQuestDesc(e.target.value)}
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold font-sans resize-none"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase text-amber-500/60 font-bold">Clue / Location Hint:</label>
                                <input
                                    type="text"
                                    value={editQuestHint}
                                    onChange={(e) => setEditQuestHint(e.target.value)}
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
                                    placeholder="Clue text for scouts"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] uppercase text-amber-500/60 font-bold">Reward (Credits):</label>
                                    <input
                                        type="number"
                                        required
                                        min={0}
                                        value={editQuestReward}
                                        onChange={(e) => setEditQuestReward(e.target.value === "" ? "" : Number(e.target.value))}
                                        className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] uppercase text-amber-500/60 font-bold">Verification Mode:</label>
                                    <select
                                        value={editQuestType}
                                        onChange={(e) => setEditQuestType(e.target.value as "DIGITAL_CODE" | "LEADER_SIGN_OFF")}
                                        className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
                                    >
                                        <option value="DIGITAL_CODE">Digital Code Answer</option>
                                        <option value="LEADER_SIGN_OFF">Manual Leader Sign-Off</option>
                                    </select>
                                </div>
                            </div>

                            {editQuestType === "DIGITAL_CODE" && (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] uppercase text-amber-500/60 font-bold">Answer Code (Optional - leave empty to keep current):</label>
                                    <input
                                        type="text"
                                        value={editQuestAnswer}
                                        onChange={(e) => setEditQuestAnswer(e.target.value)}
                                        className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
                                        placeholder="Plain text code"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] uppercase text-amber-500/60 font-bold">Unlock Date & Time:</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={editQuestDate}
                                        onChange={(e) => setEditQuestDate(e.target.value)}
                                        className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] uppercase text-amber-500/60 font-bold">Quest Phase:</label>
                                    <select
                                        value={editQuestPhase}
                                        onChange={(e) => setEditQuestPhase(e.target.value as "PRE_CAMP" | "LIVE_CAMP")}
                                        className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
                                    >
                                        <option value="PRE_CAMP">Pre-Camp Countdown</option>
                                        <option value="LIVE_CAMP">Live Camp Challenge</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                                <input
                                    type="checkbox"
                                    id="editQuestReleased"
                                    checked={editQuestReleased}
                                    onChange={(e) => setEditQuestReleased(e.target.checked)}
                                    className="accent-amber-500"
                                />
                                <label htmlFor="editQuestReleased" className="text-[10px] uppercase text-amber-500/80 font-bold cursor-pointer select-none">
                                    Is Released / Decryptable
                                </label>
                            </div>

                            <div className="flex gap-3 justify-end mt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingQuest(null)}
                                    className="px-4 py-2 border border-zinc-700 hover:bg-zinc-900 text-zinc-400 text-xs rounded transition uppercase cursor-pointer"
                                >
                                    CANCEL_
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading === `edit-quest-${editingQuest.id}`}
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded transition uppercase cursor-pointer"
                                >
                                    {loading === `edit-quest-${editingQuest.id}` ? "SAVING..." : "SAVE_CHANGES_"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editingShopItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-zinc-950 border-2 border-amber-500/40 rounded-lg max-w-md w-full p-6 shadow-[0_0_50px_rgba(245,158,11,0.15)] text-left font-mono">
                        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest border-b border-amber-500/20 pb-2 mb-4">
                            🔧 EDIT_MARKETPLACE_ITEM: {editingShopItem.title}
                        </h3>

                        <form onSubmit={handleEditShopSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase text-amber-500/60 font-bold">Item Title:</label>
                                <input
                                    type="text"
                                    required
                                    value={editShopTitle}
                                    onChange={(e) => setEditShopTitle(e.target.value)}
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase text-amber-500/60 font-bold">Description:</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={editShopDesc}
                                    onChange={(e) => setEditShopDesc(e.target.value)}
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold font-sans resize-none"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase text-amber-500/60 font-bold">Listing Type:</label>
                                <select
                                    required
                                    value={editShopType}
                                    onChange={(e) => setEditShopType(e.target.value as "FIXED_PRICE" | "AUCTION")}
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
                                >
                                    <option value="FIXED_PRICE">Fixed Price Store</option>
                                    <option value="AUCTION">Live Bidding Auction</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase text-amber-500/60 font-bold">
                                    {editShopType === "FIXED_PRICE" ? "Price (Credits):" : "Starting / Current Bid (Credits):"}
                                </label>
                                <input
                                    type="number"
                                    required
                                    min={0}
                                    value={editShopPrice}
                                    onChange={(e) => setEditShopPrice(e.target.value === "" ? "" : Number(e.target.value))}
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
                                />
                            </div>

                            {editShopType === "FIXED_PRICE" && (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] uppercase text-amber-500/60 font-bold">Available Stock:</label>
                                    <input
                                        type="number"
                                        required
                                        min={1}
                                        value={editShopStock}
                                        onChange={(e) => setEditShopStock(e.target.value === "" ? "" : Number(e.target.value))}
                                        className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
                                    />
                                </div>
                            )}

                            <div className="flex items-center gap-2 mt-1">
                                <input
                                    type="checkbox"
                                    id="editShopAvailable"
                                    checked={editShopAvailable}
                                    onChange={(e) => setEditShopAvailable(e.target.checked)}
                                    className="accent-amber-500"
                                />
                                <label htmlFor="editShopAvailable" className="text-[10px] uppercase text-amber-500/80 font-bold cursor-pointer select-none">
                                    Is Available for purchase / bidding
                                </label>
                            </div>

                            <div className="flex gap-3 justify-end mt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingShopItem(null)}
                                    className="px-4 py-2 border border-zinc-700 hover:bg-zinc-900 text-zinc-400 text-xs rounded transition uppercase cursor-pointer"
                                >
                                    CANCEL_
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading === `edit-shop-${editingShopItem.id}`}
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded transition uppercase cursor-pointer"
                                >
                                    {loading === `edit-shop-${editingShopItem.id}` ? "SAVING..." : "SAVE_CHANGES_"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
