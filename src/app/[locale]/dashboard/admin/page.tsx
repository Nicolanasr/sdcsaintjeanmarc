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

  // New team form state
  const [newTeamId, setNewTeamId] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamFlag, setNewTeamFlag] = useState("");

  // Draw state
  const [drawing, setDrawing] = useState(false);
  const [winners, setWinners] = useState<any[]>([]);

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
          <h2 className="text-xl font-bold font-display text-scout-navy mb-4 border-b pb-2">
            {isAr ? "تعديل إحصائيات ومراتب المنتخبات" : "Team Standings & Goals Overrides"}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b text-scout-navy font-bold">
                  <th className="py-3 px-4">{isAr ? "المنتخب" : "Team"}</th>
                  <th className="py-3 px-4 text-center">{isAr ? "إجمالي الأهداف" : "Total Goals"}</th>
                  <th className="py-3 px-4 text-center">{isAr ? "منصة التتويج" : "Podium Finish"}</th>
                  <th className="py-3 px-4 text-center">{isAr ? "أقصي" : "Eliminated"}</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-white/30 transition">
                    <td className="py-3 px-4 flex items-center gap-3">
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
                    </td>
                    <td className="py-3 px-4 text-center">
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
                        <option value="1">🥇 1st Place (10x)</option>
                        <option value="2">🥈 2nd Place (5x)</option>
                        <option value="3">🥉 3rd Place (2x)</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={t.isEliminated}
                        onChange={(e) => handleUpdateTeam(t.id, { isEliminated: e.target.checked })}
                        className="w-4 h-4 rounded text-scout-navy accent-scout-navy focus:ring-scout-navy cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
