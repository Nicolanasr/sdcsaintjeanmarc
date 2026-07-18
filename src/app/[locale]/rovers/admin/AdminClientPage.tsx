"use client";

import React, { useState, useEffect } from "react";
import {
    adminReleaseQuest,
    adminRevealBlindQuestResults,
    adminApproveSignOff,
    adminAdjustCredits,
    updateRoverPhoneNumber,
    adminToggleNightNav,
    adminToggleLuckyWheel,
    adminUpdateCapturePerimeter,
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
    adminMassUploadRovers,
    adminInviteUser,
    adminMassUploadQuests,
    adminMassUploadShopItems,
    adminDeclineSignOff,
    adminGetOperationHeliosGroup,
    adminSendQuestReminder,
    adminUpdateHotspotThreshold,
    adminUpdateHotspotCooldown,
    adminGetItemPurchaseHistory,
    adminGetQuestCompletions,
    adminGetQuestSubmissions,
    adminGetBlindQuestSubmissions,
    adminGetMarketplacePurchases,

    adminTogglePurchaseDelivery,
    adminGetUserPointHistory,
} from "@/app/actions/rovers";


const LocalDateStr = ({ date }: { date: string | Date }) => {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <span className="opacity-0">...</span>;
    }

    return <span>{new Date(date).toLocaleString()}</span>;
};

interface Quest {
    id: string;
    title: string;
    description?: string;
    clueHint?: string | null;
    creditReward: number;
    isReleased: boolean;
    isBlind?: boolean;
    unlockedAtDate: Date;
    expiresAt?: Date | string | null;
    verificationType: "DIGITAL_CODE" | "LEADER_SIGN_OFF";
    phase?: "PRE_CAMP" | "LIVE_CAMP";
}

interface Rover {
    id: string;
    fullName: string;
    email?: string;
    role?: string;
    unit: string | null;
    lastActiveAt?: Date | string | null;
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
    hintText: string | null;
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

interface GeoNode {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    radiusMeters: number;
    secretPasscode: string;
    controllingFaction: string | null;
    isHotSpot: boolean;
}

interface AdminClientPageProps {
    initialQuests: Quest[];
    initialRovers: Rover[];
    initialShopItems?: ShopItem[];
    initialLogs?: SystemLog[];
    initialNodes?: GeoNode[];
    locale: string;
    initialNightNavActive: boolean;
    initialHotspotThreshold?: number | null;
    initialLuckyWheelActive: boolean;
    initialCapturePerimeter: number;
    initialHotspotCooldown: number;
}

export default function AdminClientPage({
    initialQuests,
    initialRovers,
    initialShopItems = [],
    initialLogs = [],
    initialNodes = [],
    locale,
    initialNightNavActive,
    initialHotspotThreshold = null,
    initialLuckyWheelActive,
    initialCapturePerimeter,
    initialHotspotCooldown = 6,
}: AdminClientPageProps) {
    const [quests, setQuests] = useState<Quest[]>(initialQuests);
    const [rovers, setRovers] = useState<Rover[]>(initialRovers);
    const [shopItems, setShopItems] = useState<ShopItem[]>(initialShopItems);
    const [logs, setLogs] = useState<SystemLog[]>(initialLogs);
    const [nodes, setNodes] = useState<GeoNode[]>(initialNodes);
    const [logsPage, setLogsPage] = useState(1);
    const [logsTotalPages, setLogsTotalPages] = useState(1);
    const [logsTotal, setLogsTotal] = useState(0);
    const [logsLimit] = useState(50);
    const [nightNavActive, setNightNavActive] = useState(initialNightNavActive);
    const [luckyWheelActive, setLuckyWheelActive] = useState(initialLuckyWheelActive);
    const [capturePerimeter, setCapturePerimeter] = useState<number | "">(initialCapturePerimeter);
    const [hotspotThreshold, setHotspotThreshold] = useState<number | "">(initialHotspotThreshold ?? "");
    const [hotspotCooldown, setHotspotCooldown] = useState<number | "">(initialHotspotCooldown);

    // Search query states for tabs
    const [scoutSearchQuery, setScoutSearchQuery] = useState("");
    const [challengeSearchQuery, setChallengeSearchQuery] = useState("");
    const [marketSearchQuery, setMarketSearchQuery] = useState("");

    // Workstation active tab state
    const [activeTab, setActiveTab] = useState<"scouts" | "challenges" | "registry" | "marketplace" | "submissions" | "purchases" | "logs">("scouts");

    // Submissions and Purchases states
    const [completions, setCompletions] = useState<any[]>([]);
    const [submissionsList, setSubmissionsList] = useState<any[]>([]);
    const [purchasesList, setPurchasesList] = useState<any[]>([]);

    // Filters for Quest Submissions
    const [subFilterQuest, setSubFilterQuest] = useState("");
    const [subFilterUser, setSubFilterUser] = useState("");
    const [subFilterDate, setSubFilterDate] = useState("");
    const [submissionsPage, setSubmissionsPage] = useState(1);

    useEffect(() => {
        if (activeTab === "submissions") {
            setLoading("load-submissions");
            Promise.all([
                adminGetQuestCompletions(),
                adminGetQuestSubmissions()
            ]).then(([compRes, subRes]) => {
                if (compRes.success && compRes.completions) {
                    setCompletions(compRes.completions);
                } else {
                    alert(compRes.error || "Failed to load quest completions");
                }
                if (subRes.success && subRes.submissions) {
                    setSubmissionsList(subRes.submissions);
                } else {
                    console.error("Failed to load blind submissions:", subRes.error);
                }
            }).catch(err => console.error(err))
                .finally(() => setLoading(null));
        } else if (activeTab === "purchases") {
            setLoading("load-purchases");
            adminGetMarketplacePurchases().then((res) => {
                if (res.success && res.purchases) {
                    setPurchasesList(res.purchases);
                } else {
                    alert(res.error || "Failed to load purchases");
                }
            }).catch(err => console.error(err))
                .finally(() => setLoading(null));
        }
    }, [activeTab]);

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
    const [newQuestExpiry, setNewQuestExpiry] = useState("");
    const [newQuestReleased, setNewQuestReleased] = useState(false);
    const [newQuestIsBlind, setNewQuestIsBlind] = useState(false);

    // Hot Spot form state
    const [hotspotName, setHotspotName] = useState("");
    const [hotspotLat, setHotspotLat] = useState("");
    const [hotspotLng, setHotspotLng] = useState("");
    const [spawnIsHotSpot, setSpawnIsHotSpot] = useState(true);

    // Mass Upload form state
    const [massUploadText, setMassUploadText] = useState("");
    const [massUploadDelimiter, setMassUploadDelimiter] = useState(",");
    const [massUploadResult, setMassUploadResult] = useState<{ createdCount: number; skippedCount: number; errors: string[] } | null>(null);

    // Edit overlays state
    const [editingRover, setEditingRover] = useState<Rover | null>(null);
    const [editRoverName, setEditRoverName] = useState("");
    const [editRoverEmail, setEditRoverEmail] = useState("");
    const [editRoverRole, setEditRoverRole] = useState("scout");
    const [editRoverUnit, setEditRoverUnit] = useState("");
    const [editRoverFaction, setEditRoverFaction] = useState<"ALPHA" | "BRAVO" | "">("");
    const [editRoverPhone, setEditRoverPhone] = useState("");
    const [editRoverPassword, setEditRoverPassword] = useState("");

    const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
    const [editQuestTitle, setEditQuestTitle] = useState("");
    const [editQuestReward, setEditQuestReward] = useState<number | "">("");
    const [editQuestDesc, setEditQuestDesc] = useState("");
    const [editQuestHint, setEditQuestHint] = useState("");
    const [editQuestType, setEditQuestType] = useState<"DIGITAL_CODE" | "LEADER_SIGN_OFF">("DIGITAL_CODE");
    const [editQuestAnswer, setEditQuestAnswer] = useState("");
    const [editQuestDate, setEditQuestDate] = useState("");
    const [editQuestExpiry, setEditQuestExpiry] = useState("");
    const [editQuestPhase, setEditQuestPhase] = useState<"PRE_CAMP" | "LIVE_CAMP">("PRE_CAMP");
    const [editQuestReleased, setEditQuestReleased] = useState(false);
    const [editQuestIsBlind, setEditQuestIsBlind] = useState(false);

    const [decliningSignOff, setDecliningSignOff] = useState<{ roverId: string; questId: string; questTitle: string; roverName: string } | null>(null);
    const [declineReasonText, setDeclineReasonText] = useState("");

    const [reminderQuest, setReminderQuest] = useState<Quest | null>(null);
    const [reminderGroupId, setReminderGroupId] = useState("");

    const [editingShopItem, setEditingShopItem] = useState<ShopItem | null>(null);
    const [editShopTitle, setEditShopTitle] = useState("");
    const [editShopDesc, setEditShopDesc] = useState("");
    const [editShopType, setEditShopType] = useState<"FIXED_PRICE" | "AUCTION">("FIXED_PRICE");
    const [editShopPrice, setEditShopPrice] = useState<number | "">("");
    const [editShopStock, setEditShopStock] = useState<number | "">("");
    const [editShopAvailable, setEditShopAvailable] = useState(true);
    const [editShopHintText, setEditShopHintText] = useState("");

    // ShopItem Creation form state
    const [newShopTitle, setNewShopTitle] = useState("");
    const [newShopDesc, setNewShopDesc] = useState("");
    const [newShopType, setNewShopType] = useState<"FIXED_PRICE" | "AUCTION">("FIXED_PRICE");
    const [newShopPrice, setNewShopPrice] = useState<number | "">("");
    const [newShopStock, setNewShopStock] = useState<number | "">("");
    const [newShopAvailable, setNewShopAvailable] = useState(true);
    const [newShopHintText, setNewShopHintText] = useState("");

    // Modal creation visibility states
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showMassUploadModal, setShowMassUploadModal] = useState(false);
    const [showAddQuestModal, setShowAddQuestModal] = useState(false);
    const [showAddShopItemModal, setShowAddShopItemModal] = useState(false);
    const [showSpawnHotspotModal, setShowSpawnHotspotModal] = useState(false);
    const [invitingUser, setInvitingUser] = useState<Rover | null>(null);
    const [inviteTempPassword, setInviteTempPassword] = useState("");

    // Mass Upload states for Challenges and Shop Items
    const [showMassUploadQuestsModal, setShowMassUploadQuestsModal] = useState(false);
    const [massUploadQuestsText, setMassUploadQuestsText] = useState("");
    const [massUploadQuestsDelimiter, setMassUploadQuestsDelimiter] = useState("\t");

    const [showMassUploadShopItemsModal, setShowMassUploadShopItemsModal] = useState(false);
    const [massUploadShopItemsText, setMassUploadShopItemsText] = useState("");
    const [massUploadShopItemsDelimiter, setMassUploadShopItemsDelimiter] = useState("\t");

    const [loading, setLoading] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [purchaseHistory, setPurchaseHistory] = useState<{ title: string; logs: any[] } | null>(null);
    const [expandedQuestId, setExpandedQuestId] = useState<string | null>(null);
    const [questSubmissionsMap, setQuestSubmissionsMap] = useState<Record<string, any>>({}); // questId -> data
    const [historyScoutId, setHistoryScoutId] = useState<string | null>(null);
    const [historyScoutName, setHistoryScoutName] = useState<string | null>(null);
    const [historyItems, setHistoryItems] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [showConfigMatrix, setShowConfigMatrix] = useState(false);




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

    const handleShowHistory = async (itemTitle: string) => {
        setLoading(`history-${itemTitle}`);
        try {
            const res = await adminGetItemPurchaseHistory(itemTitle);
            if (res.success && res.logs) {
                setPurchaseHistory({ title: itemTitle, logs: res.logs });
            } else {
                alert(res.error || "Failed to load purchase history");
            }
        } catch (err: any) {
            alert(err.message || "Failed to fetch history");
        } finally {
            setLoading(null);
        }
    };

    const downloadQRCode = async (node: any) => {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(node.secretPasscode)}`;
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = qrUrl;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 360;
            canvas.height = 480;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // Draw background card (dark premium look)
            ctx.fillStyle = "#09090b"; // zinc-950
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw orange border
            ctx.strokeStyle = "#f59e0b"; // amber-500
            ctx.lineWidth = 4;
            ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

            // Draw QR code image
            ctx.drawImage(img, 30, 40, 300, 300);

            // Draw Text Details
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 16px Courier New";
            ctx.textAlign = "center";
            ctx.fillText(node.name.toUpperCase(), canvas.width / 2, 375);

            ctx.fillStyle = "#f59e0b";
            ctx.font = "bold 12px Courier New";
            ctx.fillText(node.isHotSpot ? "🚨 ACTIVE HOT-ZONE 🚨" : "NORMAL ZONE", canvas.width / 2, 400);

            ctx.fillStyle = "#71717a"; // zinc-500
            ctx.font = "bold 10px Courier New";
            ctx.fillText(`LAT: ${node.latitude.toFixed(6)}`, canvas.width / 2, 425);
            ctx.fillText(`LNG: ${node.longitude.toFixed(6)}`, canvas.width / 2, 440);
            ctx.fillText(`PASS: ${node.secretPasscode}`, canvas.width / 2, 455);

            // Trigger browser download
            const link = document.createElement("a");
            link.download = `${node.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_qr.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        };
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
            const res = await adminSpawnHotSpot(hotspotName, latNum, lngNum, spawnIsHotSpot);
            if (res.success) {
                const nodeType = spawnIsHotSpot ? "Hot-Spot" : "Zone";
                setMessage({ text: `SUCCESS: ${nodeType} "${res.node?.name}" spawned successfully at ${res.node?.latitude.toFixed(6)}, ${res.node?.longitude.toFixed(6)}!`, type: "success" });
                if (res.node) {
                    setNodes((prev) => [...prev, res.node as any].sort((a, b) => a.name.localeCompare(b.name)));
                }
                setHotspotName("");
                setHotspotLat("");
                setHotspotLng("");
                setShowSpawnHotspotModal(false);
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
                setNodes((prev) => prev.filter((n) => !n.isHotSpot));
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

    const handleDeclineSignOffSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!decliningSignOff || !declineReasonText.trim()) return;

        const { roverId, questId, questTitle, roverName } = decliningSignOff;
        setLoading(`decline-${roverId}-${questId}`);
        setMessage(null);

        try {
            const res = await adminDeclineSignOff(roverId, questId, declineReasonText.trim());
            if (res.success) {
                setRovers((prev) =>
                    prev.map((r) => {
                        if (r.id === roverId) {
                            return {
                                ...r,
                                questCompletions: r.questCompletions.filter((c) => c.questId !== questId),
                            };
                        }
                        return r;
                    })
                );

                setMessage({
                    type: "success",
                    text: `MILESTONE_DECLINED: "${questTitle}" rejected for ${roverName}. Feedback sent.`,
                });

                setDecliningSignOff(null);
                setDeclineReasonText("");
            } else {
                setMessage({
                    type: "error",
                    text: `DECLINE_FAILED: ${res.error || "Could not decline milestone."}`,
                });
            }
        } catch (err: any) {
            setMessage({
                type: "error",
                text: `SYSTEM_ERROR: ${err.message || "Failed to contact gateway."}`,
            });
        } finally {
            setLoading(null);
        }
    };

    const handleSendReminderClick = async (quest: Quest) => {
        setReminderQuest(quest);
        try {
            const res = await adminGetOperationHeliosGroup();
            if (res.success) {
                setReminderGroupId(res.groupId || "");
            }
        } catch (err) {
            console.error("Failed to load group ID:", err);
        }
    };

    const handleSendReminderSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reminderQuest || !reminderGroupId.trim()) return;

        setLoading(`reminder-${reminderQuest.id}`);
        setMessage(null);

        try {
            const res = await adminSendQuestReminder(reminderQuest.id, reminderGroupId.trim());
            if (res.success) {
                setMessage({
                    type: "success",
                    text: `REMINDER_SENT: WhatsApp reminder sent to group "${reminderGroupId.trim()}" successfully.`,
                });
                setReminderQuest(null);
            } else {
                setMessage({
                    type: "error",
                    text: `SEND_FAILED: ${res.error || "Could not dispatch WhatsApp message."}`,
                });
            }
        } catch (err: any) {
            setMessage({
                type: "error",
                text: `SYSTEM_ERROR: ${err.message || "Failed to contact gateway."}`,
            });
        } finally {
            setLoading(null);
        }
    };

    const fetchLogs = async (page: number) => {
        setLoading("refresh-logs");
        try {
            const res = await fetch(`/api/admin/logs?page=${page}&limit=${logsLimit}`);
            const data = await res.json();
            if (data.logs) {
                setLogs(data.logs);
                setLogsTotalPages(data.totalPages || 1);
                setLogsTotal(data.total || 0);
                setLogsPage(data.page || 1);
            }
        } catch (err) {
            console.error("Failed to fetch logs:", err);
            setMessage({ text: "FAILED TO REFRESH LOG MATRIX", type: "error" });
        } finally {
            setLoading(null);
        }
    };

    useEffect(() => {
        if (activeTab === "logs") {
            fetchLogs(1);
        }
    }, [activeTab]);

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

    // Toggle Lucky Wheel
    const handleToggleLuckyWheel = async () => {
        setLoading("toggle-wheel");
        setMessage(null);
        try {
            const nextStatus = !luckyWheelActive;
            const res = await adminToggleLuckyWheel(nextStatus);
            if (res.success) {
                setLuckyWheelActive(nextStatus);
                setMessage({
                    type: "success",
                    text: `SYSTEM_CONFIG: Cyber-Spin Wheel is now ${nextStatus ? "ENABLED" : "DISABLED"}.`,
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
                text: `SYSTEM_ERROR: ${err.message || "Failed to toggle lucky wheel status."}`,
            });
        } finally {
            setLoading(null);
        }
    };

    const handleUpdateThreshold = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading("update-threshold");
        setMessage(null);
        try {
            const val = hotspotThreshold === "" ? null : Number(hotspotThreshold);
            const res = await adminUpdateHotspotThreshold(val);
            if (res.success) {
                setMessage({
                    type: "success",
                    text: `SYSTEM_CONFIG: Hot-Spot Capture Threshold override has been updated successfully.`,
                });
            } else {
                setMessage({
                    type: "error",
                    text: `SYSTEM_CONFIG_FAILED: ${res.error || "Failed to update threshold override."}`,
                });
            }
        } catch (err: any) {
            setMessage({
                type: "error",
                text: `SYSTEM_ERROR: ${err.message || "Failed to contact gateway."}`,
            });
        } finally {
            setLoading(null);
        }
    };

    const handleUpdatePerimeter = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading("update-perimeter");
        setMessage(null);
        try {
            const val = capturePerimeter === "" ? 100 : Number(capturePerimeter);
            const res = await adminUpdateCapturePerimeter(val);
            if (res.success) {
                setMessage({
                    type: "success",
                    text: `SYSTEM_CONFIG: GPS Capture Perimeter has been updated to ${val} meters.`,
                });
            } else {
                setMessage({
                    type: "error",
                    text: `SYSTEM_CONFIG_FAILED: ${res.error || "Failed to update capture perimeter."}`,
                });
            }
        } catch (err: any) {
            setMessage({
                type: "error",
                text: `SYSTEM_ERROR: ${err.message || "Failed to update capture perimeter."}`,
            });
        } finally {
            setLoading(null);
        }
    };

    const handleUpdateCooldown = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading("update-cooldown");
        setMessage(null);
        try {
            const val = hotspotCooldown === "" ? null : Number(hotspotCooldown);
            const res = await adminUpdateHotspotCooldown(val);
            if (res.success) {
                setMessage({
                    type: "success",
                    text: `SYSTEM_CONFIG: Hot-Spot recapture cooldown has been updated successfully.`,
                });
            } else {
                setMessage({
                    type: "error",
                    text: `SYSTEM_CONFIG_FAILED: ${res.error || "Failed to update cooldown setting."}`,
                });
            }
        } catch (err: any) {
            setMessage({
                type: "error",
                text: `SYSTEM_ERROR: ${err.message || "Failed to contact gateway."}`,
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
                const dummyNewProfile = {
                    id: res.roverId || Math.random().toString(),
                    fullName: newUserFullName,
                    email: newUserEmail,
                    role: newUserRole,
                    unit: newUserUnit || null,
                    roverProfile: newUserRole === "scout" ? {
                        roverCredits: 0,
                        faction: newUserFaction === "" ? null : (newUserFaction as "ALPHA" | "BRAVO"),
                        phoneNumber: newUserPhone,
                    } : null,
                    questCompletions: [],
                };
                setRovers((prev) => [...prev, dummyNewProfile].sort((a, b) => a.fullName.localeCompare(b.fullName)));
                setShowAddUserModal(false);

                setNewUserEmail("");
                setNewUserFullName("");
                setNewUserPassword("");
                setNewUserRole("scout");
                setNewUserUnit("");
                setNewUserFaction("");
                setNewUserPhone("");
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

    const handleSendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!invitingUser) return;
        setLoading("invite");
        try {
            const res = await adminInviteUser(invitingUser.id, inviteTempPassword || undefined);
            if (res.success) {
                setMessage({
                    type: "success",
                    text: `INVITATION_SENT: WhatsApp invite sent to ${invitingUser.fullName}.`,
                });
                setInvitingUser(null);
                setInviteTempPassword("");
            } else {
                setMessage({
                    type: "error",
                    text: `INVITE_FAILED: ${res.error || "Failed to dispatch invitation."}`,
                });
            }
        } catch (err: any) {
            setMessage({
                type: "error",
                text: `SYSTEM_ERROR: ${err.message || "Could not dispatch WhatsApp message."}`,
            });
        } finally {
            setLoading(null);
        }
    };

    // Mass Upload Form Submission
    const handleMassUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!massUploadText.trim()) return;

        setLoading("mass-upload");
        setMessage(null);
        setMassUploadResult(null);

        const lines = massUploadText.split(/\r?\n/).filter(line => line.trim() !== "");
        const parsedUsers: any[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            let parts: string[] = [];
            if (massUploadDelimiter === ",") {
                parts = line.split(",").map(p => p.trim());
            } else {
                parts = line.split("\t").map(p => p.trim());
            }

            if (parts.length < 3) continue;

            const fullName = parts[0];
            const email = parts[1];
            const passwordHex = parts[2];
            const factionVal = parts[3] ? parts[3].toUpperCase() : null;
            const faction = (factionVal === "ALPHA" || factionVal === "BRAVO") ? factionVal : null;
            const phoneNumber = parts[4] || "";
            const unit = parts[5] || null;

            parsedUsers.push({
                fullName,
                email,
                passwordHex,
                role: "scout",
                faction,
                phoneNumber,
                unit,
            });
        }

        if (parsedUsers.length === 0) {
            setMessage({
                type: "error",
                text: "PARSE_ERROR: No valid user rows detected. Ensure format: Name, Email, Password, [Faction], [Phone], [Unit]",
            });
            setLoading(null);
            return;
        }

        try {
            const res = await adminMassUploadRovers(parsedUsers);
            if (res.success) {
                setMassUploadResult({
                    createdCount: res.createdCount || 0,
                    skippedCount: res.skippedCount || 0,
                    errors: res.errors || [],
                });
                setMessage({
                    type: "success",
                    text: `MASS_UPLOAD_SUCCESS: Imported ${res.createdCount} scouts successfully.`,
                });
                setMassUploadText("");
                setShowMassUploadModal(false);
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                setMessage({
                    type: "error",
                    text: `MASS_UPLOAD_FAILED: ${res.error || "Batch write operation failed."}`,
                });
            }
        } catch (err: any) {
            setMessage({
                type: "error",
                text: `SYSTEM_ERROR: ${err.message || "An exception occurred during mass upload."}`,
            });
        } finally {
            setLoading(null);
        }
    };

    const handleMassUploadQuests = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!massUploadQuestsText.trim()) return;

        setLoading("mass-upload-quests");
        setMessage(null);

        const lines = massUploadQuestsText.split(/\r?\n/).filter(line => line.trim() !== "");
        const parsedQuests: any[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            let parts: string[] = [];
            if (massUploadQuestsDelimiter === ",") {
                parts = line.split(",").map(p => p.trim());
            } else {
                parts = line.split("\t").map(p => p.trim());
            }

            if (parts.length < 3) continue;

            const title = parts[0];
            const rewardVal = Number(parts[1]);
            const description = parts[2];
            const clueHint = parts[3] || null;
            const rawVerif = parts[4] ? parts[4].toUpperCase() : "";
            const verificationType = rawVerif === "DIGITAL_CODE" ? "DIGITAL_CODE" : "LEADER_SIGN_OFF";
            const answerCode = parts[5] || null;

            const unlockedAtDate = new Date().toISOString();

            parsedQuests.push({
                title,
                creditReward: rewardVal,
                description,
                clueHint,
                verificationType,
                answerCode,
                unlockedAtDate,
            });
        }

        if (parsedQuests.length === 0) {
            setMessage({
                type: "error",
                text: "PARSE_ERROR: No valid challenge rows detected. Format: Title, CreditReward, Description, [ClueHint], [VerificationType: DIGITAL_CODE/LEADER_SIGN_OFF], [AnswerKey]",
            });
            setLoading(null);
            return;
        }

        try {
            const res = await adminMassUploadQuests(parsedQuests);
            if (res.success) {
                setMessage({
                    type: "success",
                    text: `MASS_UPLOAD_SUCCESS: Imported ${res.createdCount} challenges successfully.`,
                });
                setMassUploadQuestsText("");
                setShowMassUploadQuestsModal(false);
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                setMessage({
                    type: "error",
                    text: `MASS_UPLOAD_FAILED: ${res.error || "Batch write operation failed."}`,
                });
            }
        } catch (err: any) {
            setMessage({
                type: "error",
                text: `SYSTEM_ERROR: ${err.message || "An exception occurred during challenges mass upload."}`,
            });
        } finally {
            setLoading(null);
        }
    };

    const handleMassUploadShopItems = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!massUploadShopItemsText.trim()) return;

        setLoading("mass-upload-shop");
        setMessage(null);

        const lines = massUploadShopItemsText.split(/\r?\n/).filter(line => line.trim() !== "");
        const parsedItems: any[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            let parts: string[] = [];
            if (massUploadShopItemsDelimiter === ",") {
                parts = line.split(",").map(p => p.trim());
            } else {
                parts = line.split("\t").map(p => p.trim());
            }

            if (parts.length < 3) continue;

            const title = parts[0];
            const price = Number(parts[1]);
            const description = parts[2];
            const rawType = parts[3] ? parts[3].toUpperCase() : "";
            const type = rawType === "AUCTION" ? "AUCTION" : "FIXED_PRICE";
            const stock = parts[4] ? Number(parts[4]) : 999;

            parsedItems.push({
                title,
                price,
                description,
                type,
                stock,
            });
        }

        if (parsedItems.length === 0) {
            setMessage({
                type: "error",
                text: "PARSE_ERROR: No valid shop items detected. Format: Title, Price, Description, [Type: FIXED_PRICE/AUCTION], [Stock]",
            });
            setLoading(null);
            return;
        }

        try {
            const res = await adminMassUploadShopItems(parsedItems);
            if (res.success) {
                setMessage({
                    type: "success",
                    text: `MASS_UPLOAD_SUCCESS: Imported ${res.createdCount} marketplace items successfully.`,
                });
                setMassUploadShopItemsText("");
                setShowMassUploadShopItemsModal(false);
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                setMessage({
                    type: "error",
                    text: `MASS_UPLOAD_FAILED: ${res.error || "Batch write operation failed."}`,
                });
            }
        } catch (err: any) {
            setMessage({
                type: "error",
                text: `SYSTEM_ERROR: ${err.message || "An exception occurred during shop items mass upload."}`,
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
                expiresAt: newQuestExpiry ? new Date(newQuestExpiry).toISOString() : null,
                phase: newQuestPhase,
                isReleased: newQuestReleased,
                isBlind: newQuestIsBlind,
            });

            if (res.success) {
                setMessage({
                    type: "success",
                    text: `CHALLENGE_CREATED: '${newQuestTitle}' has been successfully scheduled.`,
                });
                const dummyNewQuest = {
                    id: res.questId || Math.random().toString(),
                    title: newQuestTitle,
                    creditReward: Number(newQuestReward),
                    isReleased: newQuestReleased,
                    isBlind: newQuestIsBlind,
                    unlockedAtDate: new Date(newQuestDate),
                    expiresAt: newQuestExpiry ? new Date(newQuestExpiry) : null,
                    verificationType: newQuestType,
                };
                setQuests((prev) => [...prev, dummyNewQuest].sort((a, b) => new Date(a.unlockedAtDate).getTime() - new Date(b.unlockedAtDate).getTime()));
                setShowAddQuestModal(false);

                setNewQuestTitle("");
                setNewQuestDesc("");
                setNewQuestHint("");
                setNewQuestType("DIGITAL_CODE");
                setNewQuestAnswer("");
                setNewQuestReward("");
                setNewQuestPhase("PRE_CAMP");
                setNewQuestDate("");
                setNewQuestExpiry("");
                setNewQuestReleased(false);
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
        setEditRoverPassword("");
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
                password: editRoverPassword || undefined,
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
                setEditRoverPassword("");
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
        setEditQuestAnswer("");
        setEditQuestPhase(quest.phase || "PRE_CAMP");
        setEditQuestReleased(quest.isReleased);
        setEditQuestIsBlind(quest.isBlind || false);

        // Format date for datetime-local input
        if (quest.unlockedAtDate) {
            const date = new Date(quest.unlockedAtDate);
            const tzOffset = date.getTimezoneOffset() * 60000;
            const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
            setEditQuestDate(localISOTime);
        } else {
            setEditQuestDate("");
        }

        if (quest.expiresAt) {
            const date = new Date(quest.expiresAt);
            const tzOffset = date.getTimezoneOffset() * 60000;
            const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
            setEditQuestExpiry(localISOTime);
        } else {
            setEditQuestExpiry("");
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
                expiresAt: editQuestExpiry ? new Date(editQuestExpiry).toISOString() : null,
                phase: editQuestPhase,
                isReleased: editQuestReleased,
                isBlind: editQuestIsBlind,
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
                                expiresAt: editQuestExpiry ? new Date(editQuestExpiry) : null,
                                phase: editQuestPhase,
                                isReleased: editQuestReleased,
                                isBlind: editQuestIsBlind,
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

    const handleRevealBlindQuest = async (questId: string, questTitle: string) => {
        const answer = window.prompt(`Enter the correct decryption answer key for "${questTitle}":`);
        if (!answer || !answer.trim()) return;

        setLoading(`reveal-quest-${questId}`);
        setMessage(null);
        try {
            const res = await adminRevealBlindQuestResults(questId, answer.trim());
            if (res.success) {
                setMessage({
                    type: "success",
                    text: `BLIND_RESULTS_REVEALED: Successfully evaluated blind submissions. Correct: ${res.correctCount}, Incorrect: ${res.incorrectCount}.`,
                });
                setQuests((prev) =>
                    prev.map((q) => (q.id === questId ? { ...q, isBlind: false } : q))
                );
                // Refresh the submissions panel if it's open for this quest
                setQuestSubmissionsMap((prev) => {
                    const next = { ...prev };
                    delete next[questId];
                    return next;
                });
            } else {
                setMessage({
                    type: "error",
                    text: `REVEAL_FAILED: ${res.error || "Failed to process results."}`,
                });
            }
        } catch (err: any) {
            setMessage({
                type: "error",
                text: `SYSTEM_ERROR: ${err.message || "Failed to contact gateway."}`,
            });
        } finally {
            setLoading(null);
        }
    };

    const handleViewQuestSubmissions = async (questId: string) => {
        // Toggle off
        if (expandedQuestId === questId) {
            setExpandedQuestId(null);
            return;
        }
        setExpandedQuestId(questId);
        // Load if not cached
        if (!questSubmissionsMap[questId]) {
            setLoading(`subs-${questId}`);
            try {
                const res = await adminGetBlindQuestSubmissions(questId);
                if (res.success) {
                    setQuestSubmissionsMap((prev) => ({ ...prev, [questId]: res }));
                } else {
                    setQuestSubmissionsMap((prev) => ({
                        ...prev,
                        [questId]: { error: res.error }
                    }));
                }
            } catch (err: any) {
                setQuestSubmissionsMap((prev) => ({
                    ...prev,
                    [questId]: { error: err.message }
                }));
            } finally {
                setLoading(null);
            }
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
                hintText: newShopHintText || undefined,
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
                    hintText: newShopHintText || null,
                    highestBidder: null,
                };

                setShopItems((prev) => [dummyItem, ...prev]);
                setShowAddShopItemModal(false);

                // Reset fields
                setNewShopTitle("");
                setNewShopDesc("");
                setNewShopType("FIXED_PRICE");
                setNewShopPrice("");
                setNewShopStock("");
                setNewShopAvailable(true);
                setNewShopHintText("");
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
        setEditShopHintText(item.hintText || "");
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
                hintText: editShopHintText || undefined,
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
                                hintText: editShopHintText || null,
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

    const handleViewPointHistory = async (userId: string, fullName: string) => {
        setHistoryScoutId(userId);
        setHistoryScoutName(fullName);
        setHistoryItems([]);
        setLoadingHistory(true);
        try {
            const res = await adminGetUserPointHistory(userId);
            if (res.success && res.history) {
                setHistoryItems(res.history);
            } else {
                alert(`Error loading history: ${res.error || "Unknown error"}`);
                setHistoryScoutId(null);
            }
        } catch (err: any) {
            alert(`Error: ${err.message}`);
            setHistoryScoutId(null);
        } finally {
            setLoadingHistory(false);
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
            {/* Top Diagnostics Header / Warning Banner */}
            <section className="bg-amber-950/20 border border-amber-500/40 rounded-lg p-5 shadow-[0_0_15px_rgba(245,158,11,0.05)] flex flex-col gap-4">
                <div className="flex justify-between items-center cursor-pointer select-none" onClick={() => setShowConfigMatrix(!showConfigMatrix)}>
                    <div>
                        <h2 className="text-xl font-bold tracking-widest text-amber-400 uppercase flex items-center gap-2">
                            🛡️ SYSTEM_CONTROL_MATRIX_
                            <span className="text-[10px] text-zinc-500 font-mono font-normal normal-case">
                                {showConfigMatrix ? "[Click to collapse settings]" : "[Click to expand settings]"}
                            </span>
                        </h2>
                        <p className="text-zinc-500 text-xs mt-1 font-sans">
                            Authorized Admin Gateway: Modify daily quest releases, review physical scout milestones, and apply manual credit overrides.
                        </p>
                    </div>
                    <span className="text-amber-500 text-xs font-mono font-bold border border-amber-500/30 px-2 py-1 rounded bg-amber-950/30">
                        {showConfigMatrix ? "HIDE ▲" : "SHOW ▼"}
                    </span>
                </div>

                {showConfigMatrix && (
                    <div className="flex flex-col gap-4 border-t border-amber-500/10 pt-2">
                        {/* Live GPS Map Access Toggler */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
                            <div>
                                <div className="text-xs font-bold text-zinc-300 uppercase">🗺️ Live GPS Map Access:</div>
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
                                {loading === "toggle-nav" ? "PROCESSING..." : nightNavActive ? "LOCK GPS MAP" : "UNLOCK GPS MAP"}
                            </button>
                        </div>

                        {/* Lucky Wheel Active Toggler */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-amber-500/10">
                            <div>
                                <div className="text-xs font-bold text-zinc-300 uppercase">🎡 Cyber-Spin Lucky Wheel:</div>
                                <div className="text-[10px] text-zinc-500 mt-0.5 uppercase">
                                    Current state: {luckyWheelActive ? "ONLINE (PLAYERS CAN SPIN)" : "OFFLINE (SPINNING IS LOCKED)"}
                                </div>
                            </div>
                            <button
                                onClick={handleToggleLuckyWheel}
                                disabled={loading === "toggle-wheel"}
                                className={`px-4 py-2 text-xs font-extrabold rounded uppercase tracking-wider transition cursor-pointer ${luckyWheelActive
                                    ? "bg-red-950/20 border border-red-500/40 text-red-500 hover:bg-red-950/40 hover:text-red-400"
                                    : "bg-green-950/20 border border-green-500/40 text-green-500 hover:bg-green-950/40 hover:text-green-400"
                                    }`}
                            >
                                {loading === "toggle-wheel" ? "PROCESSING..." : luckyWheelActive ? "DISABLE SPIN WHEEL" : "ENABLE SPIN WHEEL"}
                            </button>
                        </div>

                        {/* Hotspot Capture Threshold Override */}
                        <form onSubmit={handleUpdateThreshold} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-amber-500/10">
                            <div>
                                <div className="text-xs font-bold text-zinc-300 uppercase">🔥 Hotspot Capture Threshold:</div>
                                <div className="text-[10px] text-zinc-500 mt-0.5 uppercase">
                                    Number of scouts required to capture a Hotspot (leave blank to require all faction scouts).
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="ALL"
                                    value={hotspotThreshold}
                                    onChange={(e) => setHotspotThreshold(e.target.value === "" ? "" : Number(e.target.value))}
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-1.5 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold w-24"
                                    min="1"
                                />
                                <button
                                    type="submit"
                                    disabled={loading === "update-threshold"}
                                    className="px-4 py-1.5 text-xs bg-amber-500 text-black hover:bg-amber-400 font-extrabold rounded uppercase tracking-wider transition cursor-pointer"
                                >
                                    {loading === "update-threshold" ? "SAVING..." : "SAVE"}
                                </button>
                            </div>
                        </form>

                        {/* GPS Capture Perimeter Override */}
                        <form onSubmit={handleUpdatePerimeter} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-amber-500/10">
                            <div>
                                <div className="text-xs font-bold text-zinc-300 uppercase">🛰️ GPS Capture Perimeter (meters):</div>
                                <div className="text-[10px] text-zinc-500 mt-0.5 uppercase">
                                    Maximum distance in meters a scout can be from a node to capture it.
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="100"
                                    value={capturePerimeter}
                                    onChange={(e) => setCapturePerimeter(e.target.value === "" ? "" : Number(e.target.value))}
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-1.5 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold w-24"
                                    min="10"
                                    max="500"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={loading === "update-perimeter"}
                                    className="px-4 py-1.5 text-xs bg-amber-500 text-black hover:bg-amber-400 font-extrabold rounded uppercase tracking-wider transition cursor-pointer"
                                >
                                    {loading === "update-perimeter" ? "SAVING..." : "SAVE"}
                                </button>
                            </div>
                        </form>

                        {/* Hotspot Recapture Cooldown Override */}
                        <form onSubmit={handleUpdateCooldown} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-amber-500/10">
                            <div>
                                <div className="text-xs font-bold text-zinc-300 uppercase">🔒 Hotspot Recapture Cooldown (hours):</div>
                                <div className="text-[10px] text-zinc-500 mt-0.5 uppercase">
                                    Number of hours during which opposing factions cannot retake a recently captured Hotspot.
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    step="0.5"
                                    placeholder="6"
                                    value={hotspotCooldown}
                                    onChange={(e) => setHotspotCooldown(e.target.value === "" ? "" : Number(e.target.value))}
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-1.5 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold w-24"
                                    min="0"
                                    max="72"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={loading === "update-cooldown"}
                                    className="px-4 py-1.5 text-xs bg-amber-500 text-black hover:bg-amber-400 font-extrabold rounded uppercase tracking-wider transition cursor-pointer"
                                >
                                    {loading === "update-cooldown" ? "SAVING..." : "SAVE"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

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


            {/* Live Metrics Summary Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
                <div className="bg-zinc-950/40 border border-amber-500/10 p-4 rounded-lg flex flex-col justify-between">
                    <span className="text-[10px] text-amber-500/50 uppercase">👥 Scouts Registered</span>
                    <span className="text-xl font-bold text-amber-400 mt-1">{rovers.length}</span>
                </div>
                <div className="bg-zinc-950/40 border border-amber-500/10 p-4 rounded-lg flex flex-col justify-between">
                    <span className="text-[10px] text-amber-500/50 uppercase">🚩 Node Standings</span>
                    <div className="flex justify-between items-baseline mt-1 font-bold">
                        <span className="text-xs text-amber-500/80">A: {nodes.filter(n => n.controllingFaction === 'ALPHA').length}</span>
                        <span className="text-xs text-amber-500/80">B: {nodes.filter(n => n.controllingFaction === 'BRAVO').length}</span>
                    </div>
                </div>
                <div className="bg-zinc-950/40 border border-amber-500/10 p-4 rounded-lg flex flex-col justify-between">
                    <span className="text-[10px] text-amber-500/50 uppercase">💰 Alpha Circ. Credits</span>
                    <span className="text-base font-bold text-amber-400 mt-1">
                        {rovers.filter(r => r.roverProfile?.faction === 'ALPHA').reduce((sum, r) => sum + (r.roverProfile?.roverCredits ?? 0), 0)} CR
                    </span>
                </div>
                <div className="bg-zinc-950/40 border border-amber-500/10 p-4 rounded-lg flex flex-col justify-between">
                    <span className="text-[10px] text-amber-500/50 uppercase">💰 Bravo Circ. Credits</span>
                    <span className="text-base font-bold text-amber-400 mt-1">
                        {rovers.filter(r => r.roverProfile?.faction === 'BRAVO').reduce((sum, r) => sum + (r.roverProfile?.roverCredits ?? 0), 0)} CR
                    </span>
                </div>
            </div>

            {/* Workstation Console Tabs */}
            <div className="flex flex-wrap border-b border-amber-500/20 bg-zinc-950/40 p-1.5 rounded-t-lg gap-2 text-xs font-bold uppercase tracking-wider mt-4">
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
                    onClick={() => setActiveTab("submissions")}
                    className={`px-4 py-2 rounded transition cursor-pointer ${activeTab === "submissions"
                        ? "bg-amber-500 text-black shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                        : "text-zinc-400 hover:text-amber-400 hover:bg-amber-950/15"
                        }`}
                >
                    📝 Quest Submissions
                </button>
                <button
                    onClick={() => setActiveTab("purchases")}
                    className={`px-4 py-2 rounded transition cursor-pointer ${activeTab === "purchases"
                        ? "bg-amber-500 text-black shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                        : "text-zinc-400 hover:text-amber-400 hover:bg-amber-950/15"
                        }`}
                >
                    🛍️ Shop Purchases
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
                    <div className="flex flex-col gap-6">
                        {/* Tab header buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
                            <h3 className="text-xs font-bold text-amber-400/90 tracking-widest uppercase bg-amber-950/20 border border-amber-500/20 px-3 py-1.5 rounded">
                                📋 ROVER_MATRIX_&_SIGN_OFFS
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowSpawnHotspotModal(true)}
                                    className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[10px] px-3 py-2 rounded transition uppercase tracking-wider cursor-pointer"
                                >
                                    🚨 SPAWN NEW HOT-SPOT
                                </button>
                                <button
                                    onClick={handleClearHotSpots}
                                    disabled={loading === "clear-hotspots"}
                                    className="bg-red-950/20 hover:bg-red-500 hover:text-black border border-red-500/30 text-red-500 hover:border-red-500 font-extrabold text-[10px] px-3 py-2 rounded transition uppercase tracking-wider cursor-pointer"
                                >
                                    {loading === "clear-hotspots" ? "WIPING..." : "❌ WIPE HOT-SPOTS"}
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            {/* Search Input Filter for Scouts */}
                            <div className="w-full">
                                <input
                                    type="text"
                                    placeholder="🔍 Search scouts by name or email..."
                                    value={scoutSearchQuery}
                                    onChange={(e) => setScoutSearchQuery(e.target.value)}
                                    className="w-full max-w-md bg-black border border-amber-500/20 focus:border-amber-500 text-zinc-200 placeholder-zinc-700 text-xs px-3.5 py-2.5 rounded focus:outline-none transition font-sans font-medium"
                                />
                            </div>

                            <div className="flex flex-col gap-4">
                                {rovers.length === 0 ? (
                                    <p className="text-zinc-600 text-xs py-2">No registered scouts found in database.</p>
                                ) : (
                                    rovers.filter(r => 
                                        r.fullName.toLowerCase().includes(scoutSearchQuery.toLowerCase()) || 
                                        (r.email && r.email.toLowerCase().includes(scoutSearchQuery.toLowerCase()))
                                    ).map((rover) => {
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
                                                                <span className="text-zinc-300 font-mono">{rover.roverProfile?.phoneNumber || "NOT_SET"}</span>
                                                                <button
                                                                    onClick={() => startEditPhone(rover.id, rover.roverProfile?.phoneNumber || "")}
                                                                    className="text-amber-500/70 hover:text-amber-400 text-[8px] font-bold underline uppercase cursor-pointer"
                                                                >
                                                                    [Edit]
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Credits Info */}
                                                <div className="flex flex-col gap-2">
                                                    {adjustingCreditsId === rover.id ? (
                                                        <div className="p-3 bg-black/60 border border-amber-500/20 rounded flex flex-col gap-2 max-w-xs text-left">
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
                                                                    className="bg-zinc-950 border border-amber-500/35 text-zinc-100 text-[10px] px-2 py-1 rounded focus:outline-none w-24 font-semibold"
                                                                />
                                                                <span className="text-[8px] text-zinc-500 uppercase">Amount (+/-)</span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {[10, 50, 100, -10, -50].map((amt) => (
                                                                    <button
                                                                        key={amt}
                                                                        onClick={() => {
                                                                            setInlineCreditsAmount(amt);
                                                                            setInlineAdjustReason(amt > 0 ? "Milestone bonus" : "Penalty deduction");
                                                                        }}
                                                                        type="button"
                                                                        className="bg-amber-500/10 hover:bg-amber-500/30 text-amber-400 border border-amber-500/20 hover:border-amber-500/50 text-[9px] px-2 py-0.5 rounded font-bold cursor-pointer"
                                                                    >
                                                                        {amt > 0 ? `+${amt}` : amt}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={inlineAdjustReason}
                                                                onChange={(e) => setInlineAdjustReason(e.target.value)}
                                                                placeholder="Adjustment reason"
                                                                disabled={loading === `credits-${rover.id}`}
                                                                className="bg-zinc-950 border border-amber-500/35 text-zinc-100 text-[10px] px-2 py-1 rounded focus:outline-none w-full"
                                                            />
                                                            <div className="flex gap-2 justify-end">
                                                                <button
                                                                    onClick={() => handleInlineAdjustCredits(rover.id)}
                                                                    disabled={loading === `credits-${rover.id}`}
                                                                    className="bg-amber-500 hover:bg-amber-400 text-black text-[9px] font-extrabold px-2.5 py-1 rounded cursor-pointer"
                                                                >
                                                                    OK
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
                                                        <div className="flex items-center gap-2">
                                                            <div className="bg-amber-950/20 border border-amber-500/20 px-3 py-1 rounded flex flex-col items-center justify-center min-w-[70px]">
                                                                <span className="text-[8px] text-amber-500/60 uppercase">Credits</span>
                                                                <span className="text-amber-400 font-extrabold text-sm">{rover.roverProfile?.roverCredits || 0}</span>
                                                            </div>
                                                            <div className="flex gap-1.5">
                                                                <button
                                                                    onClick={() => {
                                                                        setAdjustingCreditsId(rover.id);
                                                                        setInlineCreditsAmount("");
                                                                        setInlineAdjustReason("");
                                                                    }}
                                                                    className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[9px] px-2.5 py-2 rounded transition uppercase tracking-wider cursor-pointer"
                                                                >
                                                                    Adjust
                                                                </button>
                                                                <button
                                                                    onClick={() => handleViewPointHistory(rover.id, rover.fullName)}
                                                                    className="bg-zinc-900 border border-amber-500/20 hover:border-amber-500/50 text-amber-500/80 hover:text-amber-400 font-extrabold text-[9px] px-2.5 py-2 rounded transition uppercase tracking-wider cursor-pointer"
                                                                >
                                                                    📋 History
                                                                </button>
                                                            </div>

                                                        </div>
                                                    )}
                                                </div>

                                                {/* Pending Milestones Actions Card List */}
                                                <div className="flex flex-col gap-2 min-w-[220px] md:max-w-xs items-end">
                                                    {pendingCompletions.length === 0 ? (
                                                        <span className="text-[9px] text-zinc-600 uppercase tracking-wider font-extrabold italic bg-zinc-950/20 border border-zinc-800/40 px-2.5 py-1 rounded">No pending milestones</span>
                                                    ) : (
                                                        pendingCompletions.map((comp) => (
                                                            <div
                                                                key={comp.questId}
                                                                className="flex flex-col gap-2 bg-amber-950/25 border border-amber-500/20 p-2.5 rounded-lg w-full text-left"
                                                            >
                                                                <div className="flex justify-between items-center gap-2 border-b border-amber-500/10 pb-1.5">
                                                                    <span className="text-[10px] text-amber-400 uppercase font-black tracking-wider truncate" title={comp.quest.title}>
                                                                        🎖️ {comp.quest.title}
                                                                    </span>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() =>
                                                                            handleApproveSignOff(
                                                                                rover.id,
                                                                                comp.questId,
                                                                                comp.quest.title,
                                                                                rover.fullName
                                                                            )
                                                                        }
                                                                        disabled={!!loading}
                                                                        className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black text-[9px] font-black px-2 py-1 rounded cursor-pointer transition uppercase whitespace-nowrap text-center shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                                                                    >
                                                                        {loading === `approve-${rover.id}-${comp.questId}`
                                                                            ? "VERIFYING..."
                                                                            : "✓ APPROVE"}
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            setDecliningSignOff({
                                                                                roverId: rover.id,
                                                                                questId: comp.questId,
                                                                                questTitle: comp.quest.title,
                                                                                roverName: rover.fullName
                                                                            })
                                                                        }
                                                                        disabled={!!loading}
                                                                        className="flex-1 bg-red-950/40 hover:bg-red-500 border border-red-500/30 hover:text-black text-red-500 text-[9px] font-black px-2 py-1 rounded cursor-pointer transition uppercase whitespace-nowrap text-center"
                                                                    >
                                                                        ✕ DECLINE
                                                                    </button>
                                                                </div>
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
                    </div>
                )}

                {/* Tab 2: Challenge Control */}
                {activeTab === "challenges" && (
                    <div className="flex flex-col gap-6">
                        {/* Tab header buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
                            <h3 className="text-xs font-bold text-amber-400/90 tracking-widest uppercase bg-amber-950/20 border border-amber-500/20 px-3 py-1.5 rounded">
                                🔑 ACTIVE_QUESTS_&_CLUES
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowAddQuestModal(true)}
                                    className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[10px] px-3 py-2 rounded transition uppercase tracking-wider cursor-pointer"
                                >
                                    + Add New Challenge
                                </button>
                                <button
                                    onClick={() => setShowMassUploadQuestsModal(true)}
                                    className="bg-zinc-800 border border-amber-500/35 hover:bg-zinc-700 text-amber-400 font-extrabold text-[10px] px-3 py-2 rounded transition uppercase tracking-wider cursor-pointer"
                                >
                                    📥 + Mass Import Challenges
                                </button>
                            </div>
                        </div>

                        {/* Search Input Filter for Challenges */}
                        <div className="w-full">
                            <input
                                type="text"
                                placeholder="🔍 Search challenges by title..."
                                value={challengeSearchQuery}
                                onChange={(e) => setChallengeSearchQuery(e.target.value)}
                                className="w-full max-w-md bg-black border border-amber-500/20 focus:border-amber-500 text-zinc-200 placeholder-zinc-700 text-xs px-3.5 py-2.5 rounded focus:outline-none transition font-sans font-medium"
                            />
                        </div>

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
                                            quests.filter(q => 
                                                q.title.toLowerCase().includes(challengeSearchQuery.toLowerCase())
                                            ).map((quest) => (
                                                <React.Fragment key={quest.id}>
                                                    <tr className="hover:bg-amber-950/5 transition">
                                                        <td className="p-3.5">
                                                            <div className="font-bold text-zinc-100">{quest.title}</div>
                                                            <div className="text-[10px] text-zinc-500 mt-0.5 uppercase">
                                                                Scheduled: <LocalDateStr date={quest.unlockedAtDate} />
                                                            </div>
                                                        </td>
                                                        <td className="p-3.5 text-[10px] uppercase font-bold text-zinc-400">
                                                            {quest.verificationType === "DIGITAL_CODE" ? "Cipher Entry" : "Leader Sign-Off"}
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
                                                                {/* Submissions toggle — available on all quests */}
                                                                <button
                                                                    onClick={() => handleViewQuestSubmissions(quest.id)}
                                                                    disabled={loading === `subs-${quest.id}`}
                                                                    className={`px-2 py-1 rounded font-extrabold transition cursor-pointer text-[10px] uppercase border ${expandedQuestId === quest.id
                                                                        ? "bg-cyan-700 border-cyan-500 text-white"
                                                                        : "bg-cyan-950/30 border-cyan-500/30 text-cyan-400 hover:bg-cyan-800/40"
                                                                        }`}
                                                                >
                                                                    {loading === `subs-${quest.id}` ? "LOADING..." : expandedQuestId === quest.id ? "▲ CLOSE" : "📋 SUBS"}
                                                                </button>
                                                                {quest.isBlind && (
                                                                    <button
                                                                        onClick={() => handleRevealBlindQuest(quest.id, quest.title)}
                                                                        disabled={loading === `reveal-quest-${quest.id}`}
                                                                        className="px-2 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-extrabold transition cursor-pointer text-[10px] uppercase animate-pulse shadow-[0_0_10px_rgba(147,51,234,0.4)]"
                                                                    >
                                                                        {loading === `reveal-quest-${quest.id}` ? "REVEALING..." : "👁️ REVEAL"}
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleSendReminderClick(quest)}
                                                                    className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-extrabold transition cursor-pointer text-[10px] uppercase"
                                                                >
                                                                    🔔 Remind
                                                                </button>
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
                                                    {/* Inline submissions drawer */}
                                                    {expandedQuestId === quest.id && (
                                                        <tr key={`subs-${quest.id}`}>
                                                            <td colSpan={5} className="p-0 bg-zinc-950/70 border-t border-b border-cyan-500/20">
                                                                <div className="p-4">
                                                                    <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-3 flex items-center gap-2">
                                                                        📋 SUBMISSION INTAKE LOG — {quest.title}
                                                                        {questSubmissionsMap[quest.id]?.isRevealed === false && (
                                                                            <span className="bg-yellow-950/40 border border-yellow-500/30 text-yellow-400 px-2 py-0.5 rounded text-[9px]">
                                                                                ⚠️ BLIND — correct/incorrect visible after REVEAL
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {!questSubmissionsMap[quest.id] ? (
                                                                        <div className="text-zinc-500 italic text-xs">Loading submissions...</div>
                                                                    ) : questSubmissionsMap[quest.id].error ? (
                                                                        <div className="text-red-400 text-xs">Error: {questSubmissionsMap[quest.id].error}</div>
                                                                    ) : questSubmissionsMap[quest.id].groups?.length === 0 ? (
                                                                        <div className="text-zinc-500 italic text-xs">No submissions yet for this challenge.</div>
                                                                    ) : (
                                                                        <table className="w-full text-xs border-collapse">
                                                                            <thead>
                                                                                <tr className="text-[10px] uppercase tracking-wider text-zinc-500 border-b border-zinc-700/50">
                                                                                    <th className="text-left py-2 pr-4">Scout</th>
                                                                                    <th className="text-left py-2 pr-4">Unit</th>
                                                                                    <th className="text-left py-2 pr-4">Attempt #</th>
                                                                                    <th className="text-left py-2 pr-4">Submitted Answer(s)</th>
                                                                                    <th className="text-center py-2 pr-4">Status</th>
                                                                                    <th className="text-center py-2">Awarded</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="divide-y divide-zinc-800/60">
                                                                                {questSubmissionsMap[quest.id].groups.map((g: any, gi: number) => (
                                                                                    <tr key={gi} className="hover:bg-zinc-800/20">
                                                                                        <td className="py-2 pr-4 font-bold text-zinc-200">{g.rover?.fullName ?? "Unknown"}</td>
                                                                                        <td className="py-2 pr-4 text-zinc-400">{g.rover?.unit ?? "—"}</td>
                                                                                        <td className="py-2 pr-4 text-zinc-400">{g.answers.length}x</td>
                                                                                        <td className="py-2 pr-4">
                                                                                            <div className="flex flex-col gap-0.5">
                                                                                                {g.answers.map((a: any, ai: number) => (
                                                                                                    <span key={ai} className="font-mono text-amber-300 bg-amber-950/20 px-1.5 py-0.5 rounded text-[10px]">
                                                                                                        {a.answer}
                                                                                                        <span className="text-zinc-600 ml-1.5 text-[9px]">
                                                                                                            {new Date(a.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                                                                        </span>
                                                                                                    </span>
                                                                                                ))}
                                                                                            </div>
                                                                                        </td>
                                                                                        <td className="py-2 pr-4 text-center">
                                                                                            {g.isCorrect === null ? (
                                                                                                <span className="text-zinc-500 text-[10px] uppercase">Pending</span>
                                                                                            ) : g.isCorrect ? (
                                                                                                <span className="text-green-400 font-extrabold text-[10px] uppercase bg-green-950/30 border border-green-500/30 px-2 py-0.5 rounded">✓ Correct</span>
                                                                                            ) : (
                                                                                                <span className="text-red-400 font-extrabold text-[10px] uppercase bg-red-950/30 border border-red-500/30 px-2 py-0.5 rounded">✗ Wrong</span>
                                                                                            )}
                                                                                        </td>
                                                                                        <td className="py-2 text-center">
                                                                                            {g.wasAwarded ? (
                                                                                                <span className="text-amber-400 text-[10px] font-bold">💰 Yes</span>
                                                                                            ) : (
                                                                                                <span className="text-zinc-600 text-[10px]">—</span>
                                                                                            )}
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))

                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "registry" && (
                    <div className="flex flex-col gap-6">
                        {/* Tab header buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
                            <h3 className="text-xs font-bold text-amber-400/90 tracking-widest uppercase bg-amber-950/20 border border-amber-500/20 px-3 py-1.5 rounded">
                                👥 ACCOUNTS_DIRECTORY ({rovers.length})
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowAddUserModal(true)}
                                    className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[10px] px-3 py-2 rounded transition uppercase tracking-wider cursor-pointer"
                                >
                                    👤 + Add Individual Scout
                                </button>
                                <button
                                    onClick={() => setShowMassUploadModal(true)}
                                    className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[10px] px-3 py-2 rounded transition uppercase tracking-wider cursor-pointer"
                                >
                                    📥 + Mass Import Users
                                </button>
                            </div>
                        </div>

                        <div className="bg-zinc-950/40 border border-amber-500/20 rounded-lg overflow-x-auto shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                            <table className="w-full text-left border-collapse text-xs font-semibold text-zinc-300">
                                <thead>
                                    <tr className="border-b border-amber-500/20 bg-black/60 text-amber-500 uppercase text-[10px] tracking-wider">
                                        <th className="p-3 bg-black/40">Name / Email</th>
                                        <th className="p-3 bg-black/40">Role</th>
                                        <th className="p-3 bg-black/40">Faction / Unit</th>
                                        <th className="p-3 bg-black/40">Phone</th>
                                        <th className="p-3 bg-black/40">Last Access</th>
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
                                            <td className="p-3 flex flex-col gap-0.5">
                                                <span className="uppercase text-[9px] text-zinc-400 font-extrabold tracking-wide">{r.role}</span>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-1.5 uppercase font-bold text-[9px]">
                                                    {r.roverProfile?.faction === "ALPHA" ? (
                                                        <span className="text-red-400">ALPHA</span>
                                                    ) : r.roverProfile?.faction === "BRAVO" ? (
                                                        <span className="text-blue-400">BRAVO</span>
                                                    ) : (
                                                        <span className="text-zinc-600">-</span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-zinc-500">{r.unit || "No unit"}</div>
                                            </td>
                                            <td className="p-3 font-mono">{r.roverProfile?.phoneNumber || "-"}</td>
                                            <td className="p-3 font-mono text-[10px] text-zinc-400">
                                                {r.lastActiveAt ? <LocalDateStr date={r.lastActiveAt} /> : "Never"}
                                            </td>
                                            <td className="p-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setInvitingUser(r);
                                                            setInviteTempPassword("");
                                                        }}
                                                        disabled={!r.roverProfile?.phoneNumber}
                                                        title={!r.roverProfile?.phoneNumber ? "WhatsApp number is required to invite" : "Invite user via WhatsApp"}
                                                        className="px-2 py-1 rounded bg-green-950/30 border border-green-500/30 text-green-400 hover:bg-green-500 hover:text-black disabled:opacity-30 disabled:hover:bg-green-950/30 disabled:hover:text-green-400 transition cursor-pointer text-[10px]"
                                                    >
                                                        INVITE_
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditRoverClick(r)}
                                                        className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-black transition cursor-pointer text-[10px]"
                                                    >
                                                        EDIT_
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewPointHistory(r.id, r.fullName)}
                                                        className="px-2 py-1 rounded bg-purple-950/30 border border-purple-500/30 text-purple-400 hover:bg-purple-500 hover:text-black transition cursor-pointer text-[10px]"
                                                    >
                                                        HISTORY_
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

                        {/* Section 2: GeoNodes & Sectors list */}
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/20 pb-4 mt-6">
                            <h3 className="text-xs font-bold text-amber-400/90 tracking-widest uppercase bg-amber-950/20 border border-amber-500/20 px-3 py-1.5 rounded">
                                🗺️ GEONODES_AND_SECTORS ({nodes.length})
                            </h3>
                            <button
                                onClick={() => setShowSpawnHotspotModal(true)}
                                className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[10px] px-3 py-2 rounded transition uppercase tracking-wider cursor-pointer"
                            >
                                🚨 + Spawn new GeoNode / Hotspot
                            </button>
                        </div>

                        <div className="bg-zinc-950/40 border border-amber-500/20 rounded-lg overflow-x-auto shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                            <table className="w-full text-left border-collapse text-xs font-semibold text-zinc-300">
                                <thead>
                                    <tr className="border-b border-amber-500/20 bg-black/60 text-amber-500 uppercase text-[10px] tracking-wider">
                                        <th className="p-3 bg-black/40">Zone Name</th>
                                        <th className="p-3 bg-black/40">Coordinates (Lat, Lng)</th>
                                        <th className="p-3 bg-black/40">Radius</th>
                                        <th className="p-3 bg-black/40">Type</th>
                                        <th className="p-3 bg-black/40">Control</th>
                                        <th className="p-3 bg-black/40">Secret Passcode</th>
                                        <th className="p-3 text-right bg-black/40">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {nodes.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-zinc-600">No geo nodes found.</td>
                                        </tr>
                                    ) : (
                                        nodes.map((node) => (
                                            <tr key={node.id} className="border-b border-amber-500/10 hover:bg-amber-950/5 animate-fade-in">
                                                <td className="p-3 font-bold text-zinc-200">{node.name}</td>
                                                <td className="p-3 font-mono text-[11px]">{node.latitude.toFixed(6)}, {node.longitude.toFixed(6)}</td>
                                                <td className="p-3">{node.radiusMeters}m</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${node.isHotSpot
                                                            ? "bg-amber-950/40 border border-amber-500/30 text-amber-400"
                                                            : "bg-zinc-800 text-zinc-500"
                                                        }`}>
                                                        {node.isHotSpot ? "🚨 HOTSPOT" : "NORMAL"}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    {node.controllingFaction === "ALPHA" ? (
                                                        <span className="text-red-400 font-extrabold">ALPHA</span>
                                                    ) : node.controllingFaction === "BRAVO" ? (
                                                        <span className="text-blue-400 font-extrabold">BRAVO</span>
                                                    ) : (
                                                        <span className="text-zinc-600 font-extrabold">UNCLAIMED</span>
                                                    )}
                                                </td>
                                                <td className="p-3 font-mono text-zinc-400">{node.secretPasscode}</td>
                                                <td className="p-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => downloadQRCode(node)}
                                                            className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-black transition cursor-pointer text-[10px]"
                                                        >
                                                            📷 QR CARD_
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
                )}

                {/* Tab 4: Marketplace Control */}
                {activeTab === "marketplace" && (
                    <div className="flex flex-col gap-6">
                        {/* Tab header buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
                            <h3 className="text-xs font-bold text-amber-400/90 tracking-widest uppercase bg-amber-950/20 border border-amber-500/20 px-3 py-1.5 rounded">
                                🛒 CATALOG_INDEX ({shopItems.length})
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowAddShopItemModal(true)}
                                    className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[10px] px-3 py-2 rounded transition uppercase tracking-wider cursor-pointer"
                                >
                                    + Add New Shop Item
                                </button>
                                <button
                                    onClick={() => setShowMassUploadShopItemsModal(true)}
                                    className="bg-zinc-800 border border-amber-500/35 hover:bg-zinc-700 text-amber-400 font-extrabold text-[10px] px-3 py-2 rounded transition uppercase tracking-wider cursor-pointer"
                                >
                                    📥 + Mass Import Items
                                </button>
                            </div>
                        </div>

                        {/* Search Input Filter for Marketplace */}
                        <div className="w-full">
                            <input
                                type="text"
                                placeholder="🔍 Search items by title..."
                                value={marketSearchQuery}
                                onChange={(e) => setMarketSearchQuery(e.target.value)}
                                className="w-full max-w-md bg-black border border-amber-500/20 focus:border-amber-500 text-zinc-200 placeholder-zinc-700 text-xs px-3.5 py-2.5 rounded focus:outline-none transition font-sans font-medium"
                            />
                        </div>

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
                                        shopItems.filter(item => 
                                            item.title.toLowerCase().includes(marketSearchQuery.toLowerCase())
                                        ).map((item) => (
                                            <tr key={item.id} className="border-b border-amber-500/10 hover:bg-amber-950/5">
                                                <td className="p-3">
                                                    <div className="font-bold text-zinc-200 flex items-center gap-2">
                                                        {item.title}
                                                        {item.hintText && (
                                                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-950/50 border border-purple-500/30 text-purple-400 tracking-wider">
                                                                🔑 HINT
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-zinc-500 line-clamp-1">{item.description}</div>
                                                </td>

                                                <td className="p-3">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.type === "AUCTION"
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
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.isAvailable
                                                        ? "bg-green-950/50 border border-green-500/30 text-green-400"
                                                        : "bg-red-950/50 border border-red-500/30 text-red-400"
                                                        }`}>
                                                        {item.isAvailable ? "ACTIVE" : "LOCKED"}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right">
                                                    <button
                                                        onClick={() => handleShowHistory(item.title)}
                                                        disabled={loading === `history-${item.title}`}
                                                        className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-black transition cursor-pointer text-[10px]"
                                                    >
                                                        {loading === `history-${item.title}` ? "LOADING..." : "HISTORY_"}
                                                    </button>
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
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab: Quest Submissions */}
                {activeTab === "submissions" && (
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
                            <div>
                                <h3 className="text-xs font-bold text-amber-400/90 tracking-widest uppercase bg-amber-950/20 border border-amber-500/20 px-3 py-1.5 rounded inline-block">
                                    📝 QUEST_SUBMISSIONS_DIRECTORY
                                </h3>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">
                                    Flat list of all quest completion records across the platform.
                                </p>
                            </div>
                        </div>

                        {/* Filters */}
                        {(() => {
                            const uniqueQuests = Array.from(new Set(completions.map((c) => c.quest.title))).sort();
                            const uniqueUsers = Array.from(new Set(completions.map((c) => c.rover.fullName))).sort();

                            const filtered = completions.filter((c) => {
                                const matchQuest = subFilterQuest ? c.quest.title === subFilterQuest : true;
                                const matchUser = subFilterUser ? c.rover.fullName === subFilterUser : true;
                                const matchDate = subFilterDate
                                    ? new Date(c.completedAt).toISOString().split("T")[0] === subFilterDate
                                    : true;
                                return matchQuest && matchUser && matchDate;
                            });

                            const itemsPerPage = 10;
                            const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
                            const paginated = filtered.slice((submissionsPage - 1) * itemsPerPage, submissionsPage * itemsPerPage);

                            return (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-950/20 border border-amber-500/10 p-4 rounded-lg font-mono">
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold text-amber-500/60 mb-1.5">Filter by Quest Title</label>
                                            <select
                                                value={subFilterQuest}
                                                onChange={(e) => {
                                                    setSubFilterQuest(e.target.value);
                                                    setSubmissionsPage(1);
                                                }}
                                                className="bg-black border border-amber-500/20 focus:border-amber-400 text-zinc-300 text-xs px-3 py-2 rounded focus:outline-none w-full cursor-pointer"
                                            >
                                                <option value="">-- ALL QUESTS --</option>
                                                {uniqueQuests.map((q) => (
                                                    <option key={q} value={q}>{q}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold text-amber-500/60 mb-1.5">Filter by User / Scout</label>
                                            <select
                                                value={subFilterUser}
                                                onChange={(e) => {
                                                    setSubFilterUser(e.target.value);
                                                    setSubmissionsPage(1);
                                                }}
                                                className="bg-black border border-amber-500/20 focus:border-amber-400 text-zinc-300 text-xs px-3 py-2 rounded focus:outline-none w-full cursor-pointer"
                                            >
                                                <option value="">-- ALL SCOUTS --</option>
                                                {uniqueUsers.map((u) => (
                                                    <option key={u} value={u}>{u}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold text-amber-500/60 mb-1.5">Filter by Date</label>
                                            <input
                                                type="date"
                                                value={subFilterDate}
                                                onChange={(e) => {
                                                    setSubFilterDate(e.target.value);
                                                    setSubmissionsPage(1);
                                                }}
                                                className="bg-black border border-amber-500/20 focus:border-amber-400 text-zinc-300 text-xs px-3 py-2 rounded focus:outline-none w-full"
                                            />
                                        </div>
                                    </div>

                                    {/* List */}
                                    <div className="bg-zinc-950/40 border border-amber-500/20 rounded-lg overflow-x-auto shadow-lg">
                                        <table className="w-full text-left border-collapse text-xs font-semibold text-zinc-300">
                                            <thead>
                                                <tr className="border-b border-amber-500/20 bg-black/60 text-amber-500 uppercase text-[10px] tracking-wider font-mono">
                                                    <th className="p-3 bg-black/40">Scout Name</th>
                                                    <th className="p-3 bg-black/40">Unit</th>
                                                    <th className="p-3 bg-black/40">Quest Title</th>
                                                    <th className="p-3 bg-black/40">Reward</th>
                                                    <th className="p-3 bg-black/40">Verification</th>
                                                    <th className="p-3 bg-black/40">Date Completed</th>
                                                    <th className="p-3 bg-black/40">Verification State</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginated.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={7} className="p-8 text-center text-zinc-600 uppercase font-mono">No quest completions match the criteria.</td>
                                                    </tr>
                                                ) : (
                                                    paginated.map((c) => (
                                                        <tr key={c.id} className="border-b border-amber-500/10 hover:bg-amber-950/5">
                                                            <td className="p-3 font-bold text-zinc-200">{c.rover.fullName}</td>
                                                            <td className="p-3 uppercase text-[10px] text-zinc-400">{c.rover.unit || "-"}</td>
                                                            <td className="p-3 font-bold text-zinc-200">{c.quest.title}</td>
                                                            <td className="p-3 text-amber-400 font-bold">{c.quest.creditReward} CR</td>
                                                            <td className="p-3 text-[10px] text-zinc-500 font-mono uppercase">{c.quest.verificationType}</td>
                                                            <td className="p-3 text-zinc-400 font-mono">
                                                                <LocalDateStr date={c.completedAt} />
                                                            </td>
                                                            <td className="p-3 font-mono">
                                                                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${c.isVerified
                                                                        ? "bg-green-950/30 border border-green-500/30 text-green-400"
                                                                        : "bg-red-950/30 border border-red-500/30 text-red-400"
                                                                    }`}>
                                                                    {c.isVerified ? "✓ APPROVED" : "✗ REJECTED / PENDING"}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-between bg-zinc-950/40 border border-amber-500/20 p-3 rounded-lg mt-4 font-mono text-xs">
                                            <button
                                                onClick={() => setSubmissionsPage((prev) => Math.max(prev - 1, 1))}
                                                disabled={submissionsPage === 1}
                                                className="px-3 py-1.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-black transition-all cursor-pointer font-extrabold uppercase disabled:opacity-30 disabled:pointer-events-none"
                                            >
                                                PREV
                                            </button>
                                            <span className="text-zinc-400">
                                                PAGE <strong className="text-amber-400">{submissionsPage}</strong> OF <strong className="text-amber-400">{totalPages}</strong>
                                            </span>
                                            <button
                                                onClick={() => setSubmissionsPage((prev) => Math.min(prev + 1, totalPages))}
                                                disabled={submissionsPage === totalPages}
                                                className="px-3 py-1.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-black transition-all cursor-pointer font-extrabold uppercase disabled:opacity-30 disabled:pointer-events-none"
                                            >
                                                NEXT
                                            </button>
                                        </div>
                                    )}

                                    {/* Blind Submissions Log Table */}
                                    <div className="flex flex-col gap-3 mt-8">
                                        <div>
                                            <h4 className="text-[11px] font-extrabold text-purple-400 tracking-wider uppercase font-mono bg-purple-950/20 border border-purple-500/20 px-3 py-1.5 rounded inline-block">
                                                🚨 Blind Submission Intake Logs
                                            </h4>
                                            <p className="text-[9px] text-zinc-500 uppercase tracking-wider mt-1 font-mono">
                                                Raw entries submitted by rovers under the blind-intake matrix (max 2 entries per candidate).
                                            </p>
                                        </div>

                                        <div className="bg-zinc-950/40 border border-purple-500/20 rounded-lg overflow-x-auto shadow-lg">
                                            <table className="w-full text-left border-collapse text-xs font-semibold text-zinc-300">
                                                <thead>
                                                    <tr className="border-b border-purple-500/20 bg-black/60 text-purple-400 uppercase text-[10px] tracking-wider font-mono">
                                                        <th className="p-3 bg-black/40">Scout Name</th>
                                                        <th className="p-3 bg-black/40">Unit</th>
                                                        <th className="p-3 bg-black/40">Quest Title</th>
                                                        <th className="p-3 bg-black/40">Submitted Value</th>
                                                        <th className="p-3 bg-black/40">Date / Time Submitted</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {submissionsList.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={5} className="p-8 text-center text-zinc-600 uppercase font-mono">No blind submissions recorded yet.</td>
                                                        </tr>
                                                    ) : (
                                                        submissionsList.map((s) => (
                                                            <tr key={s.id} className="border-b border-purple-500/10 hover:bg-purple-950/5">
                                                                <td className="p-3 font-bold text-zinc-200">{s.rover.fullName}</td>
                                                                <td className="p-3 uppercase text-[10px] text-zinc-400">{s.rover.unit || "-"}</td>
                                                                <td className="p-3 font-bold text-zinc-200">{s.quest.title}</td>
                                                                <td className="p-3">
                                                                    <code className="bg-purple-950/30 border border-purple-500/20 px-2 py-0.5 rounded text-[11px] text-purple-300 font-mono font-bold">
                                                                        {s.answer}
                                                                    </code>
                                                                </td>
                                                                <td className="p-3 text-zinc-400 font-mono">
                                                                    <LocalDateStr date={s.submittedAt} />
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                )}

                {/* Tab: Marketplace Purchases */}
                {activeTab === "purchases" && (
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
                            <div>
                                <h3 className="text-xs font-bold text-amber-400/90 tracking-widest uppercase bg-amber-950/20 border border-amber-500/20 px-3 py-1.5 rounded inline-block">
                                    🛍️ MARKETPLACE_PURCHASE_LEDGER
                                </h3>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">
                                    Redeem scout rewards, deliver inventory perks, and toggle delivery state.
                                </p>
                            </div>
                        </div>

                        {/* List */}
                        <div className="bg-zinc-950/40 border border-amber-500/20 rounded-lg overflow-x-auto shadow-lg">
                            <table className="w-full text-left border-collapse text-xs font-semibold text-zinc-300">
                                <thead>
                                    <tr className="border-b border-amber-500/20 bg-black/60 text-amber-500 uppercase text-[10px] tracking-wider">
                                        <th className="p-3 bg-black/40">Buyer (Scout)</th>
                                        <th className="p-3 bg-black/40">Item Title</th>
                                        <th className="p-3 bg-black/40">Type</th>
                                        <th className="p-3 bg-black/40">Price paid</th>
                                        <th className="p-3 bg-black/40">Purchase Date</th>
                                        <th className="p-3 bg-black/40">Delivery Status</th>
                                        <th className="p-3 text-right bg-black/40">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {purchasesList.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-zinc-600 uppercase">No marketplace purchases found.</td>
                                        </tr>
                                    ) : (
                                        purchasesList.map((p) => (
                                            <tr key={p.id} className="border-b border-amber-500/10 hover:bg-amber-950/5">
                                                <td className="p-3 font-bold text-zinc-200">{p.rover.fullName}</td>
                                                <td className="p-3 font-bold text-zinc-200">{p.shopItem.title}</td>
                                                <td className="p-3 text-[10px] text-zinc-500 font-mono uppercase">{p.shopItem.type}</td>
                                                <td className="p-3 text-amber-400 font-bold">{p.pricePaid} CR</td>
                                                <td className="p-3 text-zinc-400 font-mono">
                                                    <LocalDateStr date={p.createdAt} />
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${p.isDelivered
                                                            ? "bg-green-950/30 border border-green-500/30 text-green-400"
                                                            : "bg-amber-950/30 border border-amber-500/30 text-amber-400"
                                                        }`}>
                                                        {p.isDelivered ? "✓ DELIVERED / GIVEN" : "⏳ PENDING COLLECTION"}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right">
                                                    <button
                                                        onClick={async () => {
                                                            setLoading(`toggle-deliver-${p.id}`);
                                                            const res = await adminTogglePurchaseDelivery(p.id);
                                                            if (res.success && res.purchase) {
                                                                setPurchasesList((prev) =>
                                                                    prev.map((item) => item.id === p.id ? res.purchase : item)
                                                                );
                                                            } else {
                                                                alert(res.error || "Failed to update delivery status");
                                                            }
                                                            setLoading(null);
                                                        }}
                                                        disabled={loading !== null}
                                                        className={`px-2 py-1 rounded text-[10px] font-extrabold uppercase transition cursor-pointer border ${p.isDelivered
                                                                ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-black font-mono"
                                                                : "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500 hover:text-black font-mono"
                                                            }`}
                                                    >
                                                        {p.isDelivered ? "Mark Pending" : "Mark Delivered"}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
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
                                    Displaying real-time events, WhatsApp receipts, and admin audits.
                                </p>
                            </div>
                            <button
                                onClick={async () => fetchLogs(logsPage)}
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
                                                    <LocalDateStr date={log.createdAt} />
                                                </td>
                                                <td className="p-3">
                                                    <div className={`text-[10px] font-bold tracking-wide uppercase ${log.phone === "SYSTEM"
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
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${log.status === "LOG"
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

                        {/* Pagination Controls */}
                        {logsTotalPages > 1 && (
                            <div className="flex justify-between items-center bg-zinc-950/40 border border-amber-500/20 px-4 py-3 rounded-lg mt-2 text-[11px] font-bold uppercase tracking-wider">
                                <button
                                    onClick={() => fetchLogs(logsPage - 1)}
                                    disabled={logsPage <= 1 || loading === "refresh-logs"}
                                    className="px-3 py-1.5 rounded bg-zinc-900 border border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-black transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    ◀ PREV
                                </button>
                                <span className="text-zinc-400">
                                    PAGE {logsPage} OF {logsTotalPages} <span className="text-amber-500/50">({logsTotal} LOGS)</span>
                                </span>
                                <button
                                    onClick={() => fetchLogs(logsPage + 1)}
                                    disabled={logsPage >= logsTotalPages || loading === "refresh-logs"}
                                    className="px-3 py-1.5 rounded bg-zinc-900 border border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-black transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    NEXT ▶
                                </button>
                            </div>
                        )}
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
                                <label className="text-[10px] uppercase text-amber-500/60 font-bold">New Password (Leave blank to keep current):</label>
                                <input
                                    type="password"
                                    value={editRoverPassword}
                                    onChange={(e) => setEditRoverPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
                                />
                            </div>

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

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase text-amber-500/60 font-bold">Expiry Date & Time (Optional):</label>
                                <input
                                    type="datetime-local"
                                    value={editQuestExpiry}
                                    onChange={(e) => setEditQuestExpiry(e.target.value)}
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
                                />
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

                            <div className="flex items-center gap-2 mt-1">
                                <input
                                    type="checkbox"
                                    id="editQuestIsBlind"
                                    checked={editQuestIsBlind}
                                    onChange={(e) => setEditQuestIsBlind(e.target.checked)}
                                    className="accent-amber-500"
                                />
                                <label htmlFor="editQuestIsBlind" className="text-[10px] uppercase text-amber-500/80 font-bold cursor-pointer select-none">
                                    🚨 Blind Submission (Hide check-in result)
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

                            {/* Hint Text — only for hint items */}
                            <div className="flex flex-col gap-1.5 border-t border-amber-500/10 pt-3">
                                <label className="text-[10px] uppercase text-purple-400/80 font-bold flex items-center gap-1.5">
                                    🔑 Hint Text <span className="text-zinc-600 normal-case font-normal">(optional — for quest hint items only)</span>
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="The secret hint content that will be sent privately to the admin when a scout purchases this item..."
                                    value={editShopHintText}
                                    onChange={(e) => setEditShopHintText(e.target.value)}
                                    className="bg-purple-950/20 border border-purple-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-purple-400 font-semibold resize-none font-sans placeholder:text-zinc-700"
                                />
                                {editShopHintText && (
                                    <div className="text-[9px] text-purple-400/60 uppercase tracking-wider">
                                        ✓ Admin will receive this hint in their WhatsApp notification when a scout purchases
                                    </div>
                                )}
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

            {/* Modal: Spawn Hotspot */}
            {showSpawnHotspotModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
                    <div className="bg-zinc-950 border-2 border-amber-500/40 rounded-lg max-w-md w-full p-6 shadow-[0_0_50px_rgba(245,158,11,0.15)] text-left font-mono my-8">
                        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest border-b border-amber-500/20 pb-2 mb-4">
                            🚨 SPAWN NEW HOT-SPOT
                        </h3>
                        <p className="text-[10px] text-zinc-400 uppercase leading-relaxed tracking-wider mb-4 font-sans">
                            Spawns an active King-of-the-Hill coordinate blip on the map. Scouts must coordinate checking in within 20s without opposing interruption to conquer it.
                        </p>
                        <form onSubmit={handleSpawnHotSpot} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase font-bold text-amber-500/80">Hot-Spot Name</label>
                                <input
                                    type="text"
                                    required
                                    value={hotspotName}
                                    onChange={(e) => setHotspotName(e.target.value)}
                                    placeholder="e.g. 🚨 HOT-ZONE CHARLIE"
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold placeholder:text-zinc-700"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] uppercase font-bold text-amber-500/80">Latitude (Optional)</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={hotspotLat}
                                        onChange={(e) => setHotspotLat(e.target.value)}
                                        placeholder="e.g. 34.1205"
                                        className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold font-mono"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] uppercase font-bold text-amber-500/80">Longitude (Optional)</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={hotspotLng}
                                        onChange={(e) => setHotspotLng(e.target.value)}
                                        placeholder="e.g. 35.6482"
                                        className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold font-mono"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-1.5 bg-black/40 border border-amber-500/10 p-3 rounded">
                                <input
                                    type="checkbox"
                                    id="spawnIsHotSpot"
                                    checked={spawnIsHotSpot}
                                    onChange={(e) => setSpawnIsHotSpot(e.target.checked)}
                                    className="accent-amber-500 cursor-pointer h-4 w-4"
                                />
                                <label htmlFor="spawnIsHotSpot" className="text-[10px] font-bold text-zinc-300 cursor-pointer uppercase select-none">
                                    🚨 Make Active Hot-Spot (requires multiple scouts)?
                                </label>
                            </div>

                            <div className="flex gap-3 justify-end mt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowSpawnHotspotModal(false)}
                                    className="px-4 py-2 border border-zinc-700 hover:bg-zinc-900 text-zinc-400 text-xs rounded transition uppercase cursor-pointer"
                                >
                                    CANCEL_
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading === "spawn-hotspot"}
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded transition uppercase cursor-pointer"
                                >
                                    {loading === "spawn-hotspot" ? "SPAWNING..." : "🚨 SPAWN HOT-SPOT"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Add Challenge */}
            {showAddQuestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
                    <div className="bg-zinc-950 border-2 border-amber-500/40 rounded-lg max-w-lg w-full p-6 shadow-[0_0_50px_rgba(245,158,11,0.15)] text-left font-mono my-8">
                        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest border-b border-amber-500/20 pb-2 mb-4">
                            🏆 CREATE_NEW_CHALLENGE
                        </h3>

                        <form onSubmit={handleAddQuest} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase text-amber-500/60 font-bold">Title:</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Fire Building"
                                    value={newQuestTitle}
                                    onChange={(e) => setNewQuestTitle(e.target.value)}
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
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
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
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
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold font-mono"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase text-amber-500/60 font-bold">Clue / Hint (Optional):</label>
                                <input
                                    type="text"
                                    value={newQuestHint}
                                    onChange={(e) => setNewQuestHint(e.target.value)}
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
                                    placeholder="Location key clue hint"
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
                                        className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
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
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase text-amber-500/60 font-bold">Expiry Date / Time (Optional):</label>
                                <input
                                    type="datetime-local"
                                    value={newQuestExpiry}
                                    onChange={(e) => setNewQuestExpiry(e.target.value)}
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
                                />
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                                <input
                                    type="checkbox"
                                    id="newQuestReleased"
                                    checked={newQuestReleased}
                                    onChange={(e) => setNewQuestReleased(e.target.checked)}
                                    className="w-4 h-4 rounded text-amber-500 bg-black border-amber-500/30 focus:ring-0 cursor-pointer"
                                    style={{ accentColor: "#f59e0b" }}
                                />
                                <label htmlFor="newQuestReleased" className="text-xs uppercase text-zinc-300 font-bold cursor-pointer">
                                    Release immediately
                                </label>
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                                <input
                                    type="checkbox"
                                    id="newQuestIsBlind"
                                    checked={newQuestIsBlind}
                                    onChange={(e) => setNewQuestIsBlind(e.target.checked)}
                                    className="w-4 h-4 rounded text-amber-500 bg-black border-amber-500/30 focus:ring-0 cursor-pointer"
                                    style={{ accentColor: "#f59e0b" }}
                                />
                                <label htmlFor="newQuestIsBlind" className="text-xs uppercase text-zinc-300 font-bold cursor-pointer">
                                    🚨 Blind Submission (Hide check-in result)
                                </label>
                            </div>

                            <div className="flex gap-3 justify-end mt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddQuestModal(false)}
                                    className="px-4 py-2 border border-zinc-700 hover:bg-zinc-900 text-zinc-400 text-xs rounded transition uppercase cursor-pointer"
                                >
                                    CANCEL_
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading === "add-quest"}
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded transition uppercase cursor-pointer"
                                >
                                    {loading === "add-quest" ? "CREATING..." : "SCHEDULE_CHALLENGE"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Shop Item Purchase History */}
            {purchaseHistory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
                    <div className="bg-zinc-950 border-2 border-amber-500/40 rounded-lg max-w-2xl w-full p-6 shadow-[0_0_50px_rgba(245,158,11,0.15)] text-left font-mono my-8">
                        <div className="flex justify-between items-center border-b border-amber-500/20 pb-2 mb-4">
                            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest">
                                🛍️ Purchase History: {purchaseHistory.title}
                            </h3>
                            <button
                                onClick={() => setPurchaseHistory(null)}
                                className="text-zinc-500 hover:text-amber-400 text-xs font-bold uppercase transition"
                            >
                                CLOSE [X]
                            </button>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto">
                            {purchaseHistory.logs.length === 0 ? (
                                <p className="text-center py-6 text-zinc-500 text-xs italic">No purchase history found for this item.</p>
                            ) : (
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-amber-500/10 text-amber-500/60 text-[9px] uppercase tracking-wider font-bold">
                                            <th className="py-2">Date / Time</th>
                                            <th className="py-2">Transaction Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {purchaseHistory.logs.map((log) => (
                                            <tr key={log.id} className="border-b border-zinc-900 text-zinc-300 hover:bg-zinc-900/30">
                                                <td className="py-2.5 font-mono text-[10px] text-zinc-500 whitespace-nowrap pr-4">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </td>
                                                <td className="py-2.5 text-[10px] text-zinc-300">
                                                    {log.error}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Add Individual User */}
            {showAddUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
                    <div className="bg-zinc-950 border-2 border-amber-500/40 rounded-lg max-w-md w-full p-6 shadow-[0_0_50px_rgba(245,158,11,0.15)] text-left font-mono my-8">
                        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest border-b border-amber-500/20 pb-2 mb-4">
                            👤 CREATE USER ACCOUNT
                        </h3>

                        <form onSubmit={handleAddUser} className="flex flex-col gap-4">
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

                            <div className="flex gap-3 justify-end mt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddUserModal(false)}
                                    className="px-4 py-2 border border-zinc-700 hover:bg-zinc-900 text-zinc-400 text-xs rounded transition uppercase cursor-pointer"
                                >
                                    CANCEL_
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading === "add-user"}
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded transition uppercase cursor-pointer"
                                >
                                    {loading === "add-user" ? "REGISTERING..." : "CREATE_ACCOUNT"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Mass Upload */}
            {showMassUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
                    <div className="bg-zinc-950 border-2 border-amber-500/40 rounded-lg max-w-lg w-full p-6 shadow-[0_0_50px_rgba(245,158,11,0.15)] text-left font-mono my-8">
                        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest border-b border-amber-500/20 pb-2 mb-4">
                            📥 BATCH_MASS_IMPORT
                        </h3>
                        <p className="text-[10px] text-zinc-400 uppercase leading-relaxed tracking-wider mb-4 font-sans">
                            Copy-paste rows directly from Excel or Google Sheets. Delimit values using Tabs or Commas. <br />
                            <strong>Columns:</strong> Name, Email, Password, [Faction: ALPHA/BRAVO], [Phone], [Unit]
                        </p>

                        <form onSubmit={handleMassUpload} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase text-amber-500/60 font-bold">Delimiter Mode:</label>
                                <select
                                    value={massUploadDelimiter}
                                    onChange={(e) => setMassUploadDelimiter(e.target.value)}
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
                                >
                                    <option value="\t">Tab Delimited (Copy-Paste from Excel)</option>
                                    <option value=",">Comma Delimited (CSV)</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase text-amber-500/60 font-bold">Raw Batch Data:</label>
                                <textarea
                                    rows={8}
                                    required
                                    placeholder="Nicolas Nasr&#9;nicolas@sdc.org&#9;password123&#9;ALPHA&#9;+96170123456&#9;Rovers"
                                    value={massUploadText}
                                    onChange={(e) => setMassUploadText(e.target.value)}
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold font-mono placeholder:text-zinc-700 resize-none"
                                />
                            </div>

                            <div className="flex gap-3 justify-end mt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowMassUploadModal(false)}
                                    className="px-4 py-2 border border-zinc-700 hover:bg-zinc-900 text-zinc-400 text-xs rounded transition uppercase cursor-pointer"
                                >
                                    CANCEL_
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading === "mass-upload"}
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded transition uppercase cursor-pointer"
                                >
                                    {loading === "mass-upload" ? "UPLOADING..." : "RUN_BATCH_IMPORT"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Add Shop Item */}
            {showAddShopItemModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
                    <div className="bg-zinc-950 border-2 border-amber-500/40 rounded-lg max-w-md w-full p-6 shadow-[0_0_50px_rgba(245,158,11,0.15)] text-left font-mono my-8">
                        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest border-b border-amber-500/20 pb-2 mb-4">
                            🛒 ADD MARKETPLACE ITEM
                        </h3>

                        <form onSubmit={handleAddShopItem} className="flex flex-col gap-4">
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
                                    placeholder="Camp perk description..."
                                    value={newShopDesc}
                                    onChange={(e) => setNewShopDesc(e.target.value)}
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold resize-none font-sans"
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
                                    <option value="FIXED_PRICE">Fixed Price Store Item</option>
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
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
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
                                        className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
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

                            {/* Hint Text — only for hint items */}
                            <div className="flex flex-col gap-1.5 border-t border-amber-500/10 pt-3">
                                <label className="text-[10px] uppercase text-purple-400/80 font-bold flex items-center gap-1.5">
                                    🔑 Hint Text <span className="text-zinc-600 normal-case font-normal">(optional — for quest hint items only)</span>
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="The secret hint content that will be sent privately to the admin when a scout purchases this item..."
                                    value={newShopHintText}
                                    onChange={(e) => setNewShopHintText(e.target.value)}
                                    className="bg-purple-950/20 border border-purple-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-purple-400 font-semibold resize-none font-sans placeholder:text-zinc-700"
                                />
                                {newShopHintText && (
                                    <div className="text-[9px] text-purple-400/60 uppercase tracking-wider">
                                        ✓ Admin will receive this hint in their WhatsApp notification when a scout purchases
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 justify-end mt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddShopItemModal(false)}
                                    className="px-4 py-2 border border-zinc-700 hover:bg-zinc-900 text-zinc-400 text-xs rounded transition uppercase cursor-pointer"
                                >
                                    CANCEL_
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading === "add-shop"}
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded transition uppercase cursor-pointer"
                                >
                                    {loading === "add-shop" ? "CREATING..." : "CREATE_ITEM"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Invite User */}
            {invitingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
                    <div className="bg-zinc-950 border-2 border-green-500/40 rounded-lg max-w-md w-full p-6 shadow-[0_0_50px_rgba(34,197,94,0.15)] text-left font-mono my-8">
                        <h3 className="text-sm font-bold text-green-400 uppercase tracking-widest border-b border-green-500/20 pb-2 mb-4">
                            💬 SEND WHATSAPP PORTAL INVITE
                        </h3>
                        <p className="text-[10px] text-zinc-400 uppercase leading-relaxed tracking-wider mb-4 font-sans">
                            Dispatches a custom invitation message to <strong>{invitingUser.fullName}</strong> ({invitingUser.roverProfile?.phoneNumber}) with their portal credentials and login link.
                        </p>

                        <form onSubmit={handleSendInvite} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] uppercase text-zinc-500 font-bold">Email to Send:</span>
                                <span className="text-xs text-zinc-200 font-semibold">{invitingUser.email}</span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase text-green-500/80 font-bold">Temporary Password (Optional):</label>
                                <input
                                    type="text"
                                    placeholder="e.g. TempPass123"
                                    value={inviteTempPassword}
                                    onChange={(e) => setInviteTempPassword(e.target.value)}
                                    className="bg-black border border-green-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-green-400 font-semibold placeholder:text-zinc-700"
                                />
                                <span className="text-[8px] text-zinc-500 uppercase leading-normal">
                                    Include the password you configured for them. If empty, a reminder placeholder is sent.
                                </span>
                            </div>

                            <div className="flex gap-3 justify-end mt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setInvitingUser(null);
                                        setInviteTempPassword("");
                                    }}
                                    className="px-4 py-2 border border-zinc-700 hover:bg-zinc-900 text-zinc-400 text-xs rounded transition uppercase cursor-pointer"
                                >
                                    CANCEL_
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading === "invite"}
                                    className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-extrabold text-xs rounded transition uppercase cursor-pointer"
                                >
                                    {loading === "invite" ? "DISPATCHING..." : "💬 SEND INVITE"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Mass Upload Challenges */}
            {showMassUploadQuestsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
                    <div className="bg-zinc-950 border-2 border-amber-500/40 rounded-lg max-w-lg w-full p-6 shadow-[0_0_50px_rgba(245,158,11,0.15)] text-left font-mono my-8">
                        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest border-b border-amber-500/20 pb-2 mb-4">
                            🏆 BATCH_IMPORT_CHALLENGES
                        </h3>
                        <p className="text-[10px] text-zinc-400 uppercase leading-relaxed tracking-wider mb-4 font-sans">
                            Copy-paste rows directly from spreadsheets. Delimit values using Tabs or Commas. <br />
                            <strong>Columns:</strong> Title, CreditReward, Description, [ClueHint], [VerificationType: DIGITAL_CODE/LEADER_SIGN_OFF], [AnswerKey]
                        </p>

                        <form onSubmit={handleMassUploadQuests} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase text-amber-500/60 font-bold">Delimiter Mode:</label>
                                <select
                                    value={massUploadQuestsDelimiter}
                                    onChange={(e) => setMassUploadQuestsDelimiter(e.target.value)}
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
                                >
                                    <option value="\t">Tab Delimited (Copy-Paste from Excel)</option>
                                    <option value=",">Comma Delimited (CSV)</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase text-amber-500/60 font-bold">Raw Batch Data:</label>
                                <textarea
                                    rows={8}
                                    required
                                    placeholder="Fire Building&#9;150&#9;Build a fire with 3 matches.&#9;Firepit A&#9;LEADER_SIGN_OFF"
                                    value={massUploadQuestsText}
                                    onChange={(e) => setMassUploadQuestsText(e.target.value)}
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold font-mono placeholder:text-zinc-700 resize-none"
                                />
                            </div>

                            <div className="flex gap-3 justify-end mt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowMassUploadQuestsModal(false)}
                                    className="px-4 py-2 border border-zinc-700 hover:bg-zinc-900 text-zinc-400 text-xs rounded transition uppercase cursor-pointer"
                                >
                                    CANCEL_
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading === "mass-upload-quests"}
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded transition uppercase cursor-pointer"
                                >
                                    {loading === "mass-upload-quests" ? "UPLOADING..." : "RUN_BATCH_IMPORT"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Mass Upload Shop Items */}
            {showMassUploadShopItemsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
                    <div className="bg-zinc-950 border-2 border-amber-500/40 rounded-lg max-w-lg w-full p-6 shadow-[0_0_50px_rgba(245,158,11,0.15)] text-left font-mono my-8">
                        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest border-b border-amber-500/20 pb-2 mb-4">
                            🛒 BATCH_IMPORT_MARKETPLACE
                        </h3>
                        <p className="text-[10px] text-zinc-400 uppercase leading-relaxed tracking-wider mb-4 font-sans">
                            Copy-paste rows directly from spreadsheets. Delimit values using Tabs or Commas. <br />
                            <strong>Columns:</strong> Title, Price, Description, [Type: FIXED_PRICE/AUCTION], [Stock]
                        </p>

                        <form onSubmit={handleMassUploadShopItems} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase text-amber-500/60 font-bold">Delimiter Mode:</label>
                                <select
                                    value={massUploadShopItemsDelimiter}
                                    onChange={(e) => setMassUploadShopItemsDelimiter(e.target.value)}
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
                                >
                                    <option value="\t">Tab Delimited (Copy-Paste from Excel)</option>
                                    <option value=",">Comma Delimited (CSV)</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase text-amber-500/60 font-bold">Raw Batch Data:</label>
                                <textarea
                                    rows={8}
                                    required
                                    placeholder="Solar Charger Pack&#9;50&#9;Charges phones using sunlight.&#9;FIXED_PRICE&#9;10"
                                    value={massUploadShopItemsText}
                                    onChange={(e) => setMassUploadShopItemsText(e.target.value)}
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold font-mono placeholder:text-zinc-700 resize-none"
                                />
                            </div>

                            <div className="flex gap-3 justify-end mt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowMassUploadShopItemsModal(false)}
                                    className="px-4 py-2 border border-zinc-700 hover:bg-zinc-900 text-zinc-400 text-xs rounded transition uppercase cursor-pointer"
                                >
                                    CANCEL_
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading === "mass-upload-shop"}
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded transition uppercase cursor-pointer"
                                >
                                    {loading === "mass-upload-shop" ? "UPLOADING..." : "RUN_BATCH_IMPORT"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Decline Sign-off Feedback */}
            {decliningSignOff && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
                    <div className="bg-zinc-950 border border-red-500/30 rounded-xl p-6 w-full max-w-md shadow-[0_0_50px_rgba(239,68,68,0.15)] relative">
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

                        <h2 className="text-zinc-100 font-extrabold text-lg uppercase tracking-wider mb-2 flex items-center gap-2">
                            <span>✕</span> Decline Sign-off
                        </h2>
                        <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                            Provide decline feedback/reason for <strong className="text-zinc-200">{decliningSignOff.roverName}</strong>&apos;s milestone <strong className="text-amber-400">&quot;{decliningSignOff.questTitle}&quot;</strong>. A WhatsApp message notification containing this feedback will be sent automatically.
                        </p>

                        <form onSubmit={handleDeclineSignOffSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase text-red-500/60 font-bold">Feedback message:</label>
                                <textarea
                                    required
                                    value={declineReasonText}
                                    onChange={(e) => setDeclineReasonText(e.target.value)}
                                    placeholder="e.g., Please complete the physical check-in or verify the tasks with your unit leader."
                                    className="bg-black border border-red-500/20 focus:border-red-500/60 text-zinc-200 p-3 text-xs rounded focus:outline-none font-semibold h-24 resize-none"
                                />
                            </div>

                            <div className="flex gap-3 justify-end mt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDecliningSignOff(null);
                                        setDeclineReasonText("");
                                    }}
                                    className="px-4 py-2 border border-zinc-700 hover:bg-zinc-900 text-zinc-400 text-xs rounded transition uppercase cursor-pointer"
                                >
                                    CANCEL
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading === `decline-${decliningSignOff.roverId}-${decliningSignOff.questId}`}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-400 text-black font-extrabold text-xs rounded transition uppercase cursor-pointer"
                                >
                                    {loading === `decline-${decliningSignOff.roverId}-${decliningSignOff.questId}` ? "DECLINING..." : "CONFIRM_DECLINE"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Send Quest Reminder */}
            {reminderQuest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in text-left">
                    <div className="bg-zinc-950 border border-amber-500/30 rounded-xl p-6 w-full max-w-md shadow-[0_0_50px_rgba(245,158,11,0.15)] relative">
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

                        <h2 className="text-zinc-100 font-extrabold text-lg uppercase tracking-wider mb-2 flex items-center gap-2">
                            <span>🔔</span> Send Quest Reminder
                        </h2>
                        <p className="text-xs text-zinc-400 mb-4 leading-relaxed font-sans">
                            Send a WhatsApp reminder message to the WhatsApp Group chat containing the quest details.
                        </p>

                        <form onSubmit={handleSendReminderSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] uppercase text-amber-500/60 font-bold">WhatsApp Group JID (chatId):</label>
                                <input
                                    type="text"
                                    required
                                    value={reminderGroupId}
                                    onChange={(e) => setReminderGroupId(e.target.value)}
                                    placeholder="e.g., 120363294324389024@g.us"
                                    className="bg-black border border-amber-500/30 text-zinc-200 px-3 py-2 text-xs rounded focus:outline-none focus:border-amber-400 font-semibold"
                                />
                                <span className="text-[8px] text-zinc-500 uppercase mt-0.5 font-sans">
                                    Format: (Group ID number)@g.us. Operation HELIOS group JID will be saved after sending.
                                </span>
                            </div>

                            <div className="bg-amber-950/10 border border-amber-500/10 rounded p-3 text-[10px] text-amber-500/80 font-mono">
                                <span className="font-bold text-amber-400">📝 MSG PREVIEW:</span><br />
                                🔔 *HELIOS MISSION REMINDER* 🔔<br /><br />
                                📢 Rovers! Don&apos;t forget to complete the active challenge: *&quot;{reminderQuest.title}&quot;*!<br />
                                💰 Reward: *{reminderQuest.creditReward} Credits*<br />
                                {reminderQuest.clueHint && <>🔍 Clue Hint: {reminderQuest.clueHint}<br /></>}
                                Navigate: https://sdcsaintjeanmarc.org/en/rovers/terminal
                            </div>

                            <div className="flex gap-3 justify-end mt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setReminderQuest(null);
                                    }}
                                    className="px-4 py-2 border border-zinc-700 hover:bg-zinc-900 text-zinc-400 text-xs rounded transition uppercase cursor-pointer"
                                >
                                    CANCEL
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading === `reminder-${reminderQuest.id}`}
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded transition uppercase cursor-pointer"
                                >
                                    {loading === `reminder-${reminderQuest.id}` ? "SENDING..." : "DISPATCH_REMINDER"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal: Points History */}
            {historyScoutId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
                    <div className="bg-zinc-950 border-2 border-amber-500/40 rounded-lg max-w-2xl w-full p-6 shadow-[0_0_50px_rgba(245,158,11,0.15)] text-left font-mono my-8">
                        <div className="flex justify-between items-center border-b border-amber-500/20 pb-2 mb-4">
                            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest">
                                📊 POINTS_HISTORY: {historyScoutName}
                            </h3>
                            <button
                                onClick={() => setHistoryScoutId(null)}
                                className="text-zinc-500 hover:text-amber-400 font-bold text-sm cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {loadingHistory ? (
                            <div className="py-8 text-center text-zinc-500 uppercase tracking-wider text-xs">
                                ⏳ QUERYING LOG MATRIX...
                            </div>
                        ) : historyItems.length === 0 ? (
                            <div className="py-8 text-center text-zinc-600 uppercase tracking-wider text-xs">
                                No credit transaction records found.
                            </div>
                        ) : (
                            <div className="max-h-[60vh] overflow-y-auto pr-1">
                                <table className="w-full text-left border-collapse text-xs font-semibold text-zinc-300">
                                    <thead>
                                        <tr className="border-b border-amber-500/20 bg-black/60 text-amber-500 uppercase text-[9px] tracking-wider">
                                            <th className="p-2.5 bg-black/40">Timestamp</th>
                                            <th className="p-2.5 bg-black/40">Event</th>
                                            <th className="p-2.5 bg-black/40 text-right">Delta</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historyItems.map((item, idx) => {
                                            const isPositive = item.change > 0;
                                            return (
                                                <tr key={idx} className="border-b border-zinc-900 hover:bg-zinc-900/50">
                                                    <td className="p-2.5 text-zinc-500 font-mono text-[10px] whitespace-nowrap">
                                                        <LocalDateStr date={item.timestamp} />
                                                    </td>
                                                    <td className="p-2.5">
                                                        <div className="text-zinc-200">{item.description}</div>
                                                        <div className="text-[9px] text-zinc-500 uppercase mt-0.5">
                                                            {item.type}
                                                        </div>
                                                    </td>
                                                    <td className={`p-2.5 text-right font-bold font-mono text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                                        {isPositive ? `+${item.change}` : item.change} CR
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="flex justify-end mt-4 pt-3 border-t border-zinc-900">
                            <button
                                type="button"
                                onClick={() => setHistoryScoutId(null)}
                                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 text-xs rounded transition uppercase cursor-pointer"
                            >
                                CLOSE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

