"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Team {
  id: string;
  name: string;
  flagUrl: string;
  totalGoals: number;
  podiumFinish: number | null;
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
          router.replace(`/${locale}/dashboard/scout`);
          return;
        }

        setProfile(userData.user);
        await loadAdminData();
      } catch (err) {
        router.replace(`/${locale}/dashboard/scout`);
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
            {isAr ? "إدارة مسابقة Goal Rush وسحب القرعة" : "Manage Goal Rush & Draw Raffle"}
          </p>
        </div>
        <button
          onClick={() => router.push(`/${locale}/dashboard/scout`)}
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
              onClick={handleSeedTeams}
              className="mt-6 w-full py-2 border border-scout-navy text-scout-navy text-xs font-semibold rounded-lg hover:bg-scout-navy hover:text-white transition cursor-pointer"
            >
              {isAr ? "تغذية تلقائية للفرق الأساسية" : "Seed Default Teams"}
            </button>
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
                  <th className="py-3 px-4">{isAr ? "الترتيب / المنتخب" : "Standings / Team"}</th>
                  <th className="py-3 px-4 text-center">{isAr ? "إجمالي الأهداف" : "Total Goals"}</th>
                  <th className="py-3 px-4 text-center">{isAr ? "منصة التتويج" : "Podium Finish"}</th>
                  <th className="py-3 px-4 text-center">{isAr ? "المضاعف" : "Multiplier"}</th>
                  <th className="py-3 px-4 text-center">{isAr ? "البطاقات لكل تذكرة" : "Entries per Ticket"}</th>
                  <th className="py-3 px-4 text-center">{isAr ? "الحالة" : "Status"}</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const sorted = [...teams].sort((a, b) => {
                    const podiumA = a.podiumFinish ?? 999;
                    const podiumB = b.podiumFinish ?? 999;
                    if (podiumA !== podiumB) return podiumA - podiumB;
                    if (b.totalGoals !== a.totalGoals) return b.totalGoals - a.totalGoals;
                    return a.name.localeCompare(b.name);
                  });

                  return sorted
                    .filter((t) =>
                      t.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
                      t.id.toLowerCase().includes(teamSearch.toLowerCase())
                    )
                    .map((t, idx) => {
                      let multiplier = 1;
                      if (t.podiumFinish === 1) multiplier = 3;
                      else if (t.podiumFinish === 2) multiplier = 2;
                      else if (t.podiumFinish === 3) multiplier = 1.5;

                      const totalEntries = Math.floor(t.totalGoals * multiplier);

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
                                  onClick={() => handleUpdateTeam(t.id, { totalGoals: Math.max(0, t.totalGoals - 1) })}
                                  className="w-6 h-6 rounded bg-scout-beige-dark/50 hover:bg-scout-beige-dark font-bold text-xs"
                                >
                                  -
                                </button>
                                <span className="w-8 font-extrabold text-scout-navy">{t.totalGoals}</span>
                                <button
                                  onClick={() => handleUpdateTeam(t.id, { totalGoals: t.totalGoals + 1 })}
                                  className="w-6 h-6 rounded bg-scout-beige-dark/50 hover:bg-scout-beige-dark font-bold text-xs"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <span className="font-extrabold text-scout-navy">{t.totalGoals}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isEditing ? (
                              <select
                                value={t.podiumFinish || ""}
                                onChange={(e) =>
                                  handleUpdateTeam(t.id, {
                                    podiumFinish: e.target.value ? parseInt(e.target.value) : null,
                                  })
                                }
                                className="px-2 py-1 rounded border text-xs bg-white focus:outline-none"
                              >
                                <option value="">{isAr ? "لم يحدد" : "None"}</option>
                                <option value="1">🥇 1st Place (3x)</option>
                                <option value="2">🥈 2nd Place (2x)</option>
                                <option value="3">🥉 3rd Place (1.5x)</option>
                              </select>
                            ) : (
                              <span className="text-xs font-semibold text-scout-charcoal/80">
                                {t.podiumFinish === 1 && "🥇 1st Place"}
                                {t.podiumFinish === 2 && "🥈 2nd Place"}
                                {t.podiumFinish === 3 && "🥉 3rd Place"}
                                {!t.podiumFinish && "-"}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-scout-gold">
                            {multiplier}x
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

        {/* Scout Sales Log Section */}
        <div className="glass-panel p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-bold font-display text-scout-navy mb-4 border-b pb-2">
            {isAr ? "سجل مبيعات تذاكر الكشافة" : "Scout Ticket Sales Log"}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b text-scout-navy font-bold">
                  <th className="py-3 px-4">{isAr ? "رقم التذكرة" : "Ticket #"}</th>
                  <th className="py-3 px-4">{isAr ? "اسم الكشاف" : "Scout Name"}</th>
                  <th className="py-3 px-4">{isAr ? "المشتري" : "Buyer Name"}</th>
                  <th className="py-3 px-4">{isAr ? "رقم الهاتف" : "Phone"}</th>
                  <th className="py-3 px-4">{isAr ? "المنتخب المختار" : "Selected Team"}</th>
                  <th className="py-3 px-4 text-center">{isAr ? "التاريخ" : "Purchase Date"}</th>
                </tr>
              </thead>
              <tbody>
                {allTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b hover:bg-white/30 transition">
                    <td className="py-3 px-4 font-bold text-scout-gold">
                      #{ticket.id}
                    </td>
                    <td className="py-3 px-4">
                      {ticket.scout?.fullName || "Unknown Scout"}
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
                    <td className="py-3 px-4 text-center text-xs text-scout-charcoal/60">
                      {new Date(ticket.createdAt).toLocaleString(
                        locale === "ar" ? "ar-EG" : "en-US",
                        {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }
                      )}
                    </td>
                  </tr>
                ))}
                {allTickets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-xs text-scout-charcoal/50">
                      {isAr ? "لا توجد مبيعات تذاكر مسجلة بعد." : "No ticket sales recorded yet."}
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
