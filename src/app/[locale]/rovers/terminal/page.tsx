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
