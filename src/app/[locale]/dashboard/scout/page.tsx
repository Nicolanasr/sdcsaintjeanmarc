"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Team {
  id: string;
  name: string;
  flagUrl: string;
  totalGoals: number;
}

interface ScoutStats {
  ticketsSold: number;
  cashCollected: number;
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
  const [stats, setStats] = useState<ScoutStats>({ ticketsSold: 0, cashCollected: 0 });
  const [teams, setTeams] = useState<Team[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Form State
  const [buyerName, setBuyerName] = useState("");
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

    setSubmitting(true);
    try {
      const res = await fetch("/api/scout/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName,
          buyerPhone,
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
    const msg = isAr
      ? `شكرًا لشرائك تذكرة مسابقة Goal Rush رقم #${ticket.id} لدعم كشافة الأرز! فريقك المختار هو ${teamName}. كل هدف يسجله هذا الفريق يمنحك فرصة إضافية في السحب النهائي! ⚽️`
      : `Thank you for purchasing World Cup Goal Rush ticket #${ticket.id} supporting Scouts des Cèdres! Your selected team is ${teamName}. Every goal they score grants you an extra entry in the final raffle! ⚽️`;
    
    // Normalize phone number (strip non-digits, ensure country code)
    const cleanPhone = ticket.buyerPhone.replace(/\D/g, "");
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;
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
              onClick={() => router.push(`/${locale}/dashboard/admin`)}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-scout-beige-dark/50 p-4 rounded-xl text-center">
                <span className="block text-2xl font-extrabold text-scout-navy">
                  {stats.ticketsSold}
                </span>
                <span className="text-xs text-scout-charcoal/60">
                  {isAr ? "تذكرة مباعة" : "Tickets Sold"}
                </span>
              </div>
              <div className="bg-scout-beige-dark/50 p-4 rounded-xl text-center">
                <span className="block text-2xl font-extrabold text-scout-gold-light">
                  ${stats.cashCollected}
                </span>
                <span className="text-xs text-scout-charcoal/60">
                  {isAr ? "مبلغ مجموع" : "Cash Collected"}
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
                    className={`flex items-center justify-between p-3 rounded-lg text-sm ${
                      isCurrentUser
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
              {isAr ? "تسجيل تذكرة بيع كاش جديدة" : "Record New Cash Ticket Sale"}
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
                    {isAr ? "رقم هاتف المشتري (مع رمز البلد)" : "Buyer's Phone (incl. Country Code)"}
                  </label>
                  <input
                    type="tel"
                    required
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-scout-beige-dark bg-white focus:border-scout-navy focus:outline-none transition"
                    placeholder="+961 70 123 456"
                  />
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
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
                          selectedTeamId === t.id
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
                  isAr ? "تأكيد استلام المبلغ المالي ($5)" : "Confirm Cash Received ($5)"
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
                <a
                  href={getWhatsAppLink(successTicket)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold rounded-lg shadow-md transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.436 0 9.86-4.42 9.863-9.864.001-2.636-1.023-5.11-2.884-6.978C16.388 1.895 13.91 .87 11.272.87 5.836.87 1.412 5.29 1.409 10.735c0 1.562.415 3.09 1.202 4.437l-.992 3.628 3.72-.976-.292.17z" />
                  </svg>
                  <span>{isAr ? "مشاركة واتساب" : "WhatsApp Share"}</span>
                </a>
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
