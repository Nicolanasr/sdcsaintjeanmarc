"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { TICKET_PRICE } from "@/lib/constants";

interface Team {
    id: string;
    name: string;
    flagUrl: string;
    totalWins: number;
    isEliminated: boolean;
}

interface WhatsAppLog {
    id: number;
    phone: string;
    body: string;
    status: string;
    error: string | null;
    createdAt: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const isAr = locale === "ar";

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [teams, setTeams] = useState<Team[]>([]);
    const [ticketsCount, setTicketsCount] = useState(0);
    const [allTickets, setAllTickets] = useState<any[]>([]);

    // New team form state
    const [newTeamId, setNewTeamId] = useState("");
    const [newTeamName, setNewTeamName] = useState("");
    const [newTeamFlag, setNewTeamFlag] = useState("");

    // Draw state
    const [drawing, setDrawing] = useState(false);
    const [winners, setWinners] = useState<any[]>([]);
    const [syncing, setSyncing] = useState(false);
    const [teamSearch, setTeamSearch] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [groupBy, setGroupBy] = useState<"none" | "country" | "scout" | "buyer" | "paymentMethod">("none");
    const [ticketSearchQuery, setTicketSearchQuery] = useState("");
    const [expandedGroups, setExpandedGroups] = useState<{[key: string]: boolean}>({});
    const [whatsappSettings, setWhatsappSettings] = useState({ 
        sendOnPurchase: true, 
        sendOnGoal: false,
        templatePurchaseAr: "",
        templatePurchaseEn: ""
    });
    const [verifyingIds, setVerifyingIds] = useState<number[]>([]);

    const [templateArInput, setTemplateArInput] = useState("");
    const [templateEnInput, setTemplateEnInput] = useState("");
    const [savingTemplates, setSavingTemplates] = useState(false);

    // Advanced Filters & Custom Dropdown State
    const [filterPaymentMethods, setFilterPaymentMethods] = useState<string[]>([]);
    const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
    const [filterScoutIds, setFilterScoutIds] = useState<string[]>([]);
    const [filterTeamIds, setFilterTeamIds] = useState<string[]>([]);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [scoutsList, setScoutsList] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);

    // Tabs & Logs state
    const [activeTab, setActiveTab] = useState<"raffle" | "teams" | "reporting" | "logs" | "users" | "leaderboard" | "treasury">("raffle");
    const [whatsAppLogs, setWhatsAppLogs] = useState<WhatsAppLog[]>([]);
    const [retryingWhatsApp, setRetryingWhatsApp] = useState(false);
    const [selectedLogId, setSelectedLogId] = useState<number | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowFilterDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Create/Edit User state
    const [newUserEmail, setNewUserEmail] = useState("");
    const [newUserPassword, setNewUserPassword] = useState("");
    const [newUserFullName, setNewUserFullName] = useState("");
    const [newUserRole, setNewUserRole] = useState<"scout" | "admin">("scout");
    const [newUserUnit, setNewUserUnit] = useState("");
    const [creatingUser, setCreatingUser] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [updatingUser, setUpdatingUser] = useState(false);

    // Treasury States
    const [treasuryScouts, setTreasuryScouts] = useState<any[]>([]);
    const [financialSummary, setFinancialSummary] = useState<any | null>(null);
    const [treasurySummary, setTreasurySummary] = useState<{ grandTotal: number; grandPending: number; grandSettled: number; scoutsWithPending: number } | null>(null);
    const [selectedTreasuryScout, setSelectedTreasuryScout] = useState<any | null>(null);
    const [scoutTickets, setScoutTickets] = useState<any[]>([]);
    const [scoutTicketsNextCursor, setScoutTicketsNextCursor] = useState<number | null>(null);
    const [scoutTicketsHasMore, setScoutTicketsHasMore] = useState(false);
    const [loadingDrill, setLoadingDrill] = useState(false);
    const [selectedSettleTicketIds, setSelectedSettleTicketIds] = useState<number[]>([]);
    const [settlingCash, setSettlingCash] = useState(false);
    const [loadingTreasury, setLoadingTreasury] = useState(false);

    // Shuffling animation state for raffle draw
    const [shufflingName, setShufflingName] = useState("");
    const [shufflingTicketId, setShufflingTicketId] = useState<string | number>("");
    const [animationRunning, setAnimationRunning] = useState(false);

    const handleRetryWhatsApp = async (logId?: number) => {
        setRetryingWhatsApp(true);
        try {
            const res = await fetch("/api/admin/retry-whatsapp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ logId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Retry failed");
            alert(isAr 
                ? `تمت إعادة محاولة إرسال الرسائل. تم إرسال ${data.count} رسالة بنجاح.` 
                : `Retry completed. Successfully sent ${data.count} messages.`
            );
            await reloadActiveTabData();
        } catch (err: any) {
            alert("Retry failed: " + err.message);
        } finally {
            setRetryingWhatsApp(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUserEmail || !newUserPassword || !newUserFullName) return;

        setCreatingUser(true);
        try {
            const res = await fetch("/api/admin/create-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: newUserEmail,
                    password: newUserPassword,
                    fullName: newUserFullName,
                    role: newUserRole,
                    unit: newUserUnit ? newUserUnit : null,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create user");

            alert(isAr ? "تم إنشاء الحساب بنجاح!" : "User account created successfully!");
            setNewUserEmail("");
            setNewUserPassword("");
            setNewUserFullName("");
            setNewUserRole("scout");
            setNewUserUnit("");
            await reloadActiveTabData();
        } catch (err: any) {
            alert(err.message || "Failed to create user");
        } finally {
            setCreatingUser(false);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser || !newUserEmail || !newUserFullName) return;

        setUpdatingUser(true);
        try {
            const res = await fetch("/api/admin/create-user", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editingUser.id,
                    email: newUserEmail,
                    password: newUserPassword || undefined,
                    fullName: newUserFullName,
                    role: newUserRole,
                    unit: newUserUnit ? newUserUnit : null,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update user");

            alert(isAr ? "تم تحديث الحساب بنجاح!" : "User account updated successfully!");
            setEditingUser(null);
            setNewUserEmail("");
            setNewUserPassword("");
            setNewUserFullName("");
            setNewUserRole("scout");
            setNewUserUnit("");
            await reloadActiveTabData();
        } catch (err: any) {
            alert(err.message || "Failed to update user");
        } finally {
            setUpdatingUser(false);
        }
    };

    const startEditingUser = (u: any) => {
        setEditingUser(u);
        setNewUserEmail(u.email);
        setNewUserFullName(u.fullName);
        setNewUserRole(u.role);
        setNewUserPassword("");
        setNewUserUnit(u.unit || "");
    };

    const cancelEditingUser = () => {
        setEditingUser(null);
        setNewUserEmail("");
        setNewUserFullName("");
        setNewUserRole("scout");
        setNewUserPassword("");
    };

    const handleVerifyTickets = async (ticketIds: number[], status: "PAID" | "REJECTED" = "PAID") => {
        const isPaid = status === "PAID";
        const confirmMsg = isPaid 
            ? (isAr ? "هل أنت متأكد من تأكيد استلام الدفعة لهذه التذاكر؟" : "Are you sure you want to verify payment for these tickets?")
            : (isAr ? "هل أنت متأكد من رفض هذه العملية؟" : "Are you sure you want to reject this payment transaction?");
            
        if (!confirm(confirmMsg)) {
            return;
        }
        setVerifyingIds(prev => [...prev, ...ticketIds]);
        try {
            const res = await fetch("/api/admin/verify-ticket", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ticketIds, status }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Verification failed");
            alert(isPaid 
                ? (isAr ? "تم تأكيد الدفعة بنجاح وإرسال الرسائل!" : "Payment successfully verified and WhatsApp sent!")
                : (isAr ? "تم رفض الدفعة بنجاح!" : "Payment transaction successfully rejected!")
            );
            await reloadActiveTabData();
        } catch (err: any) {
            alert("Action failed: " + err.message);
        } finally {
            setVerifyingIds(prev => prev.filter(id => !ticketIds.includes(id)));
        }
    };

    const toggleGroup = (key: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const formatLocalDate = (dateString: string) => {
        try {
            const d = new Date(dateString);
            return d.toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
            });
        } catch (e) {
            return dateString;
        }
    };

    const handleSaveWhatsAppSettingsObj = async (updatedObj: any) => {
        const old = whatsappSettings;
        setWhatsappSettings(updatedObj);
        try {
            const res = await fetch("/api/admin/whatsapp-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedObj),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save WhatsApp settings");
            }
        } catch (err: any) {
            alert(err.message || "Failed to update settings");
            setWhatsappSettings(old);
        }
    };

    const handleSaveTemplates = async () => {
        setSavingTemplates(true);
        const updated = { 
            ...whatsappSettings, 
            templatePurchaseAr: templateArInput, 
            templatePurchaseEn: templateEnInput 
        };
        try {
            const res = await fetch("/api/admin/whatsapp-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updated),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save templates");
            setWhatsappSettings(updated);
            alert(isAr ? "تم حفظ قوالب الرسائل بنجاح!" : "WhatsApp templates saved successfully!");
        } catch (err: any) {
            alert(err.message || "Failed to save templates");
        } finally {
            setSavingTemplates(false);
        }
    };

    const handleExportCSV = (ticketsList: any[]) => {
        const headers = [
            "Ticket ID",
            "Scout Name",
            "Buyer Name",
            "Phone Number",
            "Selected Team",
            "Raffle Entries",
            "Payment Method",
            "Transaction ID",
            "Purchase Date",
            "Status"
        ];
        
        const rows = ticketsList.map((t) => {
            const scoutName = t.scout?.fullName || (t.paymentMethod === "WHISH" ? "Online" : "Public");
            const entries = t.team ? (1 + (t.team.totalWins || 0)) : 1;
            return [
                t.id,
                scoutName,
                t.buyerName,
                t.buyerPhone,
                t.team?.name || t.teamId,
                entries,
                t.paymentMethod || "CASH",
                t.whishTransactionId || "",
                new Date(t.createdAt).toLocaleDateString(),
                t.paymentStatus
            ];
        });

        const csvContent = 
            "\uFEFF" + // UTF-8 BOM
            [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
            
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `scout_tickets_export_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Reset expanded state when group method changes
    useEffect(() => {
        setExpandedGroups({});
    }, [groupBy]);

    useEffect(() => {
        async function checkAdmin() {
            try {
                const userRes = await fetch("/api/auth/me");
                if (!userRes.ok) {
                    router.replace(`/${locale}/login`);
                    return;
                }

                const userData = await userRes.json();
                if (!userData.user || userData.user.role !== "admin") {
                    router.replace(`/${locale}/scout-world-cup/dashboard/scout`);
                    return;
                }

                setProfile(userData.user);
            } catch (err) {
                router.replace(`/${locale}/scout-world-cup/dashboard/scout`);
            } finally {
                setLoading(false);
            }
        }

        checkAdmin();
    }, []);

    const loadRaffleData = async () => {
        try {
            const [statsRes, waRes] = await Promise.all([
                fetch("/api/admin/raffle-stats"),
                fetch("/api/admin/whatsapp-settings"),
            ]);
            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setTicketsCount(statsData.totalTickets || 0);
            }
            if (waRes.ok) {
                const waData = await waRes.json();
                const settings = waData.settings || { sendOnPurchase: true, sendOnGoal: false };
                setWhatsappSettings(settings);
                setTemplateArInput(settings.templatePurchaseAr || "");
                setTemplateEnInput(settings.templatePurchaseEn || "");
            }
        } catch (err) {
            console.error("Error loading raffle data:", err);
        }
    };

    const loadTeamsData = async () => {
        try {
            const teamsRes = await fetch("/api/teams");
            if (teamsRes.ok) {
                const teamsData = await teamsRes.json();
                setTeams(teamsData.teams || []);
            }
        } catch (err) {
            console.error("Error loading teams data:", err);
        }
    };

    const loadReportingData = async () => {
        try {
            const [repRes, usersRes, teamsRes] = await Promise.all([
                fetch("/api/admin/reports"),
                fetch("/api/admin/create-user"),
                fetch("/api/teams"),
            ]);
            if (repRes.ok) {
                const repData = await repRes.json();
                setAllTickets(repData.tickets || []);
            }
            if (usersRes.ok) {
                const usersData = await usersRes.json();
                setScoutsList(usersData.users || []);
            }
            if (teamsRes.ok) {
                const teamsData = await teamsRes.json();
                setTeams(teamsData.teams || []);
            }
        } catch (err) {
            console.error("Error loading reporting data:", err);
        }
    };

    const loadLogsData = async () => {
        try {
            const logsRes = await fetch("/api/admin/logs");
            if (logsRes.ok) {
                const logsData = await logsRes.json();
                setWhatsAppLogs(logsData.logs || []);
            }
        } catch (err) {
            console.error("Error loading logs data:", err);
        }
    };

    const loadUsersData = async () => {
        try {
            const usersRes = await fetch("/api/admin/create-user");
            if (usersRes.ok) {
                const usersData = await usersRes.json();
                setUsers(usersData.users || []);
            }
        } catch (err) {
            console.error("Error loading users data:", err);
        }
    };

    const loadLeaderboardData = async () => {
        try {
            const res = await fetch("/api/admin/leaderboard");
            if (res.ok) {
                const data = await res.json();
                setLeaderboard(data.leaderboard || []);
            }
        } catch (err) {
            console.error("Error loading leaderboard data:", err);
        }
    };

    const loadTreasuryData = async () => {
        setLoadingTreasury(true);
        try {
            // Parallel: full financial summary + per-scout ledger (both use DB aggregations)
            const [summaryRes, ledgerRes] = await Promise.all([
                fetch("/api/admin/treasury?mode=summary"),
                fetch("/api/admin/treasury?mode=ledger"),
            ]);

            if (summaryRes.ok) {
                const summaryData = await summaryRes.json();
                setFinancialSummary(summaryData.summary || null);
                // Build legacy treasurySummary shape for existing UI cards
                if (summaryData.summary) {
                    const s = summaryData.summary;
                    setTreasurySummary({
                        grandTotal: s.cashRevenue,
                        grandPending: s.cashOutstanding,
                        grandSettled: s.cashSettledValue,
                        scoutsWithPending: 0,
                    });
                }
            }

            if (ledgerRes.ok) {
                const ledgerData = await ledgerRes.json();
                const ledger = ledgerData.ledger || [];
                setTreasuryScouts(ledger);
                // Update scoutsWithPending in treasurySummary
                const withPending = ledger.filter((sc: any) => sc.pendingCashHandover > 0).length;
                setTreasurySummary((prev) => prev ? { ...prev, scoutsWithPending: withPending } : prev);

                // If a scout was selected, reload their drill-down
                if (selectedTreasuryScout) {
                    const updated = ledger.find((s: any) => s.id === selectedTreasuryScout.id);
                    if (updated) setSelectedTreasuryScout(updated);
                }
            }
        } catch (err) {
            console.error("Error loading treasury data:", err);
        } finally {
            setLoadingTreasury(false);
        }
    };

    const loadDrillDown = async (scoutId: string, append = false) => {
        setLoadingDrill(true);
        try {
            const cursorParam = append && scoutTicketsNextCursor ? `&cursor=${scoutTicketsNextCursor}` : "";
            const res = await fetch(`/api/admin/treasury?mode=drill&scoutId=${scoutId}&limit=50${cursorParam}`);
            if (res.ok) {
                const data = await res.json();
                setScoutTickets((prev) => append ? [...prev, ...(data.tickets || [])] : (data.tickets || []));
                setScoutTicketsNextCursor(data.nextCursor ?? null);
                setScoutTicketsHasMore(data.hasMore ?? false);
            }
        } catch (err) {
            console.error("Error loading drill-down tickets:", err);
        } finally {
            setLoadingDrill(false);
        }
    };


    const handleSettleCash = async () => {
        if (selectedSettleTicketIds.length === 0) return;
        setSettlingCash(true);
        try {
            const res = await fetch("/api/admin/treasury/settle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ticketIds: selectedSettleTicketIds }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to settle");
            alert(`✅ ${data.count} cash ticket(s) marked as settled successfully!`);
            setSelectedSettleTicketIds([]);
            await loadTreasuryData();
        } catch (err: any) {
            alert("❌ Settlement failed: " + err.message);
        } finally {
            setSettlingCash(false);
        }
    };

    const reloadActiveTabData = async () => {
        if (activeTab === "raffle") await loadRaffleData();
        else if (activeTab === "teams") await loadTeamsData();
        else if (activeTab === "reporting") await loadReportingData();
        else if (activeTab === "logs") await loadLogsData();
        else if (activeTab === "users") await loadUsersData();
        else if (activeTab === "leaderboard") await loadLeaderboardData();
        else if (activeTab === "treasury") await loadTreasuryData();
    };

    useEffect(() => {
        if (!profile) return;
        reloadActiveTabData();
    }, [activeTab, profile]);

    // Quick Seed Teams
    const handleSeedTeams = async () => {
        try {
            const res = await fetch("/api/teams/seed", { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to seed teams");

            alert("Successfully seeded World Cup teams!");
            await reloadActiveTabData();
        } catch (err: any) {
            alert("Seeding failed: " + err.message);
        }
    };

    // Sync Goals manually from API
    const handleSyncGoals = async () => {
        setSyncing(true);
        try {
            const res = await fetch("/api/cron/sync-goals");
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Sync failed");

            alert(data.message || "Goals synchronized successfully!");
            await reloadActiveTabData();
        } catch (err: any) {
            alert(err.message || "Failed to sync goals");
        } finally {
            setSyncing(false);
        }
    };

    // Add custom team manually
    const handleAddTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTeamId || !newTeamName || !newTeamFlag) return;

        try {
            const res = await fetch("/api/teams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: newTeamId,
                    name: newTeamName,
                    flagUrl: newTeamFlag,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to add team");

            setNewTeamId("");
            setNewTeamName("");
            setNewTeamFlag("");
            await reloadActiveTabData();
        } catch (err: any) {
            alert(err.message || "Failed to add team");
        }
    };

    // Update goals, podium finish, elimination status
    const handleUpdateTeam = async (
        teamId: string,
        updates: Partial<Team>
    ) => {
        try {
            const res = await fetch("/api/teams", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: teamId,
                    ...updates,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update team");

            setTeams((prev) =>
                prev.map((t) => (t.id === teamId ? { ...t, ...updates } : t))
            );
        } catch (err: any) {
            alert(err.message || "Failed to update team details");
        }
    };

    // Trigger Weighted Draw with Shuffling Animation
    const handleExecuteDraw = async () => {
        if (confirm(isAr ? "هل أنت متأكد من إجراء السحب النهائي على الجوائز؟" : "Are you sure you want to execute the weighted raffle draw?")) {
            setDrawing(true);
            setWinners([]);
            setAnimationRunning(true);
            try {
                const res = await fetch("/api/draw", { method: "POST" });
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || "Raffle draw execution failed");

                const winner = result.winners[0];
                if (!winner) throw new Error("No winner chosen");

                // Get list of PAID ticket buyers as candidates for shuffling animation
                const candidates = allTickets
                    .filter((t) => t.paymentStatus === "PAID")
                    .map((t) => ({ name: t.buyerName, ticketId: t.id }));

                const fallbackCandidates = [
                    { name: "Nicolas", ticketId: "1002" },
                    { name: "John", ticketId: "1015" },
                    { name: "Rita", ticketId: "1028" },
                    { name: "Marc", ticketId: "1032" }
                ];
                const pool = candidates.length > 0 ? candidates : fallbackCandidates;

                let delay = 50;
                const duration = 3000; // total animation duration (3 seconds)
                const startTime = Date.now();

                const runShuffling = () => {
                    const elapsed = Date.now() - startTime;
                    if (elapsed >= duration) {
                        // Animation complete, stop and set the actual winner
                        setShufflingName(winner.buyerName);
                        setShufflingTicketId(winner.id);
                        setTimeout(() => {
                            setAnimationRunning(false);
                            setWinners([winner]);
                            alert(isAr ? `تهانينا للفائز: ${winner.buyerName}!` : `Congratulations to the winner: ${winner.buyerName}!`);
                        }, 500);
                        return;
                    }

                    // Pick random candidate
                    const randomIdx = Math.floor(Math.random() * pool.length);
                    setShufflingName(pool[randomIdx].name);
                    setShufflingTicketId(pool[randomIdx].ticketId);

                    // Exponentially slow down the shuffling
                    delay = 50 + Math.pow(elapsed / duration, 2) * 400;
                    setTimeout(runShuffling, delay);
                };

                runShuffling();
            } catch (err: any) {
                alert(err.message || "Error running draw");
                setAnimationRunning(false);
                setDrawing(false);
            } finally {
                setDrawing(false);
            }
        }
    };

    // Analytics & Charts Calculations
    const getSalesOverTime = () => {
        const dates: { [key: string]: number } = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
            dates[label] = 0;
        }
        allTickets.forEach((t) => {
            if (t.paymentStatus === "PAID") {
                const dateStr = new Date(t.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" });
                if (dates[dateStr] !== undefined) {
                    dates[dateStr]++;
                }
            }
        });
        return Object.entries(dates).map(([date, count]) => ({ date, count }));
    };

    const salesOverTime = getSalesOverTime();
    const maxCount = Math.max(...salesOverTime.map(d => d.count), 1);
    const chartWidth = 500;
    const chartHeight = 130;
    const points = salesOverTime.map((d, idx) => {
        const x = (idx / 6) * chartWidth;
        const y = chartHeight - (d.count / maxCount) * (chartHeight - 30) - 15;
        return { x, y, date: d.date, count: d.count };
    });
    const pathData = points.length > 0 
        ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ")
        : "";
    const areaData = pathData ? `${pathData} L ${points[points.length-1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z` : "";

    const getTopTeamsData = () => {
        const counts: { [key: string]: { name: string, count: number, flag: string } } = {};
        allTickets.forEach((t) => {
            if (t.paymentStatus === "PAID" && t.team) {
                const key = t.team.name;
                if (!counts[key]) {
                    counts[key] = { name: t.team.name, count: 0, flag: t.team.flagUrl };
                }
                counts[key].count++;
            }
        });
        return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5);
    };
    const topTeamsData = getTopTeamsData();

    const cashCount = allTickets.filter(t => t.paymentStatus === "PAID" && t.paymentMethod === "CASH").length;
    const whishCount = allTickets.filter(t => t.paymentStatus === "PAID" && t.paymentMethod === "WHISH").length;
    const totalPaidCount = cashCount + whishCount;
    const cashPct = totalPaidCount > 0 ? (cashCount / totalPaidCount) * 100 : 0;
    const whishPct = totalPaidCount > 0 ? (whishCount / totalPaidCount) * 100 : 0;
    const circ = 251.2;
    const cashStroke = (cashPct / 100) * circ;
    const whishStroke = (whishPct / 100) * circ;

    const failedLogsCount = whatsAppLogs.filter((log) => log.status === "FAILED").length;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-scout-beige">
                <span className="animate-spin border-4 border-scout-navy border-t-transparent rounded-full w-12 h-12" />
            </div>
        );
    }

    const tabs = [
        { id: "raffle", label: isAr ? "السحب والإعدادات" : "Raffle & Settings", icon: "🎟️" },
        { id: "teams", label: isAr ? "إعداد الفرق" : "Teams Config", icon: "⚽" },
        { id: "reporting", label: isAr ? "التقارير والإحصاءات" : "Ticket Reports", icon: "📊" },
        { id: "treasury", label: isAr ? "الخزنة والتحصيل" : "Treasury & Cash", icon: "💰" },
        { id: "leaderboard", label: isAr ? "لوحة الصدارة" : "Leaderboard", icon: "🏆" },
        { id: "logs", label: isAr ? "سجلات واتساب" : "WhatsApp Logs", icon: "💬" },
        { id: "users", label: isAr ? "إنشاء مستخدمين" : "Create Users", icon: "👤" },
    ];

    return (
        <div className="min-h-screen bg-scout-beige text-scout-charcoal">
            {/* Header */}
            <header className="bg-scout-navy text-white py-4 px-6 shadow-md flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold font-display text-scout-gold">
                        {isAr ? "لوحة تحكم المسؤول" : "Admin Control Panel"}
                    </h1>
                    <p className="text-xs text-white/70">
                        {isAr ? "إدارة مسابقة سحب كأس الكشافة ورسم القرعة" : "Manage Scout Cup Draw & Draw Raffle"}
                    </p>
                </div>
                <button
                    onClick={() => router.push(`/${locale}/scout-world-cup/dashboard/scout`)}
                    className="text-sm px-4 py-1.5 rounded-lg bg-scout-gold text-scout-navy font-semibold hover:bg-scout-gold-light transition cursor-pointer"
                >
                    {isAr ? "بوابة المبيعات" : "Sales Portal"}
                </button>
            </header>

            {/* Tab Navigation Menu */}
            <div className="max-w-6xl mx-auto px-6 pt-6">
                <div className="flex flex-wrap border-b border-scout-navy/10 gap-1 sm:gap-2">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-1.5 px-4 py-3 text-xs sm:text-sm font-bold rounded-t-xl transition-all cursor-pointer relative ${
                                    isActive
                                        ? "bg-white text-scout-navy border-t border-x border-scout-navy/10 shadow-sm"
                                        : "text-scout-navy/60 hover:text-scout-navy hover:bg-white/40"
                                }`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                                {tab.id === "logs" && failedLogsCount > 0 && (
                                    <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-red-600 text-white rounded-full font-black animate-pulse">
                                        {failedLogsCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <main className="max-w-6xl mx-auto p-6 space-y-8 bg-white/40 rounded-b-2xl border-x border-b border-scout-navy/5 shadow-sm min-h-[600px]">
                
                {/* 1. RAFFLE & SETTINGS TAB */}
                {activeTab === "raffle" && (
                    <div className="space-y-8 animate-in fade-in duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Total Sold Card */}
                            <div className="glass-panel p-6 rounded-2xl shadow-md flex flex-col justify-between bg-white/70">
                                <div>
                                    <h3 className="text-sm font-semibold text-scout-charcoal/60 uppercase tracking-wider">
                                        {isAr ? "إجمالي التذاكر المباعة" : "Total Sold Tickets"}
                                    </h3>
                                    <p className="text-4xl font-extrabold text-scout-navy mt-2">
                                        {ticketsCount}
                                    </p>
                                </div>
                                <button
                                    onClick={handleSyncGoals}
                                    disabled={syncing}
                                    className="mt-4 w-full py-2 bg-scout-gold hover:bg-scout-gold-light text-scout-navy text-xs font-bold rounded-lg disabled:opacity-50 transition cursor-pointer"
                                >
                                    {syncing ? (isAr ? "جاري المزامنة..." : "Syncing...") : (isAr ? "مزامنة أهداف كأس العالم" : "Sync Live Matches")}
                                </button>
                            </div>

                            {/* Unsent WhatsApp Logs Card */}
                            <div className="glass-panel p-6 rounded-2xl shadow-md flex flex-col justify-between bg-white/70">
                                <div>
                                    <h3 className="text-sm font-semibold text-scout-charcoal/60 uppercase tracking-wider">
                                        {isAr ? "رسائل معلقة / فشل الإرسال" : "Failed / Unsent Messages"}
                                    </h3>
                                    <p className="text-4xl font-extrabold text-red-700 mt-2">
                                        {failedLogsCount}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleRetryWhatsApp()}
                                    disabled={retryingWhatsApp || failedLogsCount === 0}
                                    className="mt-4 w-full py-2 bg-scout-navy hover:bg-scout-navy-light text-white text-xs font-bold rounded-lg disabled:opacity-50 transition cursor-pointer"
                                >
                                    {retryingWhatsApp ? (isAr ? "جاري إعادة الإرسال..." : "Retrying...") : (isAr ? "مزامنة الرسائل غير المرسلة" : "Sync Unsent Messages")}
                                </button>
                            </div>

                            {/* The Weighted Draw Engine */}
                            <div className="glass-panel p-6 rounded-2xl shadow-md border-l-4 border-scout-gold bg-white/70">
                                <h2 className="text-lg font-bold font-display text-scout-navy mb-2">
                                    {isAr ? "محرك السحب والقرعة المرجح" : "The Weighted Draw Engine"}
                                </h2>
                                <p className="text-xs text-scout-charcoal/70 mb-4">
                                    {isAr
                                        ? "يقوم السحب باختيار فائز واحد عشوائي ومحمي بناءً على فرص المنتخبات المضافة للانتصارات."
                                        : "Sequentially compiles the paid ticket pool factoring team wins, selecting exactly 1 winner."}
                                </p>
                                <button
                                    onClick={handleExecuteDraw}
                                    disabled={drawing || animationRunning}
                                    className="w-full py-2.5 bg-scout-green hover:bg-scout-green-light text-white font-semibold rounded-lg shadow-md disabled:opacity-50 transition cursor-pointer text-xs"
                                >
                                    {drawing || animationRunning ? (
                                        <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
                                    ) : (
                                        isAr ? "تشغيل السحب وإعلان الفائز" : "Compile Raffle Pool & Execute Draw"
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Analytics Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Daily Sales Trend Chart */}
                            <div className="glass-panel p-5 rounded-2xl shadow-md bg-white/70 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xs font-bold text-scout-navy uppercase tracking-wider mb-3">
                                        📈 {isAr ? "اتجاه المبيعات اليومية (آخر 7 أيام)" : "Daily Sales Trend (Last 7 Days)"}
                                    </h3>
                                    <div className="w-full flex items-center justify-center pt-2">
                                        <svg viewBox="0 0 500 170" className="w-full h-auto overflow-visible">
                                            <defs>
                                                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.3" />
                                                    <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.0" />
                                                </linearGradient>
                                            </defs>
                                            {/* Grids */}
                                            <line x1="0" y1="140" x2="500" y2="140" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                                            <line x1="0" y1="80" x2="500" y2="80" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                                            <line x1="0" y1="20" x2="500" y2="20" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                                            {/* Area */}
                                            {areaData && <path d={areaData} fill="url(#salesGrad)" />}
                                            {/* Line */}
                                            {pathData && <path d={pathData} fill="none" stroke="#1E3A8A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
                                            {/* Dots */}
                                            {points.map((p, idx) => (
                                                <g key={idx} className="group cursor-pointer">
                                                    <circle cx={p.x} cy={p.y} r="5" fill="#D97706" stroke="#1E3A8A" strokeWidth="2" />
                                                    <text x={p.x} y={p.y - 10} textAnchor="middle" className="text-[10px] font-bold fill-scout-navy opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {p.count}
                                                    </text>
                                                </g>
                                            ))}
                                            {/* Axis labels */}
                                            {points.map((p, idx) => (
                                                <text key={idx} x={p.x} y="160" textAnchor="middle" className="text-[9px] fill-scout-charcoal/60 font-semibold">
                                                    {p.date}
                                                </text>
                                            ))}
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Top Teams Selected Chart */}
                            <div className="glass-panel p-5 rounded-2xl shadow-md bg-white/70 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xs font-bold text-scout-navy uppercase tracking-wider mb-3">
                                        ⚽ {isAr ? "أكثر المنتخبات اختياراً" : "Top Selected Teams"}
                                    </h3>
                                    <div className="space-y-3 pt-2">
                                        {topTeamsData.length === 0 ? (
                                            <p className="text-xs text-scout-charcoal/40 text-center py-8">{isAr ? "لا توجد بيانات حالياً." : "No team sales data yet."}</p>
                                        ) : (
                                            topTeamsData.map((team, idx) => {
                                                const maxTeamCount = Math.max(...topTeamsData.map(t => t.count), 1);
                                                const pct = (team.count / maxTeamCount) * 100;
                                                return (
                                                    <div key={idx} className="space-y-1">
                                                        <div className="flex justify-between items-center text-[10px] font-semibold text-scout-navy">
                                                            <div className="flex items-center gap-1.5">
                                                                <img src={team.flag} alt="" className="w-5 h-3 object-cover rounded" onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = "https://flagcdn.com/un.svg";
                                                                }} />
                                                                <span>{team.name}</span>
                                                            </div>
                                                            <span>{team.count} {isAr ? "تذكرة" : "tickets"}</span>
                                                        </div>
                                                        <div className="w-full bg-scout-beige-dark/30 h-2 rounded-full overflow-hidden">
                                                            <div className="bg-scout-gold h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method Donut Chart */}
                            <div className="glass-panel p-5 rounded-2xl shadow-md bg-white/70 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xs font-bold text-scout-navy uppercase tracking-wider mb-3">
                                        💳 {isAr ? "تصنيف طرق الدفع" : "Payment Method Mix"}
                                    </h3>
                                    <div className="flex items-center justify-around pt-2">
                                        {totalPaidCount === 0 ? (
                                            <p className="text-xs text-scout-charcoal/40 text-center py-8">{isAr ? "لا توجد مبيعات مؤكدة." : "No confirmed sales yet."}</p>
                                        ) : (
                                            <>
                                                <svg width="100" height="100" viewBox="0 0 100 100" className="transform -rotate-90">
                                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E2E8F0" strokeWidth="12" />
                                                    {/* Cash segment */}
                                                    {cashPct > 0 && (
                                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10B981" strokeWidth="12"
                                                                strokeDasharray={`${cashStroke} ${circ}`} strokeDashoffset={0} />
                                                    )}
                                                    {/* Whish segment */}
                                                    {whishPct > 0 && (
                                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#8B5CF6" strokeWidth="12"
                                                                strokeDasharray={`${whishStroke} ${circ}`} strokeDashoffset={-cashStroke} />
                                                    )}
                                                </svg>
                                                <div className="space-y-2 text-[10px] font-semibold text-scout-navy">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                                                        <span>{isAr ? "نقدي (Cash)" : "Cash"}: {cashCount} ({cashPct.toFixed(0)}%)</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2.5 h-2.5 bg-violet-500 rounded-full" />
                                                        <span>{isAr ? "ويش (Whish)" : "Whish"}: {whishCount} ({whishPct.toFixed(0)}%)</span>
                                                    </div>
                                                    <div className="text-center font-bold border-t pt-1 text-[11px]">
                                                        {isAr ? "الإجمالي:" : "Total PAID:"} {totalPaidCount}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shuffling Roulette Animation Overlay */}
                        {animationRunning && (
                            <div className="bg-scout-navy/10 border-2 border-dashed border-scout-gold p-8 rounded-2xl text-center space-y-4 animate-pulse">
                                <h3 className="text-sm font-bold text-scout-navy uppercase tracking-widest">{isAr ? "جاري اختيار الفائز عشوائياً..." : "Selecting Random Winner..."}</h3>
                                <div className="text-3xl font-black text-scout-gold font-display transition-all">{shufflingName}</div>
                                <div className="text-xs text-scout-charcoal/60 font-mono">Ticket #{shufflingTicketId}</div>
                            </div>
                        )}

                        {/* Winners Results Display */}
                        {winners.length > 0 && !animationRunning && (
                            <div className="glass-panel p-6 rounded-2xl shadow-md bg-scout-gold/10 border border-scout-gold/40 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <h2 className="text-xl font-bold font-display text-scout-navy mb-4 text-center">
                                    🏆 {isAr ? "الفائز في السحب النهائي" : "Raffle Winner"} 🏆
                                </h2>
                                <div className="max-w-md mx-auto bg-white/90 p-5 rounded-xl border border-scout-gold text-center relative overflow-hidden shadow">
                                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-scout-gold" />
                                    <span className="text-xs font-bold text-scout-gold uppercase tracking-wider block mb-2">
                                        {isAr ? "الجائزة الكبرى 🥇" : "Grand Prize 🥇"}
                                    </span>
                                    <h4 className="text-lg font-bold text-scout-navy mb-1">
                                        {winners[0].buyerName}
                                    </h4>
                                    <p className="text-xs text-scout-charcoal/70 mb-2">
                                        {winners[0].buyerPhone}
                                    </p>
                                    <div className="text-[11px] bg-scout-beige px-3 py-1.5 rounded-lg inline-block border text-scout-navy font-semibold">
                                        Ticket #{winners[0].id} • Team: {winners[0].teamId}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* WhatsApp Notification Settings */}
                        <div className="glass-panel p-6 rounded-2xl shadow-md bg-white/70">
                            <h2 className="text-md font-bold font-display text-scout-navy mb-2 flex items-center gap-2">
                                <span>💬</span>
                                <span>{isAr ? "تنبيهات واتساب التلقائية" : "WhatsApp Automated Notifications"}</span>
                            </h2>
                            <p className="text-xs text-scout-charcoal/70 mb-4">
                                {isAr
                                    ? "تحكم في إرسال رسائل واتساب التلقائية للمشترين عبر خادم WAHA."
                                    : "Configure automated WhatsApp notifications sent to buyers via our self-hosted WAHA instance."}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6">
                                <label className="flex items-center gap-3 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={whatsappSettings.sendOnPurchase}
                                        onChange={(e) => handleSaveWhatsAppSettingsObj({ ...whatsappSettings, sendOnPurchase: e.target.checked })}
                                        className="w-5 h-5 rounded border-scout-beige-dark text-scout-green accent-scout-green focus:ring-scout-green cursor-pointer"
                                    />
                                    <span className="text-xs font-semibold text-scout-navy">
                                        {isAr ? "إشعار عند شراء التذكرة" : "Notify buyer on ticket purchase"}
                                    </span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={whatsappSettings.sendOnGoal}
                                        onChange={(e) => handleSaveWhatsAppSettingsObj({ ...whatsappSettings, sendOnGoal: e.target.checked })}
                                        className="w-5 h-5 rounded border-scout-beige-dark text-scout-green accent-scout-green focus:ring-scout-green cursor-pointer"
                                    />
                                    <span className="text-xs font-semibold text-scout-navy">
                                        {isAr ? "إشعار عندما يسجل فريقهم أهدافاً" : "Notify buyer when their team scores"}
                                    </span>
                                </label>
                            </div>

                            {whatsappSettings.sendOnPurchase && (
                                <div className="mt-6 border-t pt-4 space-y-4">
                                    <h3 className="text-xs font-bold text-scout-navy uppercase tracking-wider">
                                        {isAr ? "تخصيص رسالة الشراء التلقائية" : "Customize Automated Purchase Messages"}
                                    </h3>
                                    <p className="text-[10px] text-scout-charcoal/60">
                                        {isAr 
                                            ? "يمكنك استخدام المتغيرات التالية: {ticketId} لرقم التذكرة، {buyerName} لاسم المشتري، {teamName} للمنتخب المختار، {trackingLink} لرابط المتابعة."
                                            : "Available variables: {ticketId} (Ticket number), {buyerName} (Buyer's name), {teamName} (Selected team), {trackingLink} (Tracking URL)."}
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-bold text-scout-charcoal/70 uppercase">
                                                {isAr ? "الرسالة بالعربية" : "Arabic Message Template"}
                                            </label>
                                            <textarea
                                                value={templateArInput}
                                                onChange={(e) => setTemplateArInput(e.target.value)}
                                                rows={5}
                                                className="w-full px-3 py-2 rounded-lg border border-scout-beige-dark bg-white focus:outline-none focus:border-scout-navy text-xs font-mono"
                                                placeholder="شكرًا لشرائك تذكرة..."
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-bold text-scout-charcoal/70 uppercase">
                                                {isAr ? "الرسالة بالإنجليزية" : "English Message Template"}
                                            </label>
                                            <textarea
                                                value={templateEnInput}
                                                onChange={(e) => setTemplateEnInput(e.target.value)}
                                                rows={5}
                                                className="w-full px-3 py-2 rounded-lg border border-scout-beige-dark bg-white focus:outline-none focus:border-scout-navy text-xs font-mono"
                                                placeholder="Thank you for purchasing..."
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleSaveTemplates}
                                            disabled={savingTemplates}
                                            className="px-4 py-2 bg-scout-navy hover:bg-scout-navy-light text-white text-xs font-bold rounded-lg transition disabled:opacity-50 cursor-pointer shadow-sm"
                                        >
                                            {savingTemplates ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ القوالب" : "Save Templates")}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pending Verification Tickets */}
                        {allTickets.some(t => t.paymentStatus === "PENDING" && t.whishTransactionId) && (
                            <div className="glass-panel p-6 rounded-2xl shadow-md border-l-4 border-amber-500 bg-amber-500/5">
                                <h2 className="text-lg font-bold font-display text-scout-navy mb-3 flex items-center gap-2">
                                    <span className="text-amber-500">⏳</span>
                                    <span>{isAr ? "تحقق من الدفعات المعلقة (Whish)" : "Pending Whish Payments Verification"}</span>
                                </h2>
                                <p className="text-xs text-scout-charcoal/70 mb-4">
                                    {isAr 
                                        ? "الرجاء مراجعة تطبيق Whish الخاص بك للتأكد من استلام المبالغ ثم اضغط على 'تأكيد الدفع' لإصدار التذاكر للمشترين وإرسالها لهم تلقائياً."
                                        : "Please check your Whish account records to verify the funds were received, then click 'Approve Payment' to issue and send the tickets to the buyers via WhatsApp."}
                                </p>
                                
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left border-collapse bg-white/70 rounded-xl">
                                        <thead>
                                            <tr className="border-b text-scout-navy font-bold uppercase bg-scout-beige-dark/20">
                                                <th className="py-2.5 px-4 text-left">{isAr ? "المشتري" : "Buyer"}</th>
                                                <th className="py-2.5 px-4 text-left">{isAr ? "رقم الهاتف" : "Phone"}</th>
                                                <th className="py-2.5 px-4 text-left">{isAr ? "المنتخب" : "Selected Team"}</th>
                                                <th className="py-2.5 px-4 text-center">{isAr ? "الكمية" : "Qty"}</th>
                                                <th className="py-2.5 px-4 text-center">{isAr ? "المبلغ" : "Amount"}</th>
                                                <th className="py-2.5 px-4 text-left font-mono">{isAr ? "رقم المعاملة" : "Transaction ID"}</th>
                                                <th className="py-2.5 px-4 text-center">{isAr ? "إجراء" : "Actions"}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(() => {
                                                const pendingGroups: { [key: string]: { name: string; phone: string; teamName: string; count: number; whishTransactionId: string; ticketIds: number[] } } = {};
                                                allTickets.filter(t => t.paymentStatus === "PENDING" && t.whishTransactionId).forEach(t => {
                                                    const groupKey = `${t.buyerPhone}-${t.whishTransactionId}`;
                                                    if (!pendingGroups[groupKey]) {
                                                        pendingGroups[groupKey] = {
                                                            name: t.buyerName,
                                                            phone: t.buyerPhone,
                                                            teamName: t.team?.name || t.teamId,
                                                            count: 0,
                                                            whishTransactionId: t.whishTransactionId,
                                                            ticketIds: []
                                                        };
                                                    }
                                                    pendingGroups[groupKey].count++;
                                                    pendingGroups[groupKey].ticketIds.push(t.id);
                                                });

                                                return Object.values(pendingGroups).map((group, idx) => {
                                                    const isVerifying = group.ticketIds.some(id => verifyingIds.includes(id));
                                                    return (
                                                        <tr key={idx} className="border-b border-scout-beige-dark/20 hover:bg-white/90 transition text-xs">
                                                            <td className="py-3 px-4 font-bold text-scout-navy">{group.name}</td>
                                                            <td className="py-3 px-4">{group.phone}</td>
                                                            <td className="py-3 px-4">
                                                                <span className="bg-scout-navy/10 text-scout-navy font-bold px-1.5 py-0.5 rounded text-[10px]">
                                                                    {group.teamName}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4 text-center font-bold">{group.count}</td>
                                                            <td className="py-3 px-4 text-center font-black text-scout-green-light">${(group.count * 5).toFixed(2)}</td>
                                                            <td className="py-3 px-4 font-mono font-bold text-amber-600">{group.whishTransactionId}</td>
                                                            <td className="py-3 px-4 text-center">
                                                                <div className="flex items-center justify-center gap-1.5">
                                                                    <button
                                                                        onClick={() => handleVerifyTickets(group.ticketIds, "PAID")}
                                                                        disabled={isVerifying}
                                                                        className="px-2.5 py-1.5 bg-scout-green hover:bg-scout-green-light text-white text-[11px] font-bold rounded-lg transition disabled:opacity-50 cursor-pointer shadow-sm animate-pulse"
                                                                    >
                                                                        {isVerifying ? "..." : (isAr ? "تأكيد" : "Approve")}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleVerifyTickets(group.ticketIds, "REJECTED")}
                                                                        disabled={isVerifying}
                                                                        className="px-2.5 py-1.5 bg-red-800 hover:bg-red-700 text-white text-[11px] font-bold rounded-lg transition disabled:opacity-50 cursor-pointer shadow-sm"
                                                                    >
                                                                        {isVerifying ? "..." : (isAr ? "رفض" : "Reject")}
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                });
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 2. TEAMS CONFIG TAB */}
                {activeTab === "teams" && (
                    <div className="space-y-8 animate-in fade-in duration-200">
                        {/* Custom Team configuration & seed actions */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                            <button
                                onClick={handleSeedTeams}
                                className="px-4 py-2 bg-scout-navy hover:bg-scout-navy-light text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-sm"
                            >
                                ⚡ {isAr ? "تهيئة وتوزيع المنتخبات تلقائياً" : "Quick Auto Seed World Cup Teams"}
                            </button>
                            
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="px-4 py-2 bg-scout-gold text-scout-navy text-xs font-extrabold rounded-lg hover:bg-scout-gold-light transition cursor-pointer shadow-sm"
                            >
                                {isEditing
                                    ? (isAr ? "👁️ عرض الترتيب (قراءة فقط)" : "👁️ View Standings (Read-only)")
                                    : (isAr ? "✏️ تعديل الأهداف والترتيب" : "✏️ Edit Standings & Goals")}
                            </button>
                        </div>

                        {/* Add Custom Team Form */}
                        <div className="glass-panel p-6 rounded-2xl shadow-md bg-white/70">
                            <h2 className="text-md font-bold font-display text-scout-navy mb-4">
                                {isAr ? "إضافة منتخب جديد يدوياً" : "Add Custom Team"}
                            </h2>
                            <form onSubmit={handleAddTeam} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div>
                                    <label className="block text-[10px] font-bold text-scout-charcoal/60 uppercase mb-1">
                                        {isAr ? "رمز المنتخب (مثال: LBN)" : "Team Code (e.g. LBN)"}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={3}
                                        value={newTeamId}
                                        onChange={(e) => setNewTeamId(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border bg-white focus:outline-none focus:border-scout-navy text-xs uppercase"
                                        placeholder="LBN"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-scout-charcoal/60 uppercase mb-1">
                                        {isAr ? "اسم المنتخب" : "Team Name"}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newTeamName}
                                        onChange={(e) => setNewTeamName(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border bg-white focus:outline-none focus:border-scout-navy text-xs"
                                        placeholder="Lebanon"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-scout-charcoal/60 uppercase mb-1">
                                        {isAr ? "رابط العلم (URL)" : "Flag Image URL"}
                                    </label>
                                    <input
                                        type="url"
                                        required
                                        value={newTeamFlag}
                                        onChange={(e) => setNewTeamFlag(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border bg-white focus:outline-none focus:border-scout-navy text-xs"
                                        placeholder="https://flagcdn.com/lb.svg"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="py-2.5 bg-scout-navy hover:bg-scout-navy-light text-white font-semibold rounded-lg text-xs transition cursor-pointer"
                                >
                                    {isAr ? "إضافة المنتخب" : "Add Team"}
                                </button>
                            </form>
                        </div>

                        {/* Standings spread-sheet */}
                        <div className="glass-panel p-6 rounded-2xl shadow-md bg-white/70">
                            <div className="mb-4">
                                <input
                                    type="text"
                                    value={teamSearch}
                                    onChange={(e) => setTeamSearch(e.target.value)}
                                    placeholder={isAr ? "ابحث عن منتخب..." : "Search for a team..."}
                                    className="w-full max-w-sm px-4 py-2 rounded-lg border border-scout-beige-dark bg-white focus:outline-none focus:border-scout-navy text-xs shadow-sm"
                                />
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left border-collapse">
                                    <thead>
                                        <tr className="border-b text-scout-navy font-bold">
                                            <th className="py-3 px-4">{isAr ? "الترتيب / المنتخب" : "Standings"}</th>
                                            <th className="py-3 px-4 text-center">{isAr ? "إجمالي الانتصارات" : "Wins"}</th>
                                            <th className="py-3 px-4 text-center">{isAr ? "البطاقات لكل تذكرة" : "Entries"}</th>
                                            <th className="py-3 px-4 text-center">{isAr ? "الحالة" : "Status"}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            const sorted = [...teams].sort((a, b) => {
                                                if (b.totalWins !== a.totalWins) return b.totalWins - a.totalWins;
                                                return a.name.localeCompare(b.name);
                                            });

                                            return sorted
                                                .filter((t) =>
                                                    t.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
                                                    t.id.toLowerCase().includes(teamSearch.toLowerCase())
                                                )
                                                .map((t, idx) => {
                                                    const totalEntries = 1 + (t.totalWins || 0);
                                                    let statusLabel = isAr ? "نشط" : "Active";
                                                    let statusColor = "text-scout-green-light bg-scout-green/10";

                                                    if (t.isEliminated) {
                                                        statusLabel = isAr ? "مقصى" : "Eliminated";
                                                        statusColor = "text-scout-charcoal/50 bg-scout-charcoal/5";
                                                    }

                                                    return (
                                                        <tr key={t.id} className="border-b hover:bg-white/30 transition">
                                                            <td className="py-3 px-4 flex items-center gap-3">
                                                                <span className="font-bold text-scout-navy text-xs min-w-[20px]">
                                                                    #{idx + 1}
                                                                </span>
                                                                <img
                                                                    src={t.flagUrl}
                                                                    alt={t.name}
                                                                    className="w-8 h-5 object-cover rounded shadow-sm"
                                                                    onError={(e) => {
                                                                        (e.target as HTMLImageElement).src = "https://flagcdn.com/un.svg";
                                                                    }}
                                                                />
                                                                <div>
                                                                    <span className="font-bold text-scout-navy block leading-none text-xs">{t.name}</span>
                                                                    <span className="text-[10px] text-scout-charcoal/50">{t.id}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-4 text-center">
                                                                {isEditing ? (
                                                                    <div className="inline-flex items-center gap-2">
                                                                        <button
                                                                            onClick={() => handleUpdateTeam(t.id, { totalWins: Math.max(0, t.totalWins - 1) })}
                                                                            className="w-6 h-6 rounded bg-scout-beige-dark/50 hover:bg-scout-beige-dark font-bold text-xs"
                                                                        >
                                                                            -
                                                                        </button>
                                                                        <span className="w-8 font-extrabold text-scout-navy">{t.totalWins}</span>
                                                                        <button
                                                                            onClick={() => handleUpdateTeam(t.id, { totalWins: t.totalWins + 1 })}
                                                                            className="w-6 h-6 rounded bg-scout-beige-dark/50 hover:bg-scout-beige-dark font-bold text-xs"
                                                                        >
                                                                            +
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <span className="font-extrabold text-scout-navy">{t.totalWins}</span>
                                                                )}
                                                            </td>
                                                            <td className="py-3 px-4 text-center font-black text-scout-green-light">
                                                                {totalEntries}
                                                            </td>
                                                            <td className="py-3 px-4 text-center">
                                                                {isEditing ? (
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={t.isEliminated}
                                                                        onChange={(e) => handleUpdateTeam(t.id, { isEliminated: e.target.checked })}
                                                                        className="w-4 h-4 rounded text-scout-navy accent-scout-navy focus:ring-scout-navy cursor-pointer"
                                                                    />
                                                                ) : (
                                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor}`}>
                                                                        {statusLabel}
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                });
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. TICKET REPORTS TAB */}
                {activeTab === "reporting" && (() => {
                    const getTicketEntries = (ticket: any) => {
                        if (!ticket.team) return 1;
                        return 1 + (ticket.team.totalWins || 0);
                    };

                    const filtered = allTickets.filter((ticket) => {
                        const q = ticketSearchQuery.toLowerCase();
                        const matchesSearch = 
                            ticket.buyerName.toLowerCase().includes(q) ||
                            ticket.buyerPhone.toLowerCase().includes(q) ||
                            (ticket.id && String(ticket.id).includes(q));

                        const matchesMethod = filterPaymentMethods.length === 0 || filterPaymentMethods.includes(ticket.paymentMethod);
                        const matchesStatus = filterStatuses.length === 0 || filterStatuses.includes(ticket.paymentStatus);
                        
                        const tScoutId = ticket.scoutId || "PUBLIC";
                        const matchesScout = filterScoutIds.length === 0 || filterScoutIds.includes(tScoutId);
                        const matchesTeam = filterTeamIds.length === 0 || filterTeamIds.includes(ticket.teamId);

                        return matchesSearch && matchesMethod && matchesStatus && matchesScout && matchesTeam;
                    });

                    return (
                        <div className="space-y-6 animate-in fade-in duration-200 bg-white/70 p-6 rounded-2xl shadow-md">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
                            <div>
                                <h2 className="text-lg font-bold font-display text-scout-navy">
                                    {isAr ? "سجل وإحصاءات التذاكر" : "Ticket Sales & Grouping Stats"}
                                </h2>
                                <p className="text-xs text-scout-charcoal/60 mt-0.5">
                                    {isAr ? "استعلم عن مبيعات التذاكر، إجمالي الفرص، وجمعها حسب الفئات" : "Analyze sales log, raffle entry counts, and group records dynamically."}
                                </p>
                            </div>

                        </div>

                        {/* Control Panel: Search & Custom Dropdown Filter Settings */}
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="w-full sm:max-w-md">
                                <input
                                    type="text"
                                    value={ticketSearchQuery}
                                    onChange={(e) => setTicketSearchQuery(e.target.value)}
                                    placeholder={isAr ? "ابحث باسم المشتري، رقم الهاتف، أو رقم التذكرة..." : "Search by buyer name, phone, or ticket #..."}
                                    className="w-full px-4 py-2 rounded-lg border border-scout-beige-dark bg-white text-xs focus:outline-none focus:border-scout-navy shadow-sm"
                                />
                            </div>

                            <div className="relative w-full sm:w-auto flex flex-wrap gap-2 items-center justify-end">
                                <button
                                    type="button"
                                    onClick={() => handleExportCSV(filtered)}
                                    className="px-4 py-2 bg-scout-green hover:bg-scout-green-light text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
                                >
                                    📥 {isAr ? "تصدير CSV" : "Export CSV"}
                                </button>

                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        type="button"
                                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-scout-navy hover:bg-scout-navy-light text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
                                    >
                                        <span>⚙️</span>
                                        <span>{isAr ? "خيارات التصفية والتجميع" : "Filters & Grouping"}</span>
                                        {(filterPaymentMethods.length > 0 || filterStatuses.length > 0 || filterScoutIds.length > 0 || filterTeamIds.length > 0 || groupBy !== "none") && (
                                            <span className="w-2 h-2 rounded-full bg-scout-gold animate-pulse" />
                                        )}
                                    </button>

                                    {showFilterDropdown && (
                                        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-scout-beige-dark p-4 z-50 space-y-4 text-xs">
                                            <div className="flex justify-between items-center border-b pb-2">
                                                <span className="font-bold text-scout-navy">{isAr ? "تصفية وتجميع متقدم" : "Advanced Settings"}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFilterPaymentMethods([]);
                                                        setFilterStatuses([]);
                                                        setFilterScoutIds([]);
                                                        setFilterTeamIds([]);
                                                        setGroupBy("none");
                                                    }}
                                                    className="text-[10px] text-red-500 hover:underline font-bold cursor-pointer"
                                                >
                                                    {isAr ? "إعادة ضبط" : "Reset All"}
                                                </button>
                                            </div>

                                            {/* Filter by Scout */}
                                            <div className="space-y-1">
                                                <label className="block font-bold text-scout-charcoal/70">{isAr ? "تصفية حسب الكشاف:" : "Filter by Scout:"}</label>
                                                <div className="max-h-28 overflow-y-auto border border-scout-beige-dark bg-white rounded p-1.5 space-y-1">
                                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                                        <input
                                                            type="checkbox"
                                                            checked={filterScoutIds.includes("PUBLIC")}
                                                            onChange={() => {
                                                                if (filterScoutIds.includes("PUBLIC")) {
                                                                    setFilterScoutIds(filterScoutIds.filter(id => id !== "PUBLIC"));
                                                                } else {
                                                                    setFilterScoutIds([...filterScoutIds, "PUBLIC"]);
                                                                }
                                                            }}
                                                            className="w-3.5 h-3.5 rounded text-scout-navy accent-scout-navy cursor-pointer"
                                                        />
                                                        <span className="text-[10px] font-bold text-scout-gold">{isAr ? "شراء عام (أونلاين)" : "Public / Online Purchase"}</span>
                                                    </label>
                                                    {scoutsList.map((s) => {
                                                        const checked = filterScoutIds.includes(s.id);
                                                        return (
                                                            <label key={s.id} className="flex items-center gap-2 cursor-pointer select-none">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={checked}
                                                                    onChange={() => {
                                                                        if (checked) {
                                                                            setFilterScoutIds(filterScoutIds.filter(id => id !== s.id));
                                                                        } else {
                                                                            setFilterScoutIds([...filterScoutIds, s.id]);
                                                                        }
                                                                    }}
                                                                    className="w-3.5 h-3.5 rounded text-scout-navy accent-scout-navy cursor-pointer"
                                                                />
                                                                <span className="text-[10px]">{s.fullName}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Filter by Team */}
                                            <div className="space-y-1">
                                                <label className="block font-bold text-scout-charcoal/70">{isAr ? "تصفية حسب المنتخب:" : "Filter by Team:"}</label>
                                                <div className="max-h-28 overflow-y-auto border border-scout-beige-dark bg-white rounded p-1.5 space-y-1">
                                                    {teams.map((t) => {
                                                        const checked = filterTeamIds.includes(t.id);
                                                        return (
                                                            <label key={t.id} className="flex items-center gap-2 cursor-pointer select-none">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={checked}
                                                                    onChange={() => {
                                                                        if (checked) {
                                                                            setFilterTeamIds(filterTeamIds.filter(id => id !== t.id));
                                                                        } else {
                                                                            setFilterTeamIds([...filterTeamIds, t.id]);
                                                                        }
                                                                    }}
                                                                    className="w-3.5 h-3.5 rounded text-scout-navy accent-scout-navy cursor-pointer"
                                                                />
                                                                <span className="text-[10px]">{t.name}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Filter by Payment Method */}
                                            <div className="space-y-1">
                                                <label className="block font-bold text-scout-charcoal/70">{isAr ? "طريقة الدفع:" : "Payment Methods:"}</label>
                                                <div className="border border-scout-beige-dark bg-white rounded p-1.5 space-y-1">
                                                    {["CASH", "WHISH"].map((m) => {
                                                        const checked = filterPaymentMethods.includes(m);
                                                        return (
                                                            <label key={m} className="flex items-center gap-2 cursor-pointer select-none">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={checked}
                                                                    onChange={() => {
                                                                        if (checked) {
                                                                            setFilterPaymentMethods(filterPaymentMethods.filter(item => item !== m));
                                                                        } else {
                                                                            setFilterPaymentMethods([...filterPaymentMethods, m]);
                                                                        }
                                                                    }}
                                                                    className="w-3.5 h-3.5 rounded text-scout-navy accent-scout-navy cursor-pointer"
                                                                />
                                                                <span className="text-[10px]">{m === "WHISH" ? (isAr ? "ويش (Whish)" : "Whish") : (isAr ? "نقدي (Cash)" : "Cash")}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Filter by Status */}
                                            <div className="space-y-1">
                                                <label className="block font-bold text-scout-charcoal/70">{isAr ? "حالة الدفع:" : "Payment Statuses:"}</label>
                                                <div className="border border-scout-beige-dark bg-white rounded p-1.5 space-y-1">
                                                    {["PAID", "PENDING", "REJECTED"].map((st) => {
                                                        const checked = filterStatuses.includes(st);
                                                        return (
                                                            <label key={st} className="flex items-center gap-2 cursor-pointer select-none">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={checked}
                                                                    onChange={() => {
                                                                        if (checked) {
                                                                            setFilterStatuses(filterStatuses.filter(item => item !== st));
                                                                        } else {
                                                                            setFilterStatuses([...filterStatuses, st]);
                                                                        }
                                                                    }}
                                                                    className="w-3.5 h-3.5 rounded text-scout-navy accent-scout-navy cursor-pointer"
                                                                />
                                                                <span className="text-[10px]">
                                                                    {st === "PAID" ? (isAr ? "مؤكد (PAID)" : "PAID") : st === "PENDING" ? (isAr ? "غير مؤكد / معلق" : "UNPAID / PENDING") : (isAr ? "مرفوض (REJECTED)" : "REJECTED")}
                                                                </span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Group By */}
                                            <div className="space-y-1">
                                                <label className="block font-bold text-scout-charcoal/70">{isAr ? "تجميع حسب:" : "Group By:"}</label>
                                                <select
                                                    value={groupBy}
                                                    onChange={(e) => setGroupBy(e.target.value as any)}
                                                    className="w-full px-2.5 py-1.5 rounded-md border border-scout-beige-dark bg-white focus:outline-none focus:border-scout-navy"
                                                >
                                                    <option value="none">{isAr ? "بدون تجميع" : "None (Individual Tickets)"}</option>
                                                    <option value="buyer">{isAr ? "المشتري" : "Buyer Name/Phone"}</option>
                                                    <option value="scout">{isAr ? "الكشاف" : "Scout"}</option>
                                                    <option value="country">{isAr ? "البلد / المنتخب" : "Country / Team"}</option>
                                                    <option value="paymentMethod">{isAr ? "طريقة الدفع" : "Payment Method"}</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Grouping Render logic */}
                        <div className="overflow-x-auto">
                            {(() => {
                                if (groupBy === "none") {
                                    return (
                                        <table className="w-full text-xs text-left border-collapse">
                                            <thead>
                                                <tr className="border-b text-scout-navy font-bold">
                                                    <th className="py-3 px-4">{isAr ? "رقم التذكرة" : "Ticket #"}</th>
                                                    <th className="py-3 px-4">{isAr ? "اسم الكشاف" : "Scout Name"}</th>
                                                    <th className="py-3 px-4">{isAr ? "اسم المشتري" : "Buyer Name"}</th>
                                                    <th className="py-3 px-4">{isAr ? "رقم الهاتف" : "Phone"}</th>
                                                    <th className="py-3 px-4">{isAr ? "المنتخب المختار" : "Selected Team"}</th>
                                                    <th className="py-3 px-4 text-center">{isAr ? "عدد البطاقات بالسحب" : "Raffle Entries"}</th>
                                                    <th className="py-3 px-4 text-center">{isAr ? "طريقة الدفع" : "Payment Method"}</th>
                                                    <th className="py-3 px-4 text-center">{isAr ? "معرف المعاملة" : "Transaction ID"}</th>
                                                    <th className="py-3 px-4 text-center">{isAr ? "التاريخ" : "Purchase Date"}</th>
                                                    <th className="py-3 px-4 text-center">{isAr ? "الحالة" : "Status"}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filtered.map((ticket) => (
                                                    <tr key={ticket.id} className="border-b hover:bg-white/30 transition">
                                                        <td className="py-3 px-4 font-bold text-scout-gold">
                                                            #{ticket.id}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            {ticket.scout?.fullName
                                                                ? `${ticket.scout.fullName}${ticket.paymentMethod === "WHISH" ? (isAr ? " (ويش)" : " (Whish)") : ""}`
                                                                : (ticket.paymentMethod === "WHISH" ? (isAr ? "شراء أونلاين (Whish)" : "Online (Whish)") : (isAr ? "شراء عام" : "Public Purchase"))}
                                                        </td>
                                                        <td className="py-3 px-4 font-semibold text-scout-navy text-xs">
                                                            {ticket.buyerName}
                                                        </td>
                                                        <td className="py-3 px-4 text-xs">
                                                            {ticket.buyerPhone}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className="bg-scout-navy/10 text-scout-navy text-[10px] font-bold px-2 py-1 rounded">
                                                                {ticket.team?.name || ticket.teamId}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-center font-bold text-scout-green-light">
                                                            {getTicketEntries(ticket)}
                                                        </td>
                                                        <td className="py-3 px-4 text-center text-xs font-semibold">
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                                ticket.paymentMethod === "WHISH" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
                                                            }`}>
                                                                {ticket.paymentMethod}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-center text-xs text-scout-charcoal font-mono">
                                                            {ticket.whishTransactionId || "-"}
                                                        </td>
                                                        <td className="py-3 px-4 text-center text-xs text-scout-charcoal/60" suppressHydrationWarning>
                                                            {formatLocalDate(ticket.createdAt)}
                                                        </td>
                                                        <td className="py-3 px-4 text-center text-xs font-semibold">
                                                            {ticket.paymentStatus === "PAID" ? (
                                                                <span className="bg-scout-green/10 text-scout-green-light px-2 py-0.5 rounded-full">
                                                                    {isAr ? "مؤكد" : "PAID"}
                                                                </span>
                                                            ) : ticket.paymentStatus === "REJECTED" ? (
                                                                <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full">
                                                                    {isAr ? "مرفوض" : "REJECTED"}
                                                                </span>
                                                            ) : (
                                                                <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full">
                                                                    {isAr ? "غير مؤكد" : "UNPAID"}
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {filtered.length === 0 && (
                                                    <tr>
                                                        <td colSpan={10} className="text-center py-6 text-xs text-scout-charcoal/50">
                                                            {isAr ? "لا توجد تذاكر مطابقة للبحث." : "No matching tickets found."}
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    );
                                }

                                if (groupBy === "buyer") {
                                    const buyerGroups: {
                                        [key: string]: { key: string; name: string; phone: string; ticketsCount: number; totalEntries: number; tickets: any[] };
                                    } = {};

                                    filtered.forEach((t) => {
                                        const key = t.buyerPhone.trim();
                                        if (!buyerGroups[key]) {
                                            buyerGroups[key] = {
                                                key,
                                                name: t.buyerName,
                                                phone: t.buyerPhone,
                                                ticketsCount: 0,
                                                totalEntries: 0,
                                                tickets: [],
                                            };
                                        }
                                        buyerGroups[key].ticketsCount++;
                                        buyerGroups[key].totalEntries += getTicketEntries(t);
                                        buyerGroups[key].tickets.push(t);
                                    });

                                    const sortedBuyers = Object.values(buyerGroups).sort((a, b) => b.totalEntries - a.totalEntries);

                                    return (
                                        <table className="w-full text-xs text-left border-collapse">
                                            <thead>
                                                <tr className="border-b text-scout-navy font-bold">
                                                    <th className="py-3 px-4 w-10"></th>
                                                    <th className="py-3 px-4">{isAr ? "اسم المشتري" : "Buyer Name"}</th>
                                                    <th className="py-3 px-4">{isAr ? "رقم الهاتف" : "Phone"}</th>
                                                    <th className="py-3 px-4 text-center">{isAr ? "عدد التذاكر المشتراة" : "Tickets Bought"}</th>
                                                    <th className="py-3 px-4 text-center">{isAr ? "إجمالي بطاقات السحب" : "Total Raffle Entries"}</th>
                                                    <th className="py-3 px-4">{isAr ? "المنتخبات المختارة" : "Selected Teams"}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sortedBuyers.map((buyer, idx) => {
                                                    const isExpanded = expandedGroups[buyer.key];
                                                    return (
                                                        <React.Fragment key={idx}>
                                                            <tr
                                                                className="border-b hover:bg-white/30 transition cursor-pointer select-none"
                                                                onClick={() => toggleGroup(buyer.key)}
                                                            >
                                                                <td className="py-3 px-4 text-center text-scout-navy font-bold text-[10px]">
                                                                    {isExpanded ? "▼" : "▶"}
                                                                </td>
                                                                <td className="py-3 px-4 font-semibold text-scout-navy text-xs">
                                                                    {buyer.name}
                                                                </td>
                                                                <td className="py-3 px-4 text-xs">
                                                                    {buyer.phone}
                                                                </td>
                                                                <td className="py-3 px-4 text-center font-bold text-scout-navy">
                                                                    {buyer.ticketsCount}
                                                                </td>
                                                                <td className="py-3 px-4 text-center font-black text-scout-green-light">
                                                                    {buyer.totalEntries}
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {buyer.tickets.map((tk, tIdx) => (
                                                                            <span key={tIdx} className="bg-scout-navy/10 text-scout-navy text-[10px] font-bold px-1.5 py-0.5 rounded" title={`Ticket #${tk.id}`}>
                                                                                {tk.team?.name || tk.teamId}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            {isExpanded && (
                                                                <tr className="bg-scout-beige-dark/10">
                                                                    <td colSpan={6} className="py-3 px-8">
                                                                        <div className="rounded-xl bg-white/80 p-4 border border-scout-beige-dark/30 shadow-inner space-y-2">
                                                                            <table className="w-full text-[11px] text-left border-collapse">
                                                                                <thead>
                                                                                    <tr className="text-scout-charcoal/70 font-semibold border-b border-scout-beige-dark/20">
                                                                                        <th className="py-1.5 px-2">{isAr ? "رقم التذكرة" : "Ticket #"}</th>
                                                                                        <th className="py-1.5 px-2">{isAr ? "المنتخب المختار" : "Selected Team"}</th>
                                                                                        <th className="py-1.5 px-2 text-center">{isAr ? "انتصارات الفريق" : "Team Wins"}</th>
                                                                                        <th className="py-1.5 px-2 text-center">{isAr ? "بطاقات السحب" : "Raffle Entries"}</th>
                                                                                        <th className="py-1.5 px-2">{isAr ? "الكشاف" : "Scout"}</th>
                                                                                        <th className="py-1.5 px-2">{isAr ? "تاريخ الشراء" : "Purchase Date"}</th>
                                                                                        <th className="py-1.5 px-2 text-center">{isAr ? "الحالة" : "Status"}</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {buyer.tickets.map((tk) => (
                                                                                        <tr key={tk.id} className="border-b border-scout-beige-dark/10 last:border-b-0 hover:bg-white/40">
                                                                                            <td className="py-1.5 px-2 font-bold text-scout-gold">#{tk.id}</td>
                                                                                            <td className="py-1.5 px-2 font-semibold text-scout-navy">{tk.team?.name || tk.teamId}</td>
                                                                                            <td className="py-1.5 px-2 text-center text-scout-charcoal">{tk.team?.totalWins || 0}</td>
                                                                                            <td className="py-1.5 px-2 text-center font-bold text-scout-green-light">{getTicketEntries(tk)}</td>
                                                                                            <td className="py-1.5 px-2 text-scout-charcoal/80">{tk.scout?.fullName ? `${tk.scout.fullName}${tk.paymentMethod === "WHISH" ? (isAr ? " (ويش)" : " (Whish)") : ""}` : (tk.paymentMethod === "WHISH" ? (isAr ? "شراء أونلاين (Whish)" : "Online (Whish)") : (isAr ? "شراء عام" : "Public Purchase"))}</td>
                                                                                            <td className="py-1.5 px-2 text-scout-charcoal/60" suppressHydrationWarning>{formatLocalDate(tk.createdAt)}</td>
                                                                                            <td className="py-1.5 px-2 text-center text-xs">
                                                                                                {tk.paymentStatus === "PAID" ? (
                                                                                                    <span className="text-scout-green-light">{isAr ? "مؤكد" : "PAID"}</span>
                                                                                                ) : (
                                                                                                    <span className="text-red-500">{isAr ? "غير مؤكد" : "UNPAID"}</span>
                                                                                                )}
                                                                                            </td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    );
                                }

                                if (groupBy === "scout") {
                                    const scoutGroups: {
                                        [key: string]: { name: string; ticketsCount: number; totalEntries: number; tickets: any[] };
                                    } = {};

                                    filtered.forEach((t) => {
                                        const sName = t.scout?.fullName ? `${t.scout.fullName}${t.paymentMethod === "WHISH" ? (isAr ? " (ويش)" : " (Whish)") : ""}` : (t.paymentMethod === "WHISH" ? (isAr ? "شراء أونلاين (Whish)" : "Online (Whish)") : (isAr ? "شراء عام" : "Public Purchase"));
                                        if (!scoutGroups[sName]) {
                                            scoutGroups[sName] = {
                                                name: sName,
                                                ticketsCount: 0,
                                                totalEntries: 0,
                                                tickets: [],
                                            };
                                        }
                                        scoutGroups[sName].ticketsCount++;
                                        scoutGroups[sName].totalEntries += getTicketEntries(t);
                                        scoutGroups[sName].tickets.push(t);
                                    });

                                    const sortedScouts = Object.values(scoutGroups).sort((a, b) => b.ticketsCount - a.ticketsCount);

                                    return (
                                        <table className="w-full text-xs text-left border-collapse">
                                            <thead>
                                                <tr className="border-b text-scout-navy font-bold">
                                                    <th className="py-3 px-4 w-10"></th>
                                                    <th className="py-3 px-4">{isAr ? "اسم الكشاف" : "Scout Name"}</th>
                                                    <th className="py-3 px-4 text-center">{isAr ? "التذاكر المباعة" : "Tickets Sold"}</th>
                                                    <th className="py-3 px-4 text-center">{isAr ? "إجمالي بطاقات السحب للمشترين" : "Total Raffle Entries Generated"}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sortedScouts.map((scout, idx) => {
                                                    const isExpanded = expandedGroups[scout.name];
                                                    return (
                                                        <React.Fragment key={idx}>
                                                            <tr
                                                                className="border-b hover:bg-white/30 transition cursor-pointer select-none"
                                                                onClick={() => toggleGroup(scout.name)}
                                                            >
                                                                <td className="py-3 px-4 text-center text-scout-navy font-bold text-[10px]">
                                                                    {isExpanded ? "▼" : "▶"}
                                                                </td>
                                                                <td className="py-3 px-4 font-semibold text-scout-navy text-xs">
                                                                    {scout.name}
                                                                </td>
                                                                <td className="py-3 px-4 text-center font-bold text-scout-navy">
                                                                    {scout.ticketsCount}
                                                                </td>
                                                                <td className="py-3 px-4 text-center font-black text-scout-green-light">
                                                                    {scout.totalEntries}
                                                                </td>
                                                            </tr>
                                                            {isExpanded && (
                                                                <tr className="bg-scout-beige-dark/10">
                                                                    <td colSpan={4} className="py-3 px-8">
                                                                        <div className="rounded-xl bg-white/80 p-4 border border-scout-beige-dark/30 shadow-inner space-y-2">
                                                                            <table className="w-full text-[11px] text-left border-collapse">
                                                                                <thead>
                                                                                    <tr className="text-scout-charcoal/70 font-semibold border-b border-scout-beige-dark/20">
                                                                                        <th className="py-1.5 px-2">{isAr ? "رقم التذكرة" : "Ticket #"}</th>
                                                                                        <th className="py-1.5 px-2">{isAr ? "اسم المشتري" : "Buyer Name"}</th>
                                                                                        <th className="py-1.5 px-2">{isAr ? "الهاتف" : "Phone"}</th>
                                                                                        <th className="py-1.5 px-2">{isAr ? "المنتخب المختار" : "Selected Team"}</th>
                                                                                        <th className="py-1.5 px-2 text-center">{isAr ? "بطاقات السحب" : "Raffle Entries"}</th>
                                                                                        <th className="py-1.5 px-2">{isAr ? "تاريخ الشراء" : "Purchase Date"}</th>
                                                                                        <th className="py-1.5 px-2 text-center">{isAr ? "الحالة" : "Status"}</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {scout.tickets.map((tk) => (
                                                                                        <tr key={tk.id} className="border-b border-scout-beige-dark/10 last:border-b-0 hover:bg-white/40">
                                                                                            <td className="py-1.5 px-2 font-bold text-scout-gold">#{tk.id}</td>
                                                                                            <td className="py-1.5 px-2 font-semibold text-scout-navy">{tk.buyerName}</td>
                                                                                            <td className="py-1.5 px-2 text-scout-charcoal">{tk.buyerPhone}</td>
                                                                                            <td className="py-1.5 px-2 font-semibold text-scout-navy">{tk.team?.name || tk.teamId}</td>
                                                                                            <td className="py-1.5 px-2 text-center font-bold text-scout-green-light">{getTicketEntries(tk)}</td>
                                                                                            <td className="py-1.5 px-2 text-scout-charcoal/60" suppressHydrationWarning>{formatLocalDate(tk.createdAt)}</td>
                                                                                            <td className="py-1.5 px-2 text-center text-xs font-semibold">
                                                                                                {tk.paymentStatus === "PAID" ? (
                                                                                                    <span className="text-scout-green-light">{isAr ? "مؤكد" : "PAID"}</span>
                                                                                                ) : tk.paymentStatus === "REJECTED" ? (
                                                                                                    <span className="text-red-500">{isAr ? "مرفوض" : "REJECTED"}</span>
                                                                                                ) : (
                                                                                                    <span className="text-red-500">{isAr ? "غير مؤكد" : "UNPAID"}</span>
                                                                                                )}
                                                                                            </td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    );
                                }

                                if (groupBy === "country") {
                                    const countryGroups: {
                                        [key: string]: { name: string; flagUrl: string; ticketsCount: number; totalWins: number; totalEntries: number; tickets: any[] };
                                    } = {};

                                    filtered.forEach((t) => {
                                        const teamName = t.team?.name || t.teamId;
                                        const flagUrl = t.team?.flagUrl || "";
                                        if (!countryGroups[teamName]) {
                                            countryGroups[teamName] = {
                                                name: teamName,
                                                flagUrl,
                                                ticketsCount: 0,
                                                totalWins: t.team?.totalWins || 0,
                                                totalEntries: 0,
                                                tickets: [],
                                            };
                                        }
                                        countryGroups[teamName].ticketsCount++;
                                        countryGroups[teamName].totalEntries += getTicketEntries(t);
                                        countryGroups[teamName].tickets.push(t);
                                    });

                                    const sortedCountries = Object.values(countryGroups).sort((a, b) => b.ticketsCount - a.ticketsCount);

                                    return (
                                        <table className="w-full text-xs text-left border-collapse">
                                            <thead>
                                                <tr className="border-b text-scout-navy font-bold">
                                                    <th className="py-3 px-4 w-10"></th>
                                                    <th className="py-3 px-4">{isAr ? "المنتخب" : "Team / Country"}</th>
                                                    <th className="py-3 px-4 text-center">{isAr ? "التذاكر المباعة لهذا المنتخب" : "Tickets Sold"}</th>
                                                    <th className="py-3 px-4 text-center">{isAr ? "الانتصارات" : "Wins"}</th>
                                                    <th className="py-3 px-4 text-center">{isAr ? "إجمالي بطاقات السحب" : "Total Raffle Entries"}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sortedCountries.map((country, idx) => {
                                                    const isExpanded = expandedGroups[country.name];
                                                    return (
                                                        <React.Fragment key={idx}>
                                                            <tr
                                                                className="border-b hover:bg-white/30 transition cursor-pointer select-none"
                                                                onClick={() => toggleGroup(country.name)}
                                                            >
                                                                <td className="py-3 px-4 text-center text-scout-navy font-bold text-[10px]">
                                                                    {isExpanded ? "▼" : "▶"}
                                                                </td>
                                                                <td className="py-3 px-4 flex items-center gap-3">
                                                                    <img
                                                                        src={country.flagUrl}
                                                                        alt={country.name}
                                                                        className="w-8 h-5 object-cover rounded shadow-sm"
                                                                        onError={(e) => {
                                                                            (e.target as HTMLImageElement).src = "https://flagcdn.com/un.svg";
                                                                        }}
                                                                    />
                                                                    <span className="font-bold text-scout-navy text-xs">{country.name}</span>
                                                                </td>
                                                                <td className="py-3 px-4 text-center font-bold text-scout-navy">
                                                                    {country.ticketsCount}
                                                                </td>
                                                                <td className="py-3 px-4 text-center text-scout-charcoal">
                                                                    {country.totalWins}
                                                                </td>
                                                                <td className="py-3 px-4 text-center font-black text-scout-green-light">
                                                                    {country.totalEntries}
                                                                </td>
                                                            </tr>
                                                            {isExpanded && (
                                                                <tr className="bg-scout-beige-dark/10">
                                                                    <td colSpan={5} className="py-3 px-8">
                                                                        <div className="rounded-xl bg-white/80 p-4 border border-scout-beige-dark/30 shadow-inner space-y-2">
                                                                            <table className="w-full text-[11px] text-left border-collapse">
                                                                                <thead>
                                                                                    <tr className="text-scout-charcoal/70 font-semibold border-b border-scout-beige-dark/20">
                                                                                        <th className="py-1.5 px-2">{isAr ? "رقم التذكرة" : "Ticket #"}</th>
                                                                                        <th className="py-1.5 px-2">{isAr ? "اسم المشتري" : "Buyer Name"}</th>
                                                                                        <th className="py-1.5 px-2">{isAr ? "الهاتف" : "Phone"}</th>
                                                                                        <th className="py-1.5 px-2 text-center">{isAr ? "بطاقات السحب" : "Raffle Entries"}</th>
                                                                                        <th className="py-1.5 px-2">{isAr ? "تاريخ الشراء" : "Purchase Date"}</th>
                                                                                        <th className="py-1.5 px-2">{isAr ? "الكشاف" : "Scout"}</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {country.tickets.map((tk) => (
                                                                                        <tr key={tk.id} className="border-b border-scout-beige-dark/10 last:border-b-0 hover:bg-white/40">
                                                                                            <td className="py-1.5 px-2 font-bold text-scout-gold">#{tk.id}</td>
                                                                                            <td className="py-1.5 px-2 font-semibold text-scout-navy">{tk.buyerName}</td>
                                                                                            <td className="py-1.5 px-2 text-scout-charcoal">{tk.buyerPhone}</td>
                                                                                            <td className="py-1.5 px-2 text-center font-bold text-scout-green-light">{getTicketEntries(tk)}</td>
                                                                                            <td className="py-1.5 px-2 text-scout-charcoal/60" suppressHydrationWarning>{formatLocalDate(tk.createdAt)}</td>
                                                                                            <td className="py-1.5 px-2 text-scout-charcoal/80">{tk.scout?.fullName ? `${tk.scout.fullName}${tk.paymentMethod === "WHISH" ? (isAr ? " (ويش)" : " (Whish)") : ""}` : (tk.paymentMethod === "WHISH" ? (isAr ? "شراء أونلاين (Whish)" : "Online (Whish)") : (isAr ? "شراء عام" : "Public Purchase"))}</td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    );
                                }

                                if (groupBy === "paymentMethod") {
                                    const methodGroups: {
                                        [key: string]: { name: string; ticketsCount: number; totalEntries: number; tickets: any[] };
                                    } = {};

                                    filtered.forEach((t) => {
                                        const key = t.paymentMethod || "CASH";
                                        if (!methodGroups[key]) {
                                            methodGroups[key] = {
                                                name: key === "WHISH" ? (isAr ? "ويش (Whish)" : "Whish") : (isAr ? "نقدي (Cash)" : "Cash"),
                                                ticketsCount: 0,
                                                totalEntries: 0,
                                                tickets: [],
                                            };
                                        }
                                        methodGroups[key].ticketsCount++;
                                        methodGroups[key].totalEntries += getTicketEntries(t);
                                        methodGroups[key].tickets.push(t);
                                    });

                                    const sortedMethods = Object.values(methodGroups).sort((a, b) => b.ticketsCount - a.ticketsCount);

                                    return (
                                        <table className="w-full text-xs text-left border-collapse">
                                            <thead>
                                                <tr className="border-b text-scout-navy font-bold">
                                                    <th className="py-3 px-4 w-10"></th>
                                                    <th className="py-3 px-4">{isAr ? "طريقة الدفع" : "Payment Method"}</th>
                                                    <th className="py-3 px-4 text-center">{isAr ? "التذاكر المباعة" : "Tickets Sold"}</th>
                                                    <th className="py-3 px-4 text-center">{isAr ? "إجمالي بطاقات السحب للمشترين" : "Total Raffle Entries"}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sortedMethods.map((method, idx) => {
                                                    const isExpanded = expandedGroups[method.name];
                                                    return (
                                                        <React.Fragment key={idx}>
                                                            <tr
                                                                className="border-b hover:bg-white/30 transition cursor-pointer select-none"
                                                                onClick={() => toggleGroup(method.name)}
                                                            >
                                                                <td className="py-3 px-4 text-center text-scout-navy font-bold text-[10px]">
                                                                    {isExpanded ? "▼" : "▶"}
                                                                </td>
                                                                <td className="py-3 px-4 font-semibold text-scout-navy text-xs">
                                                                    {method.name}
                                                                </td>
                                                                <td className="py-3 px-4 text-center font-bold text-scout-navy">
                                                                    {method.ticketsCount}
                                                                </td>
                                                                <td className="py-3 px-4 text-center font-black text-scout-green-light">
                                                                    {method.totalEntries}
                                                                </td>
                                                            </tr>
                                                            {isExpanded && (
                                                                <tr className="bg-scout-beige-dark/10">
                                                                    <td colSpan={4} className="py-3 px-8">
                                                                        <div className="rounded-xl bg-white/80 p-4 border border-scout-beige-dark/30 shadow-inner space-y-2">
                                                                            <table className="w-full text-[11px] text-left border-collapse">
                                                                                <thead>
                                                                                    <tr className="text-scout-charcoal/70 font-semibold border-b border-scout-beige-dark/20">
                                                                                        <th className="py-1.5 px-2">{isAr ? "رقم التذكرة" : "Ticket #"}</th>
                                                                                        <th className="py-1.5 px-2">{isAr ? "اسم المشتري" : "Buyer Name"}</th>
                                                                                        <th className="py-1.5 px-2">{isAr ? "الهاتف" : "Phone"}</th>
                                                                                        <th className="py-1.5 px-2">{isAr ? "المنتخب المختار" : "Selected Team"}</th>
                                                                                        <th className="py-1.5 px-2 text-center">{isAr ? "بطاقات السحب" : "Raffle Entries"}</th>
                                                                                        <th className="py-1.5 px-2">{isAr ? "الكشاف" : "Scout"}</th>
                                                                                        <th className="py-1.5 px-2">{isAr ? "معرف المعاملة" : "Transaction ID"}</th>
                                                                                        <th className="py-1.5 px-2">{isAr ? "تاريخ الشراء" : "Purchase Date"}</th>
                                                                                        <th className="py-1.5 px-2 text-center">{isAr ? "الحالة" : "Status"}</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {method.tickets.map((tk) => (
                                                                                        <tr key={tk.id} className="border-b border-scout-beige-dark/10 last:border-b-0 hover:bg-white/40">
                                                                                            <td className="py-1.5 px-2 font-bold text-scout-gold">#{tk.id}</td>
                                                                                            <td className="py-1.5 px-2 font-semibold text-scout-navy">{tk.buyerName}</td>
                                                                                            <td className="py-1.5 px-2 text-scout-charcoal">{tk.buyerPhone}</td>
                                                                                            <td className="py-1.5 px-2 font-semibold text-scout-navy">{tk.team?.name || tk.teamId}</td>
                                                                                            <td className="py-1.5 px-2 text-center font-bold text-scout-green-light">{getTicketEntries(tk)}</td>
                                                                                            <td className="py-1.5 px-2 text-scout-charcoal/80">{tk.scout?.fullName ? `${tk.scout.fullName}${tk.paymentMethod === "WHISH" ? (isAr ? " (ويش)" : " (Whish)") : ""}` : (tk.paymentMethod === "WHISH" ? (isAr ? "شراء أونلاين (Whish)" : "Online (Whish)") : (isAr ? "شراء عام" : "Public Purchase"))}</td>
                                                                                            <td className="py-1.5 px-2 text-scout-charcoal font-mono">{tk.whishTransactionId || "-"}</td>
                                                                                            <td className="py-1.5 px-2 text-scout-charcoal/60" suppressHydrationWarning>{formatLocalDate(tk.createdAt)}</td>
                                                                                            <td className="py-1.5 px-2 text-center text-xs font-semibold">
                                                                                                {tk.paymentStatus === "PAID" ? (
                                                                                                    <span className="text-scout-green-light">{isAr ? "مؤكد" : "PAID"}</span>
                                                                                                ) : tk.paymentStatus === "REJECTED" ? (
                                                                                                    <span className="text-red-500">{isAr ? "مرفوض" : "REJECTED"}</span>
                                                                                                ) : (
                                                                                                    <span className="text-red-500">{isAr ? "غير مؤكد" : "UNPAID"}</span>
                                                                                                )}
                                                                                            </td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    );
                                }

                                return null;
                            })()}
                        </div>
                    </div>
                    );
                })()}

                {/* 4. WHATSAPP LOGS TAB */}
                {activeTab === "logs" && (
                    <div className="space-y-6 animate-in fade-in duration-200 bg-white/70 p-6 rounded-2xl shadow-md">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
                            <div>
                                <h2 className="text-lg font-bold font-display text-scout-navy">
                                    {isAr ? "سجلات تسليم واتساب" : "WhatsApp Delivery Logs"}
                                </h2>
                                <p className="text-xs text-scout-charcoal/60 mt-0.5">
                                    {isAr ? "سجل لآخر 100 رسالة تم إرسالها ومحاولات التسليم الفاشلة." : "Displays the last 100 attempted notification messages and delivery outcomes."}
                                </p>
                            </div>
                            <button
                                onClick={() => handleRetryWhatsApp()}
                                disabled={retryingWhatsApp || failedLogsCount === 0}
                                className="px-4 py-2 bg-scout-navy hover:bg-scout-navy-light text-white text-xs font-bold rounded-lg transition disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                            >
                                {retryingWhatsApp ? (isAr ? "جاري الإرسال..." : "Syncing...") : (isAr ? `إعادة محاولة الرسائل الفاشلة (${failedLogsCount})` : `Retry Failed Messages (${failedLogsCount})`)}
                            </button>
                        </div>

                        {/* Logs table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left border-collapse">
                                <thead>
                                    <tr className="border-b text-scout-navy font-bold uppercase">
                                        <th className="py-3 px-4">{isAr ? "التاريخ والوقت" : "Date & Time"}</th>
                                        <th className="py-3 px-4">{isAr ? "رقم الهاتف" : "Recipient Phone"}</th>
                                        <th className="py-3 px-4">{isAr ? "محتوى الرسالة" : "Message Body"}</th>
                                        <th className="py-3 px-4 text-center">{isAr ? "الحالة" : "Status"}</th>
                                        <th className="py-3 px-4">{isAr ? "تفاصيل الخطأ" : "Error Details"}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {whatsAppLogs.map((log) => {
                                        const isFailed = log.status === "FAILED";
                                        const isSelected = selectedLogId === log.id;
                                        // Keep error message preview strictly 1 line
                                        const errorMsgLine = log.error ? log.error.split("\n")[0] : "-";
                                        
                                        return (
                                            <React.Fragment key={log.id}>
                                                <tr
                                                    className="border-b hover:bg-white/40 transition cursor-pointer select-none"
                                                    onClick={() => setSelectedLogId(isSelected ? null : log.id)}
                                                >
                                                    <td className="py-3 px-4 text-scout-charcoal/80" suppressHydrationWarning>
                                                        {formatLocalDate(log.createdAt)}
                                                    </td>
                                                    <td className="py-3 px-4 font-bold text-scout-navy">{log.phone}</td>
                                                    <td className="py-3 px-4 truncate max-w-[200px] text-scout-charcoal/80" title={log.body}>
                                                        {log.body}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                                            isFailed
                                                                ? "text-red-700 bg-red-100"
                                                                : "text-green-700 bg-green-100"
                                                        }`}>
                                                            {log.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-red-600 font-mono text-[10px] truncate max-w-[250px]" title={log.error || ""}>
                                                        {errorMsgLine}
                                                    </td>
                                                </tr>
                                                {/* Expanded Details section */}
                                                {isSelected && (
                                                    <tr className="bg-scout-beige-dark/10">
                                                        <td colSpan={5} className="py-3 px-8">
                                                            <div className="bg-white p-4 rounded-xl border border-scout-beige-dark/30 shadow-inner space-y-3">
                                                                <div>
                                                                    <h4 className="text-xs font-bold text-scout-navy uppercase mb-1">{isAr ? "محتوى الرسالة الكامل" : "Full Message Text"}</h4>
                                                                    <p className="text-xs bg-scout-beige/40 p-2.5 rounded-lg border text-scout-charcoal/90 whitespace-pre-wrap">{log.body}</p>
                                                                </div>
                                                                {log.error && (
                                                                    <div>
                                                                        <h4 className="text-xs font-bold text-red-700 uppercase mb-1">{isAr ? "تقرير الخطأ الكامل (WAHA Exception)" : "Complete Error Trace (WAHA Exception)"}</h4>
                                                                        <pre className="text-[10px] bg-red-50 p-2.5 rounded-lg border border-red-100 text-red-800 overflow-x-auto whitespace-pre-wrap font-mono">{log.error}</pre>
                                                                    </div>
                                                                )}
                                                                {isFailed && (
                                                                    <div className="flex justify-end pt-1">
                                                                        <button
                                                                            onClick={() => handleRetryWhatsApp(log.id)}
                                                                            className="px-3 py-1 bg-scout-navy hover:bg-scout-navy-light text-white text-[11px] font-bold rounded-lg transition"
                                                                        >
                                                                            {isAr ? "إعادة إرسال هذه الرسالة" : "Retry Send This Message"}
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                    {whatsAppLogs.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="text-center py-6 text-xs text-scout-charcoal/50">
                                                {isAr ? "لا توجد سجلات تسليم حالية." : "No delivery logs found."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 5. CREATE & UPDATE USERS TAB */}
                {activeTab === "users" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in fade-in duration-200">
                        {/* Users List Column */}
                        <div className="lg:col-span-2 bg-white/70 p-6 rounded-2xl shadow-md space-y-4">
                            <div>
                                <h2 className="text-md font-bold font-display text-scout-navy">
                                    {isAr ? "حسابات المستخدمين المسجلة" : "Registered User Accounts"}
                                </h2>
                                <p className="text-xs text-scout-charcoal/60 mt-0.5">
                                    {isAr ? "عرض وإدارة جميع الكشافين والمشرفين النشطين في النظام." : "View and manage all active scouts and administrator profiles."}
                                </p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left border-collapse">
                                    <thead>
                                        <tr className="border-b text-scout-navy font-bold uppercase">
                                            <th className="py-3 px-4">{isAr ? "الاسم الكامل" : "Full Name"}</th>
                                            <th className="py-3 px-4">{isAr ? "الفرقة" : "Unit"}</th>
                                            <th className="py-3 px-4">{isAr ? "البريد الإلكتروني" : "Email Address"}</th>
                                            <th className="py-3 px-4">{isAr ? "الدور" : "Role"}</th>
                                            <th className="py-3 px-4 text-right">{isAr ? "إجراءات" : "Actions"}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-8 text-center text-scout-charcoal/40">
                                                    {isAr ? "لا يوجد مستخدمون مسجلون حالياً." : "No registered users found."}
                                                </td>
                                            </tr>
                                        ) : (
                                            users.map((u) => (
                                                <tr key={u.id} className="border-b hover:bg-white/40 transition">
                                                    <td className="py-3 px-4 font-bold text-scout-navy">{u.fullName}</td>
                                                    <td className="py-3 px-4">
                                                        {u.unit ? (
                                                            <span className="bg-scout-gold/20 text-scout-navy border border-scout-gold/40 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">
                                                                {u.unit}
                                                            </span>
                                                        ) : (
                                                            <span className="text-scout-charcoal/40 font-semibold italic text-[11px]">-</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-scout-charcoal/80">{u.email}</td>
                                                    <td className="py-3 px-4">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                            u.role === "admin" 
                                                                ? "bg-amber-100 text-amber-800" 
                                                                : "bg-blue-100 text-blue-800"
                                                        }`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <button
                                                            onClick={() => startEditingUser(u)}
                                                            className="px-2.5 py-1 bg-scout-navy hover:bg-scout-navy-light text-white text-[11px] font-bold rounded transition cursor-pointer"
                                                        >
                                                            {isAr ? "تعديل" : "Edit"}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Form Column */}
                        <div className="lg:col-span-1 bg-white/70 p-6 rounded-2xl shadow-md space-y-6">
                            <div>
                                <h2 className="text-md font-bold font-display text-scout-navy">
                                    {editingUser 
                                        ? (isAr ? "تعديل حساب مستخدم" : "Edit User Account") 
                                        : (isAr ? "إنشاء حسابات جديدة" : "Provision User Account")
                                    }
                                </h2>
                                <p className="text-xs text-scout-charcoal/60 mt-0.5">
                                    {editingUser
                                        ? (isAr ? "تحديث معلومات الحساب المختار وكلمة المرور الخاصة به (اختياري)." : "Update selected user details and role. Password update is optional.")
                                        : (isAr ? "قم بإنشاء حسابات للكشافين أو المشرفين الجدد دون الحاجة لتسجيل الخروج." : "Register new scout/admin staff profiles without overriding your currently authenticated session.")
                                    }
                                </p>
                            </div>

                            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-scout-charcoal/60 uppercase mb-1">
                                        {isAr ? "الاسم الكامل" : "Full Name"}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newUserFullName}
                                        onChange={(e) => setNewUserFullName(e.target.value)}
                                        placeholder="e.g. John Doe"
                                        className="w-full px-3 py-2 rounded-lg border bg-white focus:outline-none focus:border-scout-navy text-xs"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-scout-charcoal/60 uppercase mb-1">
                                        {isAr ? "البريد الإلكتروني" : "Email Address"}
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={newUserEmail}
                                        onChange={(e) => setNewUserEmail(e.target.value)}
                                        placeholder="e.g. john@scout.org"
                                        className="w-full px-3 py-2 rounded-lg border bg-white focus:outline-none focus:border-scout-navy text-xs"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-scout-charcoal/60 uppercase mb-1 flex items-center justify-between">
                                        <span>{isAr ? "كلمة المرور" : "Password"}</span>
                                        {editingUser && <span className="normal-case text-[9px] text-scout-charcoal/40 font-normal">({isAr ? "اتركه فارغاً لعدم التغيير" : "leave empty to keep current"})</span>}
                                    </label>
                                    <input
                                        type="password"
                                        required={!editingUser}
                                        value={newUserPassword}
                                        onChange={(e) => setNewUserPassword(e.target.value)}
                                        placeholder={editingUser ? "••••••••" : "e.g. strongPassword123"}
                                        className="w-full px-3 py-2 rounded-lg border bg-white focus:outline-none focus:border-scout-navy text-xs"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-scout-charcoal/60 uppercase mb-1">
                                        {isAr ? "الدور الوظيفي" : "Role"}
                                    </label>
                                    <select
                                        value={newUserRole}
                                        onChange={(e) => setNewUserRole(e.target.value as any)}
                                        className="w-full px-3 py-2 rounded-lg border bg-white focus:outline-none focus:border-scout-navy text-xs"
                                    >
                                        <option value="scout">{isAr ? "كشاف (Scout)" : "Scout"}</option>
                                        <option value="admin">{isAr ? "مسؤول (Admin)" : "Admin"}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-scout-charcoal/60 uppercase mb-1">
                                        {isAr ? "الفرقة (Unit)" : "Scout Unit"}
                                    </label>
                                    <select
                                        value={newUserUnit}
                                        onChange={(e) => setNewUserUnit(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border bg-white focus:outline-none focus:border-scout-navy text-xs"
                                    >
                                        <option value="">{isAr ? "بلا فرقة" : "None / Admin"}</option>
                                        <option value="jouwele">jouwele</option>
                                        <option value="mounjidet">mounjidet</option>
                                        <option value="kechefe">kechefe</option>
                                        <option value="mourchidet">mourchidet</option>
                                        <option value="jaramiz">jaramiz</option>
                                        <option value="zaharat">zaharat</option>
                                        <option value="iyede">iyede</option>
                                    </select>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    {editingUser && (
                                        <button
                                            type="button"
                                            onClick={cancelEditingUser}
                                            className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-scout-navy text-xs font-bold rounded-lg transition cursor-pointer text-center"
                                        >
                                            {isAr ? "إلغاء" : "Cancel"}
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={creatingUser || updatingUser}
                                        className="flex-1 py-2.5 bg-scout-navy hover:bg-scout-navy-light text-white text-xs font-bold rounded-lg transition disabled:opacity-50 cursor-pointer shadow-sm"
                                    >
                                        {editingUser 
                                            ? (updatingUser ? (isAr ? "جاري التحديث..." : "Updating...") : (isAr ? "تحديث الحساب" : "Update Account"))
                                            : (creatingUser ? (isAr ? "جاري الإنشاء..." : "Creating...") : (isAr ? "إنشاء الحساب الجديد" : "Create User Account"))
                                        }
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* 6. LEADERBOARD TAB */}
                {activeTab === "leaderboard" && (
                    <div className="space-y-6 animate-in fade-in duration-200 bg-white/70 p-6 rounded-2xl shadow-md">
                        <div className="flex justify-between items-center border-b pb-4">
                            <div>
                                <h2 className="text-lg font-bold font-display text-scout-navy">
                                    {isAr ? "لوحة صدارة الكشافين" : "Scout Leaderboard"}
                                </h2>
                                <p className="text-xs text-scout-charcoal/60 mt-0.5">
                                    {isAr ? "ترتيب الكشافين بناءً على مبيعات التذاكر المؤكدة" : "Scout performance ranking based on confirmed ticket sales."}
                                </p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left border-collapse">
                                <thead>
                                    <tr className="border-b text-scout-navy font-bold uppercase">
                                        <th className="py-3 px-4 w-16 text-center">{isAr ? "الترتيب" : "Rank"}</th>
                                        <th className="py-3 px-4">{isAr ? "الاسم الكامل" : "Full Name"}</th>
                                        <th className="py-3 px-4 text-center">{isAr ? "التذاكر المؤكدة المباعة" : "Confirmed Tickets Sold"}</th>
                                        <th className="py-3 px-4 text-center">{isAr ? "المساهمة الإجمالية" : "Total Contribution"}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-scout-charcoal/40">
                                                {isAr ? "لا توجد بيانات حالياً." : "No leaderboard records found."}
                                            </td>
                                        </tr>
                                    ) : (
                                        leaderboard.map((item, idx) => {
                                            const rank = idx + 1;
                                            const rankBadge = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}`;
                                            return (
                                                <tr key={item.id} className="border-b hover:bg-white/40 transition">
                                                    <td className="py-3 px-4 text-center font-bold text-sm">
                                                        {rankBadge}
                                                    </td>
                                                    <td className="py-3 px-4 font-bold text-scout-navy text-xs">
                                                        <div className="flex items-center gap-1.5">
                                                            <span>{item.full_name}</span>
                                                            {item.tickets_count >= 50 && <span title="Legend Scout">👑</span>}
                                                            {item.tickets_count >= 25 && item.tickets_count < 50 && <span title="Gold Seller">🥇</span>}
                                                            {item.tickets_count >= 10 && item.tickets_count < 25 && <span title="Silver Seller">🥈</span>}
                                                            {item.tickets_count >= 5 && item.tickets_count < 10 && <span title="Bronze Seller">🥉</span>}
                                                            {item.tickets_count >= 1 && item.tickets_count < 5 && <span title="Rookie Seller">🏆</span>}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-center font-bold text-scout-charcoal">
                                                        {item.tickets_count}
                                                    </td>
                                                    <td className="py-3 px-4 text-center font-bold text-scout-green-light">
                                                        ${item.tickets_count * TICKET_PRICE} USD
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 7. TREASURY & CASH MANAGEMENT TAB */}
                {activeTab === "treasury" && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-bold text-scout-navy">💰 Treasury & Cash Management</h2>
                                <p className="text-sm text-scout-charcoal/60 mt-0.5">
                                    Track all cash collected by scouts. Select tickets and confirm handovers to keep records clean.
                                </p>
                            </div>
                            <button
                                onClick={loadTreasuryData}
                                disabled={loadingTreasury}
                                className="flex items-center gap-2 px-4 py-2 bg-scout-navy text-white rounded-xl text-sm font-semibold hover:bg-opacity-90 transition disabled:opacity-50"
                            >
                                {loadingTreasury ? "🔄 Loading..." : "🔄 Refresh"}
                            </button>
                        </div>

                        {/* Full Financial Overview — WHISH + CASH */}
                        {financialSummary && !loadingTreasury && (
                            <div className="space-y-3">
                                {/* Row 1: Revenue Overview */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    <div className="bg-gradient-to-br from-scout-navy/5 to-scout-navy/10 rounded-xl border border-scout-navy/15 shadow-sm p-3 sm:col-span-1 col-span-2 text-center">
                                        <div className="text-[10px] uppercase tracking-wider text-scout-charcoal/50 font-semibold mb-1">💰 Total Revenue (PAID)</div>
                                        <div className="text-2xl font-bold text-scout-navy">${financialSummary.totalRevenue}</div>
                                        <div className="text-[10px] text-scout-charcoal/40 mt-0.5">{financialSummary.cashPaidCount + financialSummary.whishPaidCount} tickets confirmed</div>
                                    </div>
                                    <div className="bg-purple-50 rounded-xl border border-purple-200 shadow-sm p-3 text-center">
                                        <div className="text-[10px] uppercase tracking-wider text-purple-600/70 font-semibold mb-1">💳 Whish Revenue</div>
                                        <div className="text-xl font-bold text-purple-700">${financialSummary.whishRevenue}</div>
                                        <div className="text-[10px] text-purple-500/60 mt-0.5">{financialSummary.whishPaidCount} tickets</div>
                                    </div>
                                    <div className="bg-scout-navy/5 rounded-xl border border-scout-navy/15 shadow-sm p-3 text-center">
                                        <div className="text-[10px] uppercase tracking-wider text-scout-charcoal/50 font-semibold mb-1">💵 Cash Revenue</div>
                                        <div className="text-xl font-bold text-scout-navy">${financialSummary.cashRevenue}</div>
                                        <div className="text-[10px] text-scout-charcoal/40 mt-0.5">{financialSummary.cashPaidCount} tickets</div>
                                    </div>
                                </div>

                                {/* Row 2: WHISH Pipeline */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-amber-50 rounded-xl border border-amber-200 shadow-sm p-3 text-center">
                                        <div className="text-[10px] uppercase tracking-wider text-amber-600/70 font-semibold mb-1">⏳ Whish Pending</div>
                                        <div className="text-xl font-bold text-amber-600">${financialSummary.whishPendingValue}</div>
                                        <div className="text-[10px] text-amber-500/60 mt-0.5">{financialSummary.whishPendingCount} awaiting verification</div>
                                    </div>
                                    <div className="bg-red-50 rounded-xl border border-red-200 shadow-sm p-3 text-center">
                                        <div className="text-[10px] uppercase tracking-wider text-red-500/70 font-semibold mb-1">❌ Whish Rejected</div>
                                        <div className="text-xl font-bold text-red-500">{financialSummary.whishRejectedCount}</div>
                                        <div className="text-[10px] text-red-400/60 mt-0.5">tickets rejected</div>
                                    </div>
                                    <div className="bg-blue-50 rounded-xl border border-blue-200 shadow-sm p-3 text-center">
                                        <div className="text-[10px] uppercase tracking-wider text-blue-600/70 font-semibold mb-1">📊 Settlement Rate</div>
                                        <div className="text-xl font-bold text-blue-600">{financialSummary.settlementRate}%</div>
                                        <div className="text-[10px] text-blue-500/60 mt-0.5">cash handed over</div>
                                    </div>
                                </div>

                                {/* Row 3: Cash Settlement */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-amber-50 rounded-xl border border-amber-200 shadow-sm p-3 text-center">
                                        <div className="text-[10px] uppercase tracking-wider text-amber-600/70 font-semibold mb-1">🕐 Cash Outstanding</div>
                                        <div className="text-xl font-bold text-amber-600">${financialSummary.cashOutstanding}</div>
                                        <div className="text-[10px] text-amber-500/60 mt-0.5">{financialSummary.cashPendingHandoverCount} tickets with scouts</div>
                                    </div>
                                    <div className="bg-green-50 rounded-xl border border-green-200 shadow-sm p-3 text-center">
                                        <div className="text-[10px] uppercase tracking-wider text-green-600/70 font-semibold mb-1">✅ Cash Settled</div>
                                        <div className="text-xl font-bold text-green-600">${financialSummary.cashSettledValue}</div>
                                        <div className="text-[10px] text-green-500/60 mt-0.5">{financialSummary.cashSettledCount} tickets handed over</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {loadingTreasury ? (
                            <div className="text-center py-16 text-scout-charcoal/40">Loading treasury data...</div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                {/* Scout Ledger Table — left panel */}
                                <div className="lg:col-span-2 bg-white/70 rounded-2xl shadow-md overflow-hidden">
                                    <div className="px-4 py-3 bg-scout-navy/5 border-b border-scout-navy/10">
                                        <h3 className="font-bold text-scout-navy text-sm">Scout Cash Ledger</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="bg-scout-navy/5 text-scout-charcoal/60 uppercase text-[10px] tracking-wider">
                                                    <th className="py-2 px-3 text-left">Scout</th>
                                                    <th className="py-2 px-3 text-right">Total</th>
                                                    <th className="py-2 px-3 text-right text-amber-600">Pending</th>
                                                    <th className="py-2 px-3 text-right text-green-600">Settled</th>
                                                    <th className="py-2 px-3"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {treasuryScouts.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="py-8 text-center text-scout-charcoal/40">
                                                            No cash ticket data found.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    treasuryScouts.map((scout: any) => (
                                                        <tr
                                                            key={scout.id}
                                                            className={`border-b transition cursor-pointer ${
                                                                selectedTreasuryScout?.id === scout.id
                                                                    ? "bg-scout-green-light/10 border-l-4 border-l-scout-green-light"
                                                                    : "hover:bg-white/60"
                                                            }`}
                                                            onClick={() => {
                                                                setSelectedTreasuryScout(scout);
                                                                setScoutTickets([]);
                                                                setScoutTicketsNextCursor(null);
                                                                setSelectedSettleTicketIds([]);
                                                                loadDrillDown(scout.id);
                                                            }}
                                                        >
                                                            <td className="py-2.5 px-3 font-semibold text-scout-navy">
                                                                <div>{scout.fullName}</div>
                                                                {scout.unit && (
                                                                    <span className="text-[10px] text-scout-charcoal/50 bg-scout-navy/5 px-1.5 py-0.5 rounded-full mt-0.5 inline-block">
                                                                        {scout.unit}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="py-2.5 px-3 text-right font-bold">${scout.totalCashCollected}</td>
                                                            <td className="py-2.5 px-3 text-right font-bold text-amber-600">
                                                                {scout.pendingCashHandover > 0 ? `$${scout.pendingCashHandover}` : "—"}
                                                            </td>
                                                            <td className="py-2.5 px-3 text-right font-bold text-green-600">
                                                                {scout.settledCash > 0 ? `$${scout.settledCash}` : "—"}
                                                            </td>
                                                            <td className="py-2.5 px-3 text-center">
                                                                {scout.pendingCashHandover > 0 && (
                                                                    <span className="w-2 h-2 inline-block rounded-full bg-amber-400"></span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                            {treasuryScouts.length > 0 && (
                                                <tfoot className="bg-scout-navy/5 text-xs font-bold border-t-2">
                                                    <tr>
                                                        <td className="py-2.5 px-3 text-scout-navy">TOTAL</td>
                                                        <td className="py-2.5 px-3 text-right">
                                                            ${treasuryScouts.reduce((s: number, sc: any) => s + sc.totalCashCollected, 0)}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-right text-amber-600">
                                                            ${treasuryScouts.reduce((s: number, sc: any) => s + sc.pendingCashHandover, 0)}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-right text-green-600">
                                                            ${treasuryScouts.reduce((s: number, sc: any) => s + sc.settledCash, 0)}
                                                        </td>
                                                        <td></td>
                                                    </tr>
                                                </tfoot>
                                            )}
                                        </table>
                                    </div>
                                </div>

                                {/* Right panel — drill-down for selected scout */}
                                <div className="lg:col-span-3">
                                    {!selectedTreasuryScout ? (
                                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-white/40 rounded-2xl border-2 border-dashed border-scout-navy/20 text-scout-charcoal/40 text-sm gap-2">
                                            <span className="text-4xl">👈</span>
                                            <span>Select a scout to view their cash tickets</span>
                                        </div>
                                    ) : (
                                        <div className="bg-white/70 rounded-2xl shadow-md overflow-hidden">
                                            {/* Scout header */}
                                            <div className="px-5 py-4 bg-gradient-to-r from-scout-navy/10 to-transparent border-b border-scout-navy/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div>
                                                    <h3 className="font-bold text-scout-navy">
                                                        {selectedTreasuryScout.fullName}
                                                        {selectedTreasuryScout.unit && (
                                                            <span className="ml-2 text-xs font-normal text-scout-charcoal/50 bg-scout-navy/10 px-2 py-0.5 rounded-full">
                                                                {selectedTreasuryScout.unit}
                                                            </span>
                                                        )}
                                                    </h3>
                                                    <div className="flex gap-4 mt-1 text-xs">
                                                        <span className="text-scout-charcoal/60">Total: <strong>${selectedTreasuryScout.totalCashCollected}</strong></span>
                                                        <span className="text-amber-600">Pending: <strong>${selectedTreasuryScout.pendingCashHandover}</strong></span>
                                                        <span className="text-green-600">Settled: <strong>${selectedTreasuryScout.settledCash}</strong></span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {selectedSettleTicketIds.length > 0 && (
                                                        <button
                                                            onClick={handleSettleCash}
                                                            disabled={settlingCash}
                                                            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition disabled:opacity-50"
                                                        >
                                                            {settlingCash ? "⏳ Settling..." : `✅ Confirm Handover (${selectedSettleTicketIds.length})`}
                                                        </button>
                                                    )}
                                                    {scoutTickets.filter((t: any) => !t.cashSettled).length > 0 && (
                                                        <button
                                                            onClick={() => {
                                                                const pendingIds = scoutTickets
                                                                    .filter((t: any) => !t.cashSettled)
                                                                    .map((t: any) => t.id);
                                                                setSelectedSettleTicketIds(pendingIds);
                                                            }}
                                                            className="flex items-center gap-1 px-3 py-2 bg-amber-100 text-amber-800 rounded-xl text-xs font-semibold hover:bg-amber-200 transition"
                                                        >
                                                            Select All Pending
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Ticket list */}
                                            <div className="overflow-y-auto max-h-[460px]">
                                                <table className="w-full text-xs">
                                                    <thead className="sticky top-0 bg-white z-10">
                                                        <tr className="bg-scout-navy/5 text-scout-charcoal/60 uppercase text-[10px] tracking-wider border-b">
                                                            <th className="py-2 px-3 text-center w-8">✓</th>
                                                            <th className="py-2 px-3 text-left">Ticket #</th>
                                                            <th className="py-2 px-3 text-left">Buyer</th>
                                                            <th className="py-2 px-3 text-center">Date</th>
                                                            <th className="py-2 px-3 text-center">Amount</th>
                                                            <th className="py-2 px-3 text-center">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {scoutTickets.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={6} className="py-8 text-center text-scout-charcoal/40">
                                                                    No cash tickets found for this scout.
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            scoutTickets.map((ticket: any) => {
                                                                const isPending = !ticket.cashSettled;
                                                                const isSelected = selectedSettleTicketIds.includes(ticket.id);
                                                                return (
                                                                    <tr
                                                                        key={ticket.id}
                                                                        className={`border-b transition ${
                                                                            ticket.cashSettled
                                                                                ? "opacity-50"
                                                                                : isSelected
                                                                                ? "bg-green-50"
                                                                                : "hover:bg-white/60"
                                                                        } ${isPending ? "cursor-pointer" : ""}`}
                                                                        onClick={() => {
                                                                            if (!isPending) return;
                                                                            setSelectedSettleTicketIds((prev) =>
                                                                                isSelected
                                                                                    ? prev.filter((id) => id !== ticket.id)
                                                                                    : [...prev, ticket.id]
                                                                            );
                                                                        }}
                                                                    >
                                                                        <td className="py-2 px-3 text-center">
                                                                            {isPending ? (
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={isSelected}
                                                                                    onChange={() => {}}
                                                                                    className="w-3.5 h-3.5 accent-green-600 cursor-pointer"
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                />
                                                                            ) : (
                                                                                <span className="text-green-600">✅</span>
                                                                            )}
                                                                        </td>
                                                                        <td className="py-2 px-3 font-mono font-bold text-scout-navy">#{ticket.id}</td>
                                                                        <td className="py-2 px-3">
                                                                            <div className="font-semibold text-scout-charcoal text-xs">{ticket.buyerName || "—"}</div>
                                                                            {ticket.buyerPhone && (
                                                                                <div className="text-[10px] text-scout-charcoal/50 font-mono mt-0.5">{ticket.buyerPhone}</div>
                                                                            )}
                                                                        </td>
                                                                        <td className="py-2 px-3 text-center text-scout-charcoal/60">
                                                                            {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : "—"}
                                                                        </td>
                                                                        <td className="py-2 px-3 text-center font-bold text-scout-navy">${TICKET_PRICE}</td>
                                                                        <td className="py-2 px-3 text-center">
                                                                            {ticket.cashSettled ? (
                                                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold text-[10px]">
                                                                                    Settled ✅
                                                                                </span>
                                                                            ) : (
                                                                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-semibold text-[10px]">
                                                                                    Pending 💵
                                                                                </span>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {loadingDrill && (<div className="py-3 text-center text-xs text-scout-charcoal/40 animate-pulse">Loading tickets...</div>)}
                                            {scoutTicketsHasMore && !loadingDrill && selectedTreasuryScout && (<div className="py-3 text-center border-t"><button onClick={() => loadDrillDown(selectedTreasuryScout.id, true)} className="text-xs text-scout-navy font-semibold hover:underline">↓ Load more tickets</button></div>)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
