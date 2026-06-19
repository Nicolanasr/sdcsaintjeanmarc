"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";

interface Team {
  id: string;
  name: string;
  flagUrl: string;
  totalGoals: number;
  podiumFinish: number | null;
  isEliminated: boolean;
}

function StandingsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const locale = params.locale as string;
  const isAr = locale === "ar";
  const ticketIdParam = searchParams.get("ticket_id");

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
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

  const triggerSearch = async (id: string) => {
    setSearching(true);
    setSearchError("");
    setSearchResult(null);

    try {
      const res = await fetch(`/api/public/ticket?id=${id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ticket search failed");
      }

      setSearchResult(data.ticket);
    } catch (err: any) {
      setSearchError(err.message || "Ticket not found");
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

  const getTeamMultiplier = (team: any) => {
    if (!team) return 1;
    if (team.podiumFinish === 1) return 3;
    if (team.podiumFinish === 2) return 2;
    if (team.podiumFinish === 3) return 1.5;
    return 1;
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
    const podiumA = a.podiumFinish ?? 999;
    const podiumB = b.podiumFinish ?? 999;
    if (podiumA !== podiumB) return podiumA - podiumB;
    if (b.totalGoals !== a.totalGoals) return b.totalGoals - a.totalGoals;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="min-h-screen bg-scout-beige text-scout-charcoal">
      {/* Header Banner */}
      <header className="bg-scout-navy text-white py-8 px-6 text-center shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-scout-green-light/10 blur-xl scale-150" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-scout-gold tracking-tight">
            {isAr ? "مسابقة Goal Rush - كشافة الأرز" : "Goal Rush Fundraising Portal"}
          </h1>
          <p className="text-sm text-white/80 mt-2 max-w-xl mx-auto">
            {isAr
              ? "تابع نتائج تذكرتك وترتيب منتخبات كأس العالم ٢٠٢٦"
              : "Check your ticket results and monitor the World Cup 2026 team standings."}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Sync Disclaimer */}
        <div className="bg-scout-gold/10 border-l-4 border-scout-gold p-4 rounded-xl text-xs text-scout-navy font-medium">
          ⚠️ {isAr 
            ? "تنبيه: لا يتم تحديث هذه الصفحة مباشرة في نفس اللحظة. نرجو التحقق لاحقًا إذا كانت أهداف منتخبكم لا تطابق نتائج المباريات المباشرة بدقة."
            : "Please note: This page is updated daily and may not reflect real-time live match statistics immediately. If goals scored do not match live results exactly, check back later."}
        </div>

        {/* Search Ticket Card */}
        <div className="glass-panel p-6 rounded-2xl shadow-md border border-scout-beige-dark bg-white/70">
          <h2 className="text-lg font-bold font-display text-scout-navy mb-4">
            🔍 {isAr ? "ابحث عن تذكرتك الكاش" : "Look Up Your Ticket"}
          </h2>
          <form onSubmit={handleSearchForm} className="flex gap-4">
            <input
              type="text"
              required
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder={isAr ? "أدخل رقم التذكرة (مثال: 1042)..." : "Enter your Ticket ID (e.g. 1042)..."}
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

          {searchResult && (
            <div className="mt-6 bg-white p-5 rounded-xl border border-scout-gold/30 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 mb-4 gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-scout-charcoal/50">
                    {isAr ? "رقم التذكرة" : "Ticket Number"}
                  </span>
                  <h4 className="text-xl font-extrabold text-scout-navy">
                    #{searchResult.id}
                  </h4>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-scout-charcoal/50 block">
                    {isAr ? "اسم المشتري" : "Buyer Name"}
                  </span>
                  <span className="font-bold text-scout-navy text-base">
                    {searchResult.buyerName}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-scout-beige p-3 rounded-lg border">
                  <span className="block text-[10px] text-scout-charcoal/50 font-bold mb-1">
                    {isAr ? "المنتخب المختار" : "Selected Team"}
                  </span>
                  <div className="flex items-center justify-center gap-1.5">
                    <img
                      src={searchResult.team?.flagUrl}
                      alt={searchResult.team?.name}
                      className="w-5 h-3.5 object-cover rounded shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://flagcdn.com/un.svg";
                      }}
                    />
                    <span className="font-extrabold text-scout-navy text-xs">
                      {searchResult.team?.name || searchResult.teamId}
                    </span>
                  </div>
                </div>

                <div className="bg-scout-beige p-3 rounded-lg border">
                  <span className="block text-[10px] text-scout-charcoal/50 font-bold mb-1">
                    {isAr ? "الأهداف المسجلة" : "Goals Scored"}
                  </span>
                  <span className="text-base font-extrabold text-scout-navy">
                    {searchResult.team?.totalGoals || 0}
                  </span>
                </div>

                <div className="bg-scout-beige p-3 rounded-lg border">
                  <span className="block text-[10px] text-scout-charcoal/50 font-bold mb-1">
                    {isAr ? "المضاعف الحالي" : "Current Multiplier"}
                  </span>
                  <span className="text-base font-extrabold text-scout-gold">
                    {getTeamMultiplier(searchResult.team)}x
                  </span>
                </div>

                <div className="bg-scout-beige p-3 rounded-lg border border-scout-gold/20 bg-scout-gold/5">
                  <span className="block text-[10px] text-scout-gold font-bold mb-1">
                    {isAr ? "إجمالي البطاقات بالسحب" : "Total Raffle Entries"}
                  </span>
                  <span className="text-base font-black text-scout-green-light">
                    {Math.floor((searchResult.team?.totalGoals || 0) * getTeamMultiplier(searchResult.team))}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t text-[11px] text-scout-charcoal/60 flex justify-between">
                <span>
                  {isAr ? `الكشاف المسؤول: ${searchResult.scout?.fullName || "مخفي"}` : `Sold by Scout: ${searchResult.scout?.fullName || "Hidden"}`}
                </span>
                <span>
                  {isAr ? "حساب مدفوع نقداً ($5)" : "Payment Confirmed ($5 Cash)"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Read-Only Teams Standing Table */}
        <div className="glass-panel p-6 rounded-2xl shadow-md bg-white">
          <h2 className="text-xl font-bold font-display text-scout-navy mb-4 border-b pb-2">
            🏆 {isAr ? "ترتيب المنتخبات ومضاعفات السحب" : "World Cup Teams Raffle Standings"}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b text-scout-navy font-bold">
                  <th className="py-3 px-4">{isAr ? "الترتيب / المنتخب" : "Standings / Team"}</th>
                  <th className="py-3 px-4 text-center">{isAr ? "إجمالي الأهداف" : "Total Goals"}</th>
                  <th className="py-3 px-4 text-center">{isAr ? "المضاعف" : "Multiplier"}</th>
                  <th className="py-3 px-4 text-center">{isAr ? "البطاقات لكل تذكرة" : "Entries per Ticket"}</th>
                  <th className="py-3 px-4 text-center">{isAr ? "الحالة" : "Status"}</th>
                </tr>
              </thead>
              <tbody>
                {sortedTeams.map((t, idx) => {
                  const multiplier = getTeamMultiplier(t);
                  const entries = Math.floor(t.totalGoals * multiplier);
                  let statusLabel = isAr ? "نشط" : "Active";
                  let statusColor = "text-scout-green-light bg-scout-green/10";

                  if (t.podiumFinish === 1) {
                    statusLabel = isAr ? "🥇 البطل" : "🥇 Champions";
                    statusColor = "text-scout-gold bg-scout-gold/15";
                  } else if (t.podiumFinish === 2) {
                    statusLabel = isAr ? "🥈 المركز الثاني" : "🥈 2nd Place";
                    statusColor = "text-scout-navy bg-scout-navy/10";
                  } else if (t.podiumFinish === 3) {
                    statusLabel = isAr ? "🥉 المركز الثالث" : "🥉 3rd Place";
                    statusColor = "text-scout-terracotta bg-scout-terracotta/10";
                  } else if (t.isEliminated) {
                    statusLabel = isAr ? "مقصى" : "Eliminated";
                    statusColor = "text-scout-charcoal/50 bg-scout-charcoal/5";
                  }

                  return (
                    <tr key={t.id} className="border-b hover:bg-scout-beige-dark/20 transition">
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
                      <td className="py-3 px-4 text-center font-bold text-scout-navy">
                        {t.totalGoals}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-scout-gold">
                        {multiplier}x
                      </td>
                      <td className="py-3 px-4 text-center font-black text-scout-green-light">
                        {entries}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {sortedTeams.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-xs text-scout-charcoal/50">
                      {isAr ? "لا توجد منتخبات مضافة بعد." : "No teams configured yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
