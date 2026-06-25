"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Team {
    id: string;
    name: string;
    flagUrl: string;
    totalWins: number;
}

interface ScoutStats {
    ticketsSold: number;
}

interface LeaderboardEntry {
    id: string;
    full_name: string;
    tickets_count: number;
}

export default function ScoutDashboard() {
    const router = useRouter();
    const params = useParams();
    const locale = params.locale as string;
    const isAr = locale === "ar";

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState<ScoutStats>({ ticketsSold: 0 });
    const [teams, setTeams] = useState<Team[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

    // Form State
    const [buyerName, setBuyerName] = useState("");
    const [countryCode, setCountryCode] = useState("+961");
    const [buyerPhone, setBuyerPhone] = useState("");
    const [selectedTeamId, setSelectedTeamId] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [successTicket, setSuccessTicket] = useState<any>(null);
    const [teamSearch, setTeamSearch] = useState("");

    useEffect(() => {
        async function initDashboard() {
            try {
                // Get user session
                const userRes = await fetch("/api/auth/me");
                if (!userRes.ok) {
                    router.replace(`/${locale}/login`);
                    return;
                }

                const userData = await userRes.json();
                setProfile(userData.user);

                await fetchDashboardData();
            } catch (err) {
                router.replace(`/${locale}/login`);
            } finally {
                setLoading(false);
            }
        }

        initDashboard();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // 1. Fetch Scout's tickets and leaderboard stats
            const statsRes = await fetch("/api/scout/tickets");
            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData.stats);
                setLeaderboard(statsData.leaderboard || []);
            }

            // 2. Fetch Teams
            const teamsRes = await fetch("/api/teams");
            if (teamsRes.ok) {
                const teamsData = await teamsRes.json();
                setTeams(teamsData.teams || []);
            }
        } catch (err) {
            console.error("Error fetching dashboard stats:", err);
        }
    };

    const handleSignOut = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.replace(`/${locale}/login`);
    };

    const handleSellTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTeamId) {
            alert(isAr ? "الرجاء اختيار منتخب كأول خطوة" : "Please select a team first");
            return;
        }

        const digits = buyerPhone.replace(/\D/g, "");
        if (countryCode === "+961") {
            const isThree = digits.startsWith("3") && digits.length === 7;
            const isStandard = (digits.startsWith("03") || !digits.startsWith("3")) && digits.length === 8;
            if (!isThree && !isStandard) {
                alert(
                    isAr
                        ? "رقم الهاتف اللبناني غير صالح. يجب أن يكون 8 أرقام (أو 7 أرقام إذا كان يبدأ بـ 3)."
                        : "Invalid Lebanese phone number. Must be 8 digits (or 7 digits if starting with 3)."
                );
                return;
            }
        }

        setSubmitting(true);
        try {
            const fullPhone = `${countryCode.replace("+", "")}${digits}`;
            const res = await fetch("/api/scout/tickets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    buyerName,
                    buyerPhone: fullPhone,
                    teamId: selectedTeamId,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to submit ticket sale");

            setSuccessTicket(data.ticket);
            // Reset form
            setBuyerName("");
            setBuyerPhone("");
            setSelectedTeamId("");
            // Refresh dashboard data
            await fetchDashboardData();
        } catch (err: any) {
            alert(err.message || "Failed to submit ticket sale");
        } finally {
            setSubmitting(false);
        }
    };

    const getWhatsAppLink = (ticket: any) => {
        if (!ticket) return "";
        const teamName = teams.find((t) => t.id === ticket.teamId)?.name || ticket.teamId;
        const baseMsg = isAr
            ? `شكرًا لشرائك تذكرة مسابقة سحب كأس الكشافة رقم #${ticket.id} لدعم كشافة الأرز! فريقك المختار هو ${teamName}. كل فوز يحققه هذا الفريق يمنحك فرصة إضافية في السحب النهائي! ⚽️`
            : `Thank you for purchasing World Cup Scout Cup Draw ticket #${ticket.id} supporting Scouts des Cèdres! Your selected team is ${teamName}. Every win they achieve grants you an extra entry in the final raffle! ⚽️`;

        // Generate tracking link
        const trackingLink = `${window.location.origin}/${locale}/scout-world-cup/standings?phone=${encodeURIComponent(ticket.buyerPhone)}`;
        const fullMsg = `${baseMsg}\n\n${isAr ? "تابع تذكرتك ونقاط فريقك من هنا:" : "Track your ticket and team entries here:"}\n${trackingLink}`;

        // Normalize phone number (strip non-digits, ensure country code)
        const cleanPhone = ticket.buyerPhone.replace(/\D/g, "");
        return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(fullMsg)}`;
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
            {/* Navbar Header */}
            <header className="bg-scout-navy text-white py-4 px-6 shadow-md flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold font-display text-scout-gold">
                        {isAr ? "بوابة الكشاف المبيعات" : "Scout Sales Dashboard"}
                    </h1>
                    <p className="text-xs text-white/70">
                        {isAr ? `أهلاً، ${profile?.fullName}` : `Welcome, ${profile?.fullName}`}
                    </p>
                </div>
                <div className="flex gap-4">
                    {profile?.role === "admin" && (
                        <button
                            onClick={() => router.push(`/${locale}/scout-world-cup/dashboard/admin`)}
                            className="text-sm px-4 py-1.5 rounded-lg border border-scout-gold text-scout-gold hover:bg-scout-gold hover:text-scout-navy transition cursor-pointer"
                        >
                            {isAr ? "لوحة الإدارة" : "Admin Panel"}
                        </button>
                    )}
                    <button
                        onClick={handleSignOut}
                        className="text-sm px-4 py-1.5 rounded-lg bg-red-800/80 hover:bg-red-700 transition cursor-pointer"
                    >
                        {isAr ? "خروج" : "Sign Out"}
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Summary and Leaderboard */}
                <div className="space-y-6 lg:col-span-1">
                    {/* Summary Card */}
                    <div className="glass-panel p-6 rounded-2xl shadow-md border-l-4 border-scout-gold">
                        <h2 className="text-lg font-bold mb-4 font-display text-scout-navy">
                            {isAr ? "إحصاءات المبيعات الخاصة بك" : "Your Sales Performance"}
                        </h2>
                        <div className="flex justify-center">
                            <div className="bg-scout-beige-dark/50 p-6 rounded-xl text-center w-full max-w-xs">
                                <span className="block text-3xl font-extrabold text-scout-navy">
                                    {stats.ticketsSold}
                                </span>
                                <span className="text-sm text-scout-charcoal/60">
                                    {isAr ? "تذكرة مباعة" : "Tickets Sold"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Group Leaderboard */}
                    <div className="glass-panel p-6 rounded-2xl shadow-md">
                        <h2 className="text-lg font-bold mb-4 font-display text-scout-navy">
                            {isAr ? "لوحة صدارة الكشافة" : "Scout Leaderboard"}
                        </h2>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                            {leaderboard.map((entry, index) => {
                                const isCurrentUser = entry.id === profile?.id;
                                return (
                                    <div
                                        key={entry.id}
                                        className={`flex items-center justify-between p-3 rounded-lg text-sm ${isCurrentUser
                                                ? "bg-scout-gold/15 border border-scout-gold/30"
                                                : "bg-white/50"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-scout-navy">
                                                #{index + 1}
                                            </span>
                                            <span className={isCurrentUser ? "font-bold text-scout-navy" : ""}>
                                                {entry.full_name}
                                            </span>
                                        </div>
                                        <span className="font-semibold text-scout-green-light">
                                            {entry.tickets_count} {isAr ? "تذكرة" : "tickets"}
                                        </span>
                                    </div>
                                );
                            })}
                            {leaderboard.length === 0 && (
                                <p className="text-xs text-scout-charcoal/50 text-center py-4">
                                    {isAr ? "لا توجد مبيعات مسجلة حتى الآن." : "No sales registered yet."}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Ticket Sales Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel p-6 rounded-2xl shadow-md">
                        <h2 className="text-xl font-bold mb-4 font-display text-scout-navy border-b pb-2">
                            {isAr ? "تسجيل تذكرة بيع جديدة" : "Record New Ticket Sale"}
                        </h2>
                        <form onSubmit={handleSellTicket} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-scout-navy">
                                        {isAr ? "اسم المشتري" : "Buyer's Full Name"}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={buyerName}
                                        onChange={(e) => setBuyerName(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-scout-beige-dark bg-white focus:border-scout-navy focus:outline-none transition"
                                        placeholder={isAr ? "سمير البستاني" : "Samir Boustany"}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-scout-navy">
                                        {isAr ? "رقم هاتف المشتري" : "Buyer's Phone"}
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            value={countryCode}
                                            onChange={(e) => setCountryCode(e.target.value)}
                                            className="px-3 py-2.5 rounded-lg border border-scout-beige-dark bg-white text-sm focus:border-scout-navy focus:outline-none transition"
                                        >
                                            <option value="+961">🇱🇧 +961</option>
                                            <option value="+1">🇺🇸 +1</option>
                                            <option value="+971">🇦🇪 +971</option>
                                            <option value="+966">🇸🇦 +966</option>
                                            <option value="+33">🇫🇷 +33</option>
                                            <option value="+44">🇬🇧 +44</option>
                                            <option value="+39">🇮🇹 +39</option>
                                            <option value="+49">🇩🇪 +49</option>
                                        </select>
                                        <input
                                            type="tel"
                                            required
                                            value={buyerPhone}
                                            onChange={(e) => setBuyerPhone(e.target.value)}
                                            className="flex-grow px-4 py-2.5 rounded-lg border border-scout-beige-dark bg-white focus:border-scout-navy focus:outline-none transition text-sm sm:text-base"
                                            placeholder={countryCode === "+961" ? "81 090 746" : "Phone number"}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* World Cup Team Flags Select Grid */}
                            <div>
                                <label className="block text-sm font-medium mb-3 text-scout-navy">
                                    {isAr ? "اختر المنتخب المفضل للمشتري" : "Choose Buyer's World Cup Team"}
                                </label>

                                {/* Team Search Input */}
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        value={teamSearch}
                                        onChange={(e) => setTeamSearch(e.target.value)}
                                        placeholder={isAr ? "ابحث عن منتخب بالاسم أو الرمز..." : "Search team by name or code..."}
                                        className="w-full px-4 py-2 rounded-lg border border-scout-beige-dark bg-white focus:outline-none focus:border-scout-navy text-sm shadow-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                    {teams
                                        .filter((t) =>
                                            t.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
                                            t.id.toLowerCase().includes(teamSearch.toLowerCase())
                                        )
                                        .map((t) => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setSelectedTeamId(t.id)}
                                                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${selectedTeamId === t.id
                                                        ? "bg-scout-navy text-white border-scout-gold scale-105 shadow-md"
                                                        : "bg-white/80 hover:bg-white text-scout-charcoal hover:border-scout-gold-light border-scout-beige-dark"
                                                    }`}
                                            >
                                                <img
                                                    src={t.flagUrl}
                                                    alt={t.name}
                                                    className="w-10 h-7 object-cover rounded shadow-sm mb-1.5"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = "https://flagcdn.com/un.svg";
                                                    }}
                                                />
                                                <span className="text-[11px] font-bold tracking-tight line-clamp-1">
                                                    {t.name}
                                                </span>
                                            </button>
                                        ))}
                                    {teams.length === 0 && (
                                        <p className="col-span-full text-xs text-scout-charcoal/50 text-center py-4 bg-white/50 rounded-xl">
                                            {isAr
                                                ? "لم يتم تحميل أي فرق بعد. يرجى الطلب من المسؤول إدخال الفرق."
                                                : "No teams loaded in the database yet. Ask an admin to seed teams."}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 bg-scout-green hover:bg-scout-green-light text-white font-semibold rounded-lg shadow-lg hover:shadow-scout-green/20 transition duration-300 disabled:opacity-50 cursor-pointer text-center font-display"
                            >
                                {submitting ? (
                                    <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5" />
                                ) : (
                                    isAr ? "تأكيد تسجيل التذكرة" : "Confirm Ticket Registration"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            {/* Success Modal */}
            {successTicket && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-scout-green-light/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-scout-green-light"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold font-display text-scout-navy">
                                {isAr ? "تم تسجيل البيع بنجاح!" : "Ticket Sale Registered!"}
                            </h3>
                            <p className="text-sm text-scout-charcoal/60 mt-1">
                                {isAr ? "رقم التذكرة التسلسلي الخاص بك هو:" : "Your ticket serial number is:"}
                            </p>
                            <div className="bg-scout-beige-dark/40 py-3 px-6 rounded-xl my-4 inline-block">
                                <span className="text-3xl font-extrabold text-scout-gold">
                                    #{successTicket.id}
                                </span>
                            </div>
                            <p className="text-xs text-scout-charcoal/70 mb-6 px-4">
                                {isAr
                                    ? "يرجى الضغط أدناه لإرسال رسالة تأكيد فورا للمشتري عبر الواتساب."
                                    : "Click below to quickly send a preformatted confirmation message to the buyer on WhatsApp."}
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setSuccessTicket(null)}
                                    className="flex-1 py-3 bg-scout-navy hover:bg-scout-navy-light text-white font-semibold rounded-lg shadow-md transition duration-200 cursor-pointer"
                                >
                                    {isAr ? "إغلاق" : "Close"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
