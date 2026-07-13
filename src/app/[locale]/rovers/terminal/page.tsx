import React from "react";
import { redirect } from "next/navigation";
import { getRoverSession } from "@/app/actions/rovers";
import { prisma } from "@/lib/prisma";
import QuestCard from "./QuestCard";
import PhoneRegistrationBanner from "./PhoneRegistrationBanner";
import { QuestPhase } from "@prisma/client";

interface PageProps {
    params: Promise<{ locale: string }>;
}

export default async function TerminalPage({ params }: PageProps) {
    const { locale } = await params;
    const session = await getRoverSession();

    if (!session) {
        redirect(`/${locale}/login`);
    }

    const isAdmin = session.profile.role === "admin";

    // Load released quests ordered by unlock date. Normal rovers only see unlocked ones.
    // We offset the server time comparison by +3 hours to align with local Lebanon timezone (UTC+3)
    const campNow = new Date(Date.now() + 3 * 60 * 60 * 1000);
    const quests = await prisma.quest.findMany({
        where: {
            isReleased: true,
            ...(isAdmin ? {} : { unlockedAtDate: { lte: campNow } }),
        },
        orderBy: { unlockedAtDate: "asc" },
        include: {
            completions: {
                where: { roverId: session.profile.id },
            },
        },
    });

    // Group quests by calendar date (formatted as text)
    const groupedQuests: Record<string, typeof quests> = {};
    quests.forEach((q) => {
        const dateStr = new Date(q.unlockedAtDate).toLocaleDateString(
            locale === "ar" ? "ar-EG" : "en-US",
            {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
            }
        );
        if (!groupedQuests[dateStr]) {
            groupedQuests[dateStr] = [];
        }
        groupedQuests[dateStr].push(q);
    });

    const hasQuests = quests.length > 0;

    // Split into PRE_CAMP and LIVE_CAMP for stats display
    const preCampQuests = quests.filter((q) => q.phase === QuestPhase.PRE_CAMP);
    const liveCampQuests = quests.filter((q) => q.phase === QuestPhase.LIVE_CAMP);

    const completedCount = quests.filter((q) =>
        q.completions.some((c) => c.isVerified)
    ).length;

    const initialPhone = session.roverProfile?.phoneNumber || "";

    // Query faction score stats
    const alphaCreditsRes = await prisma.roverProfile.aggregate({
        where: { faction: "ALPHA" },
        _sum: { roverCredits: true },
    });
    const bravoCreditsRes = await prisma.roverProfile.aggregate({
        where: { faction: "BRAVO" },
        _sum: { roverCredits: true },
    });

    const alphaCredits = alphaCreditsRes._sum.roverCredits || 0;
    const bravoCredits = bravoCreditsRes._sum.roverCredits || 0;
    const totalCredits = alphaCredits + bravoCredits;
    const alphaCreditsPct = totalCredits > 0 ? Math.round((alphaCredits / totalCredits) * 100) : 50;
    const bravoCreditsPct = totalCredits > 0 ? 100 - alphaCreditsPct : 50;

    const alphaNodes = await prisma.geoNode.count({ where: { controllingFaction: "ALPHA" } });
    const bravoNodes = await prisma.geoNode.count({ where: { controllingFaction: "BRAVO" } });
    const totalNodes = alphaNodes + bravoNodes;
    const alphaNodesPct = totalNodes > 0 ? Math.round((alphaNodes / totalNodes) * 100) : 50;
    const bravoNodesPct = totalNodes > 0 ? 100 - alphaNodesPct : 50;


    return (
        <div className="flex flex-col gap-6">
            {/* Diagnostics / Mission Overview Panel */}
            <section className="bg-zinc-950/40 border border-amber-500/20 rounded-lg p-4 sm:p-6 shadow-[0_0_15px_rgba(0,0,0,0.6)]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold tracking-widest text-amber-400">
                            HELIOS_MISSION_CONTROL_
                        </h2>
                        <p className="text-zinc-500 text-xs mt-1">
                            Active Phase: Pre-Camp Countdown (July 8) & Live Camp Operations (July 14 - 26)
                        </p>
                    </div>
                    <div className="flex gap-4 text-xs font-semibold bg-black/60 border border-amber-500/10 px-4 py-2 rounded">
                        <div>
                            <span className="text-amber-500/60 uppercase">TOTAL_QUESTS:</span>{" "}
                            <span className="text-amber-400">{quests.length}</span>
                        </div>
                        <div className="border-l border-amber-500/20 pl-4">
                            <span className="text-amber-500/60 uppercase">DECRYPTED:</span>{" "}
                            <span className="text-green-400">{completedCount}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Faction Domination HUD */}
            <section className="bg-zinc-950/40 border border-amber-500/20 rounded-lg p-4 sm:p-5 shadow-[0_0_15px_rgba(0,0,0,0.5)] flex flex-col gap-4 font-mono">
                <div className="flex justify-between items-center border-b border-amber-500/10 pb-2">
                    <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                        🛰️ FACTION_CONTROL_MATRIX_
                    </h3>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                        System Standings
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Stat 1: Faction Credits standing */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
                            <span className="text-red-400">Alpha: {alphaCredits} CR ({alphaCreditsPct}%)</span>
                            <span className="text-zinc-500 font-mono">CREDITS INTAKE</span>
                            <span className="text-blue-400">({bravoCreditsPct}%) {bravoCredits} CR :Bravo</span>
                        </div>
                        <div className="h-2 rounded overflow-hidden flex bg-zinc-900 border border-zinc-800">
                            <div className="bg-gradient-to-r from-red-600 to-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-500" style={{ width: `${alphaCreditsPct}%` }} />
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-500" style={{ width: `${bravoCreditsPct}%` }} />
                        </div>
                    </div>

                    {/* Stat 2: Node Ownership standings */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
                            <span className="text-red-400">Alpha: {alphaNodes} Nodes ({alphaNodesPct}%)</span>
                            <span className="text-zinc-500 font-mono">TERRITORY CONTROL</span>
                            <span className="text-blue-400">({bravoNodesPct}%) {bravoNodes} Nodes :Bravo</span>
                        </div>
                        <div className="h-2 rounded overflow-hidden flex bg-zinc-900 border border-zinc-800">
                            <div className="bg-gradient-to-r from-red-600 to-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-500" style={{ width: `${alphaNodesPct}%` }} />
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-500" style={{ width: `${bravoNodesPct}%` }} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Phone registration banner if no phone is set */}
            <PhoneRegistrationBanner roverId={session.profile.id} initialPhone={initialPhone} />


            {/* Main Quest List grouped by Day */}
            <div className="flex flex-col gap-8">
                {!hasQuests ? (
                    <div className="text-center py-16 border border-dashed border-amber-500/20 bg-zinc-950/20 rounded-lg">
                        <span className="text-3xl">📴</span>
                        <h3 className="text-amber-400/80 font-bold mt-3 uppercase tracking-widest">
                            No Active Quests Found
                        </h3>
                        <p className="text-zinc-500 text-xs mt-1">
                            Mission Control has not released any quests. Standby for countdown drop.
                        </p>
                    </div>
                ) : (
                    Object.keys(groupedQuests).map((dateStr, idx) => (
                        <div key={idx} className="flex flex-col gap-4">
                            {/* Day Header */}
                            <div className="flex items-center gap-4">
                                <h3 className="text-xs font-bold text-amber-400/90 tracking-widest uppercase bg-amber-950/20 border border-amber-500/20 px-3 py-1.5 rounded">
                                    📅 {dateStr}
                                </h3>
                                <div className="h-[1px] bg-amber-500/10 flex-grow" />
                            </div>

                            {/* Quest Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {groupedQuests[dateStr].map((quest) => {
                                    const userCompletion = quest.completions[0] || null;
                                    return (
                                        <QuestCard
                                            key={quest.id}
                                            quest={quest}
                                            completion={userCompletion}
                                            locale={locale}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
