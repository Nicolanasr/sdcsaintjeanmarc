"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Team {
    id: string;
    name: string;
    flagUrl: string;
    totalWins: number;
    isEliminated: boolean;
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
    const [groupBy, setGroupBy] = useState<"none" | "country" | "scout" | "buyer">("none");
    const [ticketSearchQuery, setTicketSearchQuery] = useState("");
    const [expandedGroups, setExpandedGroups] = useState<{[key: string]: boolean}>({});
    const [whatsappSettings, setWhatsappSettings] = useState({ sendOnPurchase: true, sendOnGoal: false });
    const [verifyingIds, setVerifyingIds] = useState<number[]>([]);

    const handleVerifyTickets = async (ticketIds: number[]) => {
        if (!confirm(isAr ? "هل أنت متأكد من تأكيد استلام الدفعة لهذه التذاكر؟" : "Are you sure you want to verify payment for these tickets?")) {
            return;
        }
        setVerifyingIds(prev => [...prev, ...ticketIds]);
        try {
            const res = await fetch("/api/admin/verify-ticket", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ticketIds }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Verification failed");
            alert(isAr ? "تم تأكيد الدفعة بنجاح وإرسال الرسائل!" : "Payment successfully verified and WhatsApp sent!");
            await loadAdminData();
        } catch (err: any) {
            alert("Verification failed: " + err.message);
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

    const handleToggleWhatsApp = async (key: "sendOnPurchase" | "sendOnGoal", checked: boolean) => {
        const updated = { ...whatsappSettings, [key]: checked };
        setWhatsappSettings(updated);
        try {
            const res = await fetch("/api/admin/whatsapp-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updated),
            });
            if (!res.ok) throw new Error("Failed to save WhatsApp settings");
        } catch (err: any) {
            alert(err.message || "Failed to update settings");
            // revert
            setWhatsappSettings(whatsappSettings);
        }
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
                await loadAdminData();
            } catch (err) {
                router.replace(`/${locale}/scout-world-cup/dashboard/scout`);
            } finally {
                setLoading(false);
            }
        }

        checkAdmin();
    }, []);

    const loadAdminData = async () => {
        try {
            // Load Teams
            const teamsRes = await fetch("/api/teams");
            if (teamsRes.ok) {
                const teamsData = await teamsRes.json();
                setTeams(teamsData.teams || []);
            }

            // Load tickets statistics/count
            const statsRes = await fetch("/api/scout/tickets");
            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setTicketsCount(statsData.totalTicketsCount || 0);
                setAllTickets(statsData.allTickets || []);
            }

            // Load WhatsApp settings
            const waRes = await fetch("/api/admin/whatsapp-settings");
            if (waRes.ok) {
                const waData = await waRes.json();
                setWhatsappSettings(waData.settings || { sendOnPurchase: true, sendOnGoal: false });
            }
        } catch (err) {
            console.error("Error loading admin data:", err);
        }
    };

    // Quick Seed Teams
    const handleSeedTeams = async () => {
        try {
            const res = await fetch("/api/teams/seed", { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to seed teams");

            alert("Successfully seeded World Cup teams!");
            await loadAdminData();
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
            await loadAdminData();
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
            await loadAdminData();
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

    // Trigger Weighted Draw
    const handleExecuteDraw = async () => {
        if (confirm(isAr ? "هل أنت متأكد من إجراء السحب النهائي على الجوائز؟" : "Are you sure you want to execute the weighted raffle draw?")) {
            setDrawing(true);
            setWinners([]);
            try {
                const res = await fetch("/api/draw", { method: "POST" });
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || "Raffle draw execution failed");

                setWinners(result.winners || []);
                alert(isAr ? "اكتمل السحب بنجاح!" : "Lottery draw completed successfully!");
            } catch (err: any) {
                alert(err.message || "Error running draw");
            } finally {
                setDrawing(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-scout-beige">
                <span className="animate-spin border-4 border-scout-navy border-t-transparent rounded-full w-12 h-12" />
            </div>
        );
    }

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

            <main className="max-w-6xl mx-auto p-6 space-y-8">
                {/* Draw panel and Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-panel p-6 rounded-2xl shadow-md flex flex-col justify-between">
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
                            className="mt-2 w-full py-2 bg-scout-gold hover:bg-scout-gold-light text-scout-navy text-xs font-bold rounded-lg disabled:opacity-50 transition cursor-pointer"
                        >
                            {syncing ? (isAr ? "جاري المزامنة..." : "Syncing...") : (isAr ? "مزامنة أهداف كأس العالم" : "Sync Live Goals")}
                        </button>
                    </div>

                    <div className="md:col-span-2 glass-panel p-6 rounded-2xl shadow-md border-l-4 border-scout-gold">
                        <h2 className="text-lg font-bold font-display text-scout-navy mb-2">
                            {isAr ? "محرك السحب والقرعة المرجح" : "The Weighted Draw Engine"}
                        </h2>
                        <p className="text-xs text-scout-charcoal/70 mb-4">
                            {isAr
                                ? "يقوم السحب بجمع التذاكر وضرب أهداف الفرق بالمعادلة المرجحة (الأول: ١٠ أضعاف، الثاني: ٥ أضعاف، الثالث: ضعفين، البقية: صفر). ثم يتم اختيار ٣ فائزين فريدين عشوائياً وبأمان."
                                : "Aggregates tickets with weighted goals (1st place 10x, 2nd 5x, 3rd 2x, others 0x). Cryptographically picks 3 unique winners sequentially."}
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={handleExecuteDraw}
                                disabled={drawing}
                                className="flex-1 py-3 bg-scout-green hover:bg-scout-green-light text-white font-semibold rounded-lg shadow-md disabled:opacity-50 transition cursor-pointer font-display"
                            >
                                {drawing ? (
                                    <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5" />
                                ) : (
                                    isAr ? "تشغيل السحب وإعلان الفائزين" : "Compile Raffle Pool & Execute Draw"
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* WhatsApp Notification Settings */}
                <div className="glass-panel p-6 rounded-2xl shadow-md border-l-4 border-scout-green">
                    <h2 className="text-lg font-bold font-display text-scout-navy mb-2 flex items-center gap-2">
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
                                onChange={(e) => handleToggleWhatsApp("sendOnPurchase", e.target.checked)}
                                className="w-5 h-5 rounded border-scout-beige-dark text-scout-green accent-scout-green focus:ring-scout-green cursor-pointer"
                            />
                            <span className="text-sm font-semibold text-scout-navy">
                                {isAr ? "إشعار عند شراء التذكرة" : "Notify buyer on ticket purchase"}
                            </span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={whatsappSettings.sendOnGoal}
                                onChange={(e) => handleToggleWhatsApp("sendOnGoal", e.target.checked)}
                                className="w-5 h-5 rounded border-scout-beige-dark text-scout-green accent-scout-green focus:ring-scout-green cursor-pointer"
                            />
                            <span className="text-sm font-semibold text-scout-navy">
                                {isAr ? "إشعار عندما يسجل فريقهم أهدافاً" : "Notify buyer when their team scores"}
                            </span>
                        </label>
                    </div>
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
                            <table className="w-full text-sm text-left border-collapse bg-white/70 rounded-xl">
                                <thead>
                                    <tr className="border-b text-scout-navy font-bold text-xs uppercase bg-scout-beige-dark/20">
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
                                                        <button
                                                            onClick={() => handleVerifyTickets(group.ticketIds)}
                                                            disabled={isVerifying}
                                                            className="px-3 py-1.5 bg-scout-green hover:bg-scout-green-light text-white text-[11px] font-bold rounded-lg transition disabled:opacity-50 cursor-pointer shadow-sm"
                                                        >
                                                            {isVerifying ? (isAr ? "جاري التأكيد..." : "Confirming...") : (isAr ? "تأكيد واستلام" : "Approve Payment")}
                                                        </button>
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

                {/* Winners Results Display */}
                {winners.length > 0 && (
                    <div className="glass-panel p-6 rounded-2xl shadow-md bg-scout-gold/10 border border-scout-gold/40 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <h2 className="text-xl font-bold font-display text-scout-navy mb-4 text-center">
                            🏆 {isAr ? "الفائزون في السحب النهائي" : "Raffle Winners List"} 🏆
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {winners.map((w, idx) => {
                                const prizeNames = ["1st Prize 🥇", "2nd Prize 🥈", "3rd Prize 🥉"];
                                const prizeNamesAr = ["الجائزة الأولى 🥇", "الجائزة الثانية 🥈", "الجائزة الثالثة 🥉"];
                                return (
                                    <div key={idx} className="bg-white/90 p-5 rounded-xl border border-scout-gold text-center relative overflow-hidden shadow">
                                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-scout-gold" />
                                        <span className="text-xs font-bold text-scout-gold uppercase tracking-wider block mb-2">
                                            {isAr ? prizeNamesAr[idx] : prizeNames[idx]}
                                        </span>
                                        <h4 className="text-lg font-bold text-scout-navy mb-1">
                                            {w.buyerName}
                                        </h4>
                                        <p className="text-xs text-scout-charcoal/70 mb-2">
                                            {w.buyerPhone}
                                        </p>
                                        <div className="text-[11px] bg-scout-beige px-3 py-1.5 rounded-lg inline-block border text-scout-navy font-semibold">
                                            Ticket #{w.id} • Team: {w.teamId}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Create Custom Team Form */}
                <div className="glass-panel p-6 rounded-2xl shadow-md">
                    <h2 className="text-lg font-bold font-display text-scout-navy mb-4">
                        {isAr ? "إضافة منتخب جديد يدوياً" : "Add Custom Team"}
                    </h2>
                    <form onSubmit={handleAddTeam} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-semibold text-scout-charcoal/60 mb-1">
                                {isAr ? "رمز المنتخب (مثال: LBN)" : "Team Code (e.g. LBN)"}
                            </label>
                            <input
                                type="text"
                                required
                                maxLength={3}
                                value={newTeamId}
                                onChange={(e) => setNewTeamId(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border bg-white focus:outline-none focus:border-scout-navy text-sm uppercase"
                                placeholder="LBN"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-scout-charcoal/60 mb-1">
                                {isAr ? "اسم المنتخب" : "Team Name"}
                            </label>
                            <input
                                type="text"
                                required
                                value={newTeamName}
                                onChange={(e) => setNewTeamName(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border bg-white focus:outline-none focus:border-scout-navy text-sm"
                                placeholder="Lebanon"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-scout-charcoal/60 mb-1">
                                {isAr ? "رابط العلم (URL)" : "Flag Image URL"}
                            </label>
                            <input
                                type="url"
                                required
                                value={newTeamFlag}
                                onChange={(e) => setNewTeamFlag(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border bg-white focus:outline-none focus:border-scout-navy text-sm"
                                placeholder="https://flagcdn.com/lb.svg"
                            />
                        </div>
                        <button
                            type="submit"
                            className="py-2.5 bg-scout-navy hover:bg-scout-navy-light text-white font-semibold rounded-lg text-sm transition cursor-pointer"
                        >
                            {isAr ? "إضافة المنتخب" : "Add Team"}
                        </button>
                    </form>
                </div>

                {/* Teams Management Overrides */}
                <div className="glass-panel p-6 rounded-2xl shadow-md">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-2 mb-4 gap-4">
                        <h2 className="text-xl font-bold font-display text-scout-navy">
                            {isEditing
                                ? (isAr ? "تعديل ترتيب وأهداف المنتخبات" : "Edit Team Standings & Goals")
                                : (isAr ? "ترتيب المنتخبات ومضاعفات السحب" : "World Cup Teams Standings Leaderboard")}
                        </h2>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="px-4 py-2 bg-scout-navy hover:bg-scout-navy-light text-white text-xs font-bold rounded-lg transition cursor-pointer"
                        >
                            {isEditing
                                ? (isAr ? "👁️ عرض الترتيب (قراءة فقط)" : "👁️ View Standings (Read-only)")
                                : (isAr ? "✏️ تعديل الأهداف والترتيب" : "✏️ Edit Standings & Goals")}
                        </button>
                    </div>

                    {/* Team Search input */}
                    <div className="mb-4">
                        <input
                            type="text"
                            value={teamSearch}
                            onChange={(e) => setTeamSearch(e.target.value)}
                            placeholder={isAr ? "ابحث عن منتخب..." : "Search for a team..."}
                            className="w-full max-w-md px-4 py-2 rounded-lg border border-scout-beige-dark bg-white focus:outline-none focus:border-scout-navy text-sm shadow-sm"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
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
                                                            <span className="font-bold text-scout-navy block leading-none">{t.name}</span>
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

                {/* Scout Sales Log & Grouping Section */}
                <div className="glass-panel p-6 rounded-2xl shadow-md space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
                        <div>
                            <h2 className="text-xl font-bold font-display text-scout-navy">
                                {isAr ? "سجل وإحصاءات التذاكر" : "Ticket Sales & Grouping Stats"}
                            </h2>
                            <p className="text-xs text-scout-charcoal/60 mt-0.5">
                                {isAr ? "استعلم عن مبيعات التذاكر، إجمالي الفرص، وجمعها حسب الفئات" : "Analyze sales log, raffle entry counts, and group records dynamically."}
                            </p>
                        </div>

                        {/* Grouping Select Dropdown */}
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-semibold text-scout-navy">
                                {isAr ? "تجميع حسب:" : "Group By:"}
                            </label>
                            <select
                                value={groupBy}
                                onChange={(e) => setGroupBy(e.target.value as any)}
                                className="px-3 py-1.5 rounded-lg border border-scout-beige-dark bg-white text-xs focus:outline-none focus:border-scout-navy"
                            >
                                <option value="none">{isAr ? "بدون تجميع (تذاكر منفردة)" : "None (Individual Tickets)"}</option>
                                <option value="buyer">{isAr ? "المشتري" : "Buyer Name/Phone"}</option>
                                <option value="scout">{isAr ? "الكشاف" : "Scout"}</option>
                                <option value="country">{isAr ? "البلد / المنتخب" : "Country / Team"}</option>
                            </select>
                        </div>
                    </div>

                    {/* Search Controls (Buyer name / Phone search) */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="w-full sm:max-w-md">
                            <input
                                type="text"
                                value={ticketSearchQuery}
                                onChange={(e) => setTicketSearchQuery(e.target.value)}
                                placeholder={isAr ? "ابحث باسم المشتري أو رقم الهاتف..." : "Search by buyer name or phone..."}
                                className="w-full px-4 py-2 rounded-lg border border-scout-beige-dark bg-white text-sm focus:outline-none focus:border-scout-navy shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Grouping Render logic */}
                    <div className="overflow-x-auto">
                        {(() => {
                            // Helper to get entries for a single ticket
                            const getTicketEntries = (ticket: any) => {
                                if (!ticket.team) return 1;
                                return 1 + (ticket.team.totalWins || 0);
                            };

                            // Filter tickets by search query
                            const filtered = allTickets.filter((ticket) => {
                                const q = ticketSearchQuery.toLowerCase();
                                return (
                                    ticket.buyerName.toLowerCase().includes(q) ||
                                    ticket.buyerPhone.toLowerCase().includes(q)
                                );
                            });

                            if (groupBy === "none") {
                                return (
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead>
                                            <tr className="border-b text-scout-navy font-bold">
                                                <th className="py-3 px-4">{isAr ? "رقم التذكرة" : "Ticket #"}</th>
                                                <th className="py-3 px-4">{isAr ? "اسم الكشاف" : "Scout Name"}</th>
                                                <th className="py-3 px-4">{isAr ? "المشتري" : "Buyer Name"}</th>
                                                <th className="py-3 px-4">{isAr ? "رقم الهاتف" : "Phone"}</th>
                                                <th className="py-3 px-4">{isAr ? "المنتخب المختار" : "Selected Team"}</th>
                                                <th className="py-3 px-4 text-center">{isAr ? "عدد البطاقات بالسحب" : "Raffle Entries"}</th>
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
                                                        {ticket.scout?.fullName || (ticket.paymentMethod === "WHISH" ? (isAr ? "شراء أونلاين (Whish)" : "Online (Whish)") : (isAr ? "شراء عام" : "Public Purchase"))}
                                                    </td>
                                                    <td className="py-3 px-4 font-semibold text-scout-navy">
                                                        {ticket.buyerName}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {ticket.buyerPhone}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="bg-scout-navy/10 text-scout-navy text-[11px] font-bold px-2 py-1 rounded">
                                                            {ticket.team?.name || ticket.teamId}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-center font-bold text-scout-green-light">
                                                        {getTicketEntries(ticket)}
                                                    </td>
                                                    <td className="py-3 px-4 text-center text-xs text-scout-charcoal/60" suppressHydrationWarning>
                                                        {formatLocalDate(ticket.createdAt)}
                                                    </td>
                                                </tr>
                                            ))}
                                            {filtered.length === 0 && (
                                                <tr>
                                                    <td colSpan={7} className="text-center py-6 text-xs text-scout-charcoal/50">
                                                        {isAr ? "لا توجد تذاكر مطابقة للبحث." : "No matching tickets found."}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                );
                            }

                            if (groupBy === "buyer") {
                                // Group by buyerPhone
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
                                    <table className="w-full text-sm text-left border-collapse">
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
                                                            <td className="py-3 px-4 text-center text-scout-navy font-bold text-xs">
                                                                {isExpanded ? "▼" : "▶"}
                                                            </td>
                                                            <td className="py-3 px-4 font-semibold text-scout-navy">
                                                                {buyer.name}
                                                            </td>
                                                            <td className="py-3 px-4">
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
                                                                        <div className="text-xs font-bold text-scout-navy border-b pb-1">
                                                                            {isAr ? "تفاصيل تذاكر المشتري" : "Buyer's Ticket Details"}
                                                                        </div>
                                                                        <table className="w-full text-xs text-left border-collapse">
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
                                                                                        <td className="py-1.5 px-2 text-scout-charcoal/80">{tk.scout?.fullName || (tk.paymentMethod === "WHISH" ? (isAr ? "شراء أونلاين (Whish)" : "Online (Whish)") : (isAr ? "شراء عام" : "Public Purchase"))}</td>
                                                                                        <td className="py-1.5 px-2 text-scout-charcoal/60" suppressHydrationWarning>{formatLocalDate(tk.createdAt)}</td>
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
                                            {sortedBuyers.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="text-center py-6 text-xs text-scout-charcoal/50">
                                                        {isAr ? "لا توجد نتائج مطابقة للبحث." : "No matching buyers found."}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                );
                            }

                            if (groupBy === "scout") {
                                // Group by scout
                                const scoutGroups: {
                                    [key: string]: { name: string; ticketsCount: number; totalEntries: number; tickets: any[] };
                                } = {};

                                filtered.forEach((t) => {
                                    const sName = t.scout?.fullName || (t.paymentMethod === "WHISH" ? (isAr ? "شراء أونلاين (Whish)" : "Online (Whish)") : (isAr ? "شراء عام" : "Public Purchase"));
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
                                    <table className="w-full text-sm text-left border-collapse">
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
                                                            <td className="py-3 px-4 text-center text-scout-navy font-bold text-xs">
                                                                {isExpanded ? "▼" : "▶"}
                                                            </td>
                                                            <td className="py-3 px-4 font-semibold text-scout-navy">
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
                                                                        <div className="text-xs font-bold text-scout-navy border-b pb-1">
                                                                            {isAr ? "المشترون والبطاقات المباعة بواسطة هذا الكشاف" : "Buyers & Tickets Sold by this Scout"}
                                                                        </div>
                                                                        <table className="w-full text-xs text-left border-collapse">
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
                                                                                             ) : tk.whishTransactionId ? (
                                                                                                 <div className="flex items-center justify-center gap-1">
                                                                                                     <span className="text-amber-600 text-[10px]" title={tk.whishTransactionId}>{isAr ? "معلق" : "PENDING"}</span>
                                                                                                     <button
                                                                                                         onClick={() => handleVerifyTickets([tk.id])}
                                                                                                         className="px-1 py-0.5 bg-scout-green hover:bg-scout-green-light text-white text-[9px] rounded cursor-pointer transition font-bold"
                                                                                                     >
                                                                                                         {isAr ? "تأكيد" : "Approve"}
                                                                                                     </button>
                                                                                                 </div>
                                                                                             ) : (
                                                                                                 <span className="text-red-500">{isAr ? "غير مدفوع" : "UNPAID"}</span>
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
                                            {sortedScouts.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="text-center py-6 text-xs text-scout-charcoal/50">
                                                        {isAr ? "لا توجد نتائج مطابقة للبحث." : "No matching scouts found."}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                );
                            }

                            if (groupBy === "country") {
                                // Group by team / country
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
                                    <table className="w-full text-sm text-left border-collapse">
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
                                                            <td className="py-3 px-4 text-center text-scout-navy font-bold text-xs">
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
                                                                <span className="font-bold text-scout-navy">{country.name}</span>
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
                                                                        <div className="text-xs font-bold text-scout-navy border-b pb-1">
                                                                            {isAr ? "المشترون والبطاقات لهذا المنتخب" : "Buyers & Tickets for this Team"}
                                                                        </div>
                                                                        <table className="w-full text-xs text-left border-collapse">
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
                                                                                        <td className="py-1.5 px-2 text-scout-charcoal/80">{tk.scout?.fullName || "Unknown"}</td>
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
                                            {sortedCountries.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="text-center py-6 text-xs text-scout-charcoal/50">
                                                        {isAr ? "لا توجد نتائج مطابقة للبحث." : "No matching countries found."}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                );
                            }

                            return null;
                        })()}
                    </div>
                </div>
            </main>
        </div>
    );
}
