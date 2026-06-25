"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { MessageCircle, Globe, Megaphone } from "lucide-react";
import { FaFacebookF, FaInstagram, FaWhatsapp, FaTiktok } from "react-icons/fa6";

interface Team {
    id: string;
    name: string;
    flagUrl: string;
    totalWins: number;
    isEliminated: boolean;
}

function StandingsContent() {
    const params = useParams();
    const searchParams = useSearchParams();

    const locale = params.locale as string;
    const isAr = locale === "ar";
    const ticketIdParam = searchParams.get("ticket_id") || searchParams.get("query") || searchParams.get("phone");

    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchId, setSearchId] = useState("");
    const [searching, setSearching] = useState(false);
    const [searchResult, setSearchResult] = useState<any>(null); // holds { type: 'single'|'multi', ticket?, tickets? }
    const [searchError, setSearchError] = useState("");

    useEffect(() => {
        async function loadTeams() {
            try {
                const res = await fetch("/api/teams");
                if (res.ok) {
                    const data = await res.json();
                    setTeams(data.teams || []);
                }
            } catch (err) {
                console.error("Error loading teams:", err);
            } finally {
                setLoading(false);
            }
        }
        loadTeams();
    }, []);

    useEffect(() => {
        if (ticketIdParam) {
            setSearchId(ticketIdParam);
            triggerSearch(ticketIdParam);
        }
    }, [ticketIdParam]);

    const triggerSearch = async (queryVal: string) => {
        setSearching(true);
        setSearchError("");
        setSearchResult(null);

        try {
            const res = await fetch(`/api/public/ticket?query=${encodeURIComponent(queryVal)}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Search failed");
            }

            if (data.type === "multi" && data.tickets) {
                data.tickets = data.tickets.filter((t: any) => t.paymentStatus !== "REJECTED");
                if (data.tickets.length === 0) {
                    throw new Error(isAr ? "لم يتم العثور على أي تذاكر نشطة" : "No active tickets found for this phone number");
                }
            } else if (data.type === "single" && data.ticket && data.ticket.paymentStatus === "REJECTED") {
                throw new Error(isAr ? "تم رفض هذه التذكرة" : "This ticket payment was rejected.");
            }
            setSearchResult(data);
        } catch (err: any) {
            setSearchError(err.message || "No results found");
        } finally {
            setSearching(false);
        }
    };

    const handleSearchForm = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchId) {
            triggerSearch(searchId);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-scout-beige">
                <span className="animate-spin border-4 border-scout-navy border-t-transparent rounded-full w-12 h-12" />
            </div>
        );
    }

    // Sort teams by standings
    const sortedTeams = [...teams].sort((a, b) => {
        if (b.totalWins !== a.totalWins) return b.totalWins - a.totalWins;
        return a.name.localeCompare(b.name);
    });

    return (
        <div className="min-h-screen bg-scout-beige text-scout-charcoal">
            {/* Header Banner */}
            <header className="bg-scout-navy text-white py-4 px-6 text-center shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-scout-green-light/10 blur-xl scale-150" />
                <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-2">
                    <img
                        src="/sdc-logo-removebg-preview.png"
                        alt="Scouts des Cèdres Logo"
                        className="w-36 h-36 object-contain drop-shadow-md filter invert-100"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "/sdc-logo.jpeg";
                        }}
                    />
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold font-display text-scout-gold tracking-tight">
                            {isAr ? "كشافة الأرز | فوج سان جان مارك - جبيل" : "Scouts des Cèdres | Saint Jean Marc - Byblos"}
                        </h1>
                        <p className="text-xs text-white/70 mt-1.5 font-semibold tracking-wide">
                            {isAr ? "تاريخ السحب: ١٩ تموز ٢٠٢٦" : "Draw Date: July 19, 2026"}
                        </p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-3 py-6 sm:px-6 space-y-6">
                {/* Social Media & Follow Rule Card */}
                <div className="glass-panel p-4 sm:p-6 rounded-2xl shadow-md bg-white border border-scout-gold/20 text-center space-y-4">
                    <div className="max-w-xl mx-auto">
                        <h3 className="text-base font-bold font-display text-scout-navy flex items-center justify-center gap-2">
                            <Megaphone className="w-5 h-5 text-scout-gold" />
                            <span>{isAr ? "ملاحظة هامة للمشاركين" : "Important Notice for Participants"}</span>
                        </h3>
                        <p className="text-xs text-scout-charcoal/80 mt-1">
                            {isAr
                                ? "يجب على الفائز بالسحب أن يكون متابعاً لحساباتنا الرسمية على وسائل التواصل الاجتماعي عند إعلان النتيجة للتأهل واستلام الجائزة!"
                                : "To qualify for the prize, the selected winner must be following at least 1 of our official social media accounts at the time of the draw!"}
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                        {/* Facebook */}
                        <a
                            href="https://www.facebook.com/SDCGroupeSJM/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-scout-navy/5 text-scout-navy hover:bg-scout-navy hover:text-white rounded-xl text-xs font-semibold transition"
                        >
                            <FaFacebookF className="w-4 h-4" />
                            <span>Facebook</span>
                        </a>
                        {/* Instagram */}
                        <a
                            href="https://www.instagram.com/sdc_saintjeanmarc/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-scout-navy/5 text-scout-navy hover:bg-scout-navy hover:text-white rounded-xl text-xs font-semibold transition"
                        >
                            <FaInstagram className="w-4 h-4" />
                            <span>Instagram</span>
                        </a>
                        {/* WhatsApp */}
                        <a
                            href="https://wa.me/96179013907"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-scout-navy/5 text-scout-navy hover:bg-scout-navy hover:text-white rounded-xl text-xs font-semibold transition"
                        >
                            <FaWhatsapp className="w-4 h-4" />
                            <span>WhatsApp</span>
                        </a>
                        {/* TikTok */}
                        <a
                            href="https://www.tiktok.com/@sdcsaintjeanmarc"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-scout-navy/5 text-scout-navy hover:bg-scout-navy hover:text-white rounded-xl text-xs font-semibold transition"
                        >
                            <FaTiktok className="w-4 h-4" />
                            <span>TikTok</span>
                        </a>
                        {/* Website */}
                        <a
                            href="/"
                            className="flex items-center gap-2 px-4 py-2 bg-scout-navy/5 text-scout-navy hover:bg-scout-navy hover:text-white rounded-xl text-xs font-semibold transition"
                        >
                            <Globe className="w-4 h-4" />
                            <span>{isAr ? "الموقع الإلكتروني" : "Website"}</span>
                        </a>
                    </div>
                </div>

                {/* Search Ticket Card */}
                <div className="glass-panel p-4 sm:p-6 rounded-2xl shadow-md border border-scout-beige-dark bg-white/70">
                    <h2 className="text-lg font-bold font-display text-scout-navy mb-4">
                        🔍 {isAr ? "ابحث عن تذكرتك أو انتصاراتك" : "Look Up Your Tickets / Entries"}
                    </h2>
                    <form onSubmit={handleSearchForm} className="flex gap-4">
                        <input
                            type="text"
                            required
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            placeholder={isAr ? "أدخل رقم التذكرة أو رقم الهاتف (مثال: 96181090746)..." : "Enter Ticket ID or Phone Number (e.g. 96181090746)..."}
                            className="flex-grow px-4 py-2.5 rounded-lg border border-scout-beige-dark bg-white focus:outline-none focus:border-scout-navy text-sm shadow-sm"
                        />
                        <button
                            type="submit"
                            disabled={searching}
                            className="px-6 py-2.5 bg-scout-navy hover:bg-scout-navy-light text-white font-semibold rounded-lg text-sm transition disabled:opacity-50 cursor-pointer"
                        >
                            {searching ? (isAr ? "جاري البحث..." : "Searching...") : (isAr ? "بحث" : "Search")}
                        </button>
                    </form>

                    {/* Search Result */}
                    {searchError && (
                        <p className="mt-4 text-xs text-red-600 font-semibold bg-red-50 p-2.5 rounded-lg border border-red-200">
                            {searchError}
                        </p>
                    )}

                    {searchResult && searchResult.type === "single" && searchResult.ticket && (
                        <div className="mt-6 bg-white p-3.5 sm:p-5 rounded-xl border border-scout-gold/30 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 mb-4 gap-2">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-scout-charcoal/50">
                                        {isAr ? "رقم التذكرة" : "Ticket Number"}
                                    </span>
                                    <h4 className="text-xl font-extrabold text-scout-navy">
                                        #{searchResult.ticket.id}
                                    </h4>
                                </div>
                                <div className="text-left sm:text-right">
                                    <span className="text-[10px] uppercase font-bold text-scout-charcoal/50 block">
                                        {isAr ? "اسم المشتري" : "Buyer Name"}
                                    </span>
                                    <span className="font-bold text-scout-navy text-base">
                                        {searchResult.ticket.buyerName}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-center">
                                <div className="bg-scout-beige p-3 rounded-lg border">
                                    <span className="block text-[10px] text-scout-charcoal/50 font-bold mb-1">
                                        {isAr ? "المنتخب المختار" : "Selected Team"}
                                    </span>
                                    <div className="flex items-center justify-center gap-1.5">
                                        <img
                                            src={searchResult.ticket.team?.flagUrl}
                                            alt={searchResult.ticket.team?.name}
                                            className="w-5 h-3.5 object-cover rounded shadow-sm"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = "https://flagcdn.com/un.svg";
                                            }}
                                        />
                                        <span className="font-extrabold text-scout-navy text-xs">
                                            {searchResult.ticket.team?.name || searchResult.ticket.teamId}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-scout-beige p-3 rounded-lg border">
                                    <span className="block text-[10px] text-scout-charcoal/50 font-bold mb-1">
                                        {isAr ? "الانتصارات" : "Wins"}
                                    </span>
                                    <span className="text-base font-extrabold text-scout-navy">
                                        {searchResult.ticket.team?.totalWins || 0}
                                    </span>
                                </div>

                                <div className="bg-scout-beige p-3 rounded-lg border">
                                    <span className="block text-[10px] text-scout-charcoal/50 font-bold mb-1">
                                        {isAr ? "بطاقة مضمونة" : "Guaranteed Entry"}
                                    </span>
                                    <span className="text-base font-extrabold text-scout-gold">
                                        1
                                    </span>
                                </div>

                                <div className="bg-scout-beige p-3 rounded-lg border border-scout-gold/20 bg-scout-gold/5">
                                    <span className="block text-[10px] text-scout-gold font-bold mb-1">
                                        {isAr ? "إجمالي بطاقات السحب" : "Total Raffle Entries"}
                                    </span>
                                    <span className="text-base font-black text-scout-green-light">
                                        {1 + (searchResult.ticket.team?.totalWins || 0)}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t text-[11px] text-scout-charcoal/60 flex justify-between">
                                <span>
                                    {isAr ? `الكشاف المسؤول: ${searchResult.ticket.scout?.fullName || "مخفي"}` : `Sold by Scout: ${searchResult.ticket.scout?.fullName || "Hidden"}`}
                                </span>
                                <span>
                                    {searchResult.ticket.paymentStatus === "PENDING" ? (
                                        <span className="bg-amber-500/10 text-amber-600 font-bold px-2 py-0.5 rounded-full text-[10px]">
                                            {isAr ? "⏳ قيد المراجعة" : "⏳ Pending Verification"}
                                        </span>
                                    ) : searchResult.ticket.paymentStatus === "REJECTED" ? (
                                        <span className="bg-red-500/10 text-red-600 font-bold px-2 py-0.5 rounded-full text-[10px]">
                                            {isAr ? "❌ مرفوض" : "❌ Rejected"}
                                        </span>
                                    ) : (
                                        <span className="bg-scout-green/10 text-scout-green-light font-bold px-2 py-0.5 rounded-full text-[10px]">
                                            {isAr ? "✅ تذكرة نشطة" : "✅ Active Ticket"}
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>
                    )}

                    {searchResult && searchResult.type === "multi" && searchResult.tickets && searchResult.tickets.length > 0 && (
                        <div className="mt-6 bg-white p-3.5 sm:p-5 rounded-xl border border-scout-gold/30 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 gap-2">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-scout-charcoal/50">
                                        {isAr ? "لوحة التحكم للمشتري" : "Buyer Raffle Dashboard"}
                                    </span>
                                    <h4 className="text-lg font-extrabold text-scout-navy">
                                        {searchResult.tickets[0].buyerName}
                                    </h4>
                                </div>
                                <div className="text-left sm:text-right">
                                    <span className="text-[10px] uppercase font-bold text-scout-charcoal/50 block">
                                        {isAr ? "رقم الهاتف" : "Phone Number"}
                                    </span>
                                    <span className="font-bold text-scout-navy text-sm">
                                        {searchResult.tickets[0].buyerPhone}
                                    </span>
                                </div>
                            </div>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="bg-scout-beige p-3 rounded-lg border">
                                    <span className="block text-[10px] text-scout-charcoal/50 font-bold mb-1">
                                        {isAr ? "إجمالي التذاكر" : "Total Tickets Purchased"}
                                    </span>
                                    <span className="text-xl font-extrabold text-scout-navy">
                                        {searchResult.tickets.length}
                                    </span>
                                </div>
                                <div className="bg-scout-beige p-3 rounded-lg border border-scout-gold/20 bg-scout-gold/5">
                                    <span className="block text-[10px] text-scout-gold font-bold mb-1">
                                        {isAr ? "إجمالي بطاقات السحب المشتركة" : "Total Combined Entries"}
                                    </span>
                                    <span className="text-xl font-black text-scout-green-light">
                                        {searchResult.tickets.reduce((acc: number, tk: any) => acc + 1 + (tk.team?.totalWins || 0), 0)}
                                    </span>
                                </div>
                            </div>

                            {/* Tickets Detail List */}
                            <div className="overflow-x-auto pt-2">
                                <div className="text-xs font-bold text-scout-navy border-b pb-1 mb-2">
                                    {isAr ? "تفاصيل تذاكرك" : "Your Ticket Portfolio"}
                                </div>
                                <table className="w-full text-xs text-left border-collapse">
                                    <thead>
                                        <tr className="text-scout-charcoal/70 font-semibold border-b border-scout-beige-dark/20">
                                            <th className="py-2 px-1">{isAr ? "رقم التذكرة" : "Ticket #"}</th>
                                            <th className="py-2 px-1">{isAr ? "المنتخب" : "Selected Team"}</th>
                                            <th className="py-2 px-1 text-center">{isAr ? "الانتصارات" : "Team Wins"}</th>
                                            <th className="py-2 px-1 text-center font-bold">{isAr ? "بطاقات السحب" : "Raffle Entries"}</th>
                                            <th className="py-2 px-1 text-center font-bold">{isAr ? "الحالة" : "Status"}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {searchResult.tickets.map((tk: any) => {
                                            const entries = 1 + (tk.team?.totalWins || 0);
                                            return (
                                                <tr key={tk.id} className="border-b border-scout-beige-dark/10 hover:bg-scout-beige/40">
                                                    <td className="py-2 px-1 font-bold text-scout-navy">#{tk.id}</td>
                                                    <td className="py-2 px-1 flex items-center gap-2">
                                                        <img
                                                            src={tk.team?.flagUrl}
                                                            alt={tk.team?.name}
                                                            className="w-5 h-3.5 object-cover rounded shadow-xs"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = "https://flagcdn.com/un.svg";
                                                            }}
                                                        />
                                                        <span className="font-medium text-scout-charcoal">{tk.team?.name || tk.teamId}</span>
                                                    </td>
                                                    <td className="py-2 px-1 text-center text-scout-charcoal">{tk.team?.totalWins || 0}</td>
                                                    <td className="py-2 px-1 text-center font-bold text-scout-green-light">{entries}</td>
                                                    <td className="py-2 px-1 text-center text-xs font-bold">
                                                        {tk.paymentStatus === "PENDING" ? (
                                                            <span className="text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-full text-[10px]">
                                                                {isAr ? "⏳ قيد المراجعة" : "⏳ Pending"}
                                                            </span>
                                                        ) : tk.paymentStatus === "REJECTED" ? (
                                                            <span className="text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-full text-[10px]">
                                                                {isAr ? "❌ مرفوض" : "❌ Rejected"}
                                                            </span>
                                                        ) : (
                                                            <span className="text-scout-green-light bg-scout-green/10 px-1.5 py-0.5 rounded-full text-[10px]">
                                                                {isAr ? "✅ نشطة" : "✅ Active"}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sync Disclaimer */}
                <div className="bg-scout-gold/10 border-l-4 border-scout-gold p-4 rounded-xl text-xs text-scout-navy font-medium">
                    ⚠️ {isAr
                        ? "تنبيه: لا يتم تحديث هذه الصفحة مباشرة في نفس اللحظة. نرجو التحقق لاحقًا إذا كانت نتائج وعدد انتصارات منتخبكم لا تطابق نتائج المباريات المباشرة بدقة."
                        : "Please note: This page is updated daily and may not reflect real-time live match statistics immediately. If match wins do not match live results exactly, check back later."}
                </div>

                {/* Read-Only Teams Standing Table */}
                <div className="glass-panel p-3.5 sm:p-6 rounded-2xl shadow-md bg-white">
                    <h2 className="text-xl font-bold font-display text-scout-navy mb-4 border-b pb-2">
                        🏆 {isAr ? "ترتيب المنتخبات ونقاط السحب" : "World Cup Teams Raffle Standings"}
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="border-b text-scout-navy font-bold">
                                    <th className="py-3 px-2 sm:px-4">{isAr ? "الترتيب / المنتخب" : "Standings"}</th>
                                    <th className="py-3 px-2 sm:px-4 text-center">{isAr ? "الانتصارات" : "Wins"}</th>
                                    <th className="py-3 px-2 sm:px-4 text-center">{isAr ? "البطاقات لكل تذكرة" : "Entries"}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedTeams.map((t, idx) => {
                                    const entries = 1 + (t.totalWins || 0);

                                    return (
                                        <tr key={t.id} className="border-b hover:bg-scout-beige-dark/20 transition">
                                            <td className="py-3 px-2 sm:px-4 flex items-center gap-1.5 sm:gap-3">
                                                <span className="font-bold text-scout-navy text-xs min-w-[14px]">
                                                    #{idx + 1}
                                                </span>
                                                <img
                                                    src={t.flagUrl}
                                                    alt={t.name}
                                                    className="w-7 h-4.5 sm:w-8 sm:h-5 object-cover rounded shadow-sm"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = "https://flagcdn.com/un.svg";
                                                    }}
                                                />
                                                <div>
                                                    <span className="font-bold text-scout-navy block leading-none text-xs sm:text-sm">{t.name}</span>
                                                    <span className="text-[9px] sm:text-[10px] text-scout-charcoal/50">{t.id}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 sm:px-4 text-center font-bold text-scout-navy text-xs sm:text-sm">
                                                {t.totalWins}
                                            </td>
                                            <td className="py-3 px-2 sm:px-4 text-center font-black text-scout-green-light text-xs sm:text-sm">
                                                {entries}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {sortedTeams.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="text-center py-6 text-xs text-scout-charcoal/50">
                                            {isAr ? "لا توجد منتخبات مضافة بعد." : "No teams configured yet."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Rules & Reveal Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Rules Card */}
                    <div className="glass-panel p-4 sm:p-6 rounded-2xl shadow-md bg-white">
                        <h3 className="text-lg font-bold font-display text-scout-navy mb-3">
                            📋 {isAr ? "شروط وقواعد المسابقة" : "Raffle Rules & Formula"}
                        </h3>
                        <ul className="space-y-2.5 text-xs text-scout-charcoal/80">
                            <li className="flex items-start gap-2">
                                <span className="text-scout-gold font-bold">1.</span>
                                <span>
                                    {isAr
                                        ? "كل تذكرة تشتريها تضمن لك بطاقة واحدة (1) كحد أدنى للدخول في السحب النهائي."
                                        : "Every ticket you purchase guarantees you at least one (1) entry in the final draw."}
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-scout-gold font-bold">2.</span>
                                <span>
                                    {isAr
                                        ? "في كل مرة يفوز فيها المنتخب المخصص لتذكرتك بمباراة في كأس العالم، تحصل على بطاقة إضافية (+1) في السحب."
                                        : "Every time the team assigned to your ticket wins a match in the World Cup, you gain one (+1) bonus entry."}
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-scout-gold font-bold">3.</span>
                                <span>
                                    {isAr
                                        ? "المعادلة البسيطة: إجمالي بطاقات السحب للتذكرة = 1 (مضمونة) + عدد انتصارات المنتخب."
                                        : "The Simple Formula: Total Raffle Entries = 1 (Guaranteed) + Team Wins."}
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-scout-gold font-bold">4.</span>
                                <span>
                                    {isAr
                                        ? "المنتخبات التي لا تحقق أي فوز تحتفظ بفرصتها المضمونة (بطاقة واحدة) كاملة للدخول في السحب."
                                        : "Teams with zero wins still retain their guaranteed entry (1 ticket) in the draw."}
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Reveal & Prize Card */}
                    <div className="glass-panel p-4 sm:p-6 rounded-2xl shadow-md bg-white flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-bold font-display text-scout-navy mb-3">
                                🎁 {isAr ? "سحب وإعلان الجوائز" : "Draw & Prize Details"}
                            </h3>
                            <p className="text-xs text-scout-charcoal/85 leading-relaxed">
                                {isAr
                                    ? "سيتم إجراء السحب النهائي على الجوائز القيّمة وإعلان الفائزين مباشرة بعد انتهاء بطولة كأس العالم في حفل كشفي خاص وعلى صفحاتنا الرسمية."
                                    : "All raffle entries will be compiled at the end of the World Cup tournament. We will draw and reveal the winners live on our official pages during our scout ceremony."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Copyright footer */}
                <div className="text-center py-6 border-t border-scout-beige-dark mt-6">
                    <span className="text-[10px] text-scout-charcoal/60 block">
                        © {new Date().getFullYear()} Scouts des Cèdres Jbeil. All rights reserved.
                    </span>
                </div>
            </main>
        </div>
    );
}

export default function PublicStandings() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-scout-beige">
                <span className="animate-spin border-4 border-scout-navy border-t-transparent rounded-full w-12 h-12" />
            </div>
        }>
            <StandingsContent />
        </Suspense>
    );
}
