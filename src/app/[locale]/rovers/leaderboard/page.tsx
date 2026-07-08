import React from "react";
import { redirect } from "next/navigation";
import { getRoverSession } from "@/app/actions/rovers";
import { prisma } from "@/lib/prisma";

interface PageProps {
    params: Promise<{ locale: string }>;
}

export default async function LeaderboardPage({ params }: PageProps) {
    const { locale } = await params;
    const session = await getRoverSession();

    if (!session) {
        redirect(`/${locale}/login`);
    }

    // Query all scouts with rover profiles, sorted by credits desc
    const leaderboard = await prisma.roverProfile.findMany({
        orderBy: {
            roverCredits: "desc",
        },
        include: {
            profile: true,
        },
        where: {
            faction: {
                not: null
            }
        }
    });

    // Calculate stats
    const alphaTotal = leaderboard
        .filter((l) => l.faction === "ALPHA")
        .reduce((sum, current) => sum + current.roverCredits, 0);

    const bravoTotal = leaderboard
        .filter((l) => l.faction === "BRAVO")
        .reduce((sum, current) => sum + current.roverCredits, 0);

    return (
        <div className="flex flex-col gap-6">
            {/* Overview Panel */}
            <section className="bg-zinc-950/40 border border-amber-500/20 rounded-lg p-4 sm:p-6 shadow-[0_0_15px_rgba(0,0,0,0.6)]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold tracking-widest text-amber-400">
                            HELIOS_LEADERBOARD_
                        </h2>
                        <p className="text-zinc-500 text-xs mt-1">
                            Live rankings of all scouts based on accumulated mission credits.
                        </p>
                    </div>
                    <div className="flex gap-4 text-xs font-semibold bg-black/60 border border-amber-500/10 px-4 py-2 rounded">
                        <div className="flex flex-col items-center">
                            <span className="text-[9px] text-amber-500/60 uppercase">ALPHA FACTION</span>{" "}
                            <span className="text-amber-400 font-extrabold text-sm">{alphaTotal} CR</span>
                        </div>
                        <div className="border-l border-amber-500/20 pl-4 flex flex-col items-center">
                            <span className="text-[9px] text-amber-500/60 uppercase">BRAVO FACTION</span>{" "}
                            <span className="text-amber-400 font-extrabold text-sm">{bravoTotal} CR</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Ranks List */}
            <div className="bg-zinc-950/60 border border-amber-500/20 rounded-lg p-4 sm:p-6 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-amber-500/20 text-amber-500/60 text-[10px] uppercase font-bold tracking-wider">
                                <th className="py-3 px-4 text-center w-16">Rank</th>
                                <th className="py-3 px-4">Scout Name</th>
                                <th className="py-3 px-4 text-center">Faction</th>
                                <th className="py-3 px-4 text-center">Unit / Section</th>
                                <th className="py-3 px-4 text-right pr-6">Credits Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-zinc-500 italic">
                                        No active scout records to display.
                                    </td>
                                </tr>
                            ) : (
                                leaderboard.map((rover, index) => {
                                    const rank = index + 1;
                                    const isTopThree = rank <= 3;
                                    const isCurrentUser = rover.profileId === session.profile.id;

                                    // Define rank styling
                                    const rankBadge =
                                        rank === 1
                                            ? "🥇 1ST"
                                            : rank === 2
                                                ? "🥈 2ND"
                                                : rank === 3
                                                    ? "🥉 3RD"
                                                    : `#${rank}`;

                                    const factionBadgeColor =
                                        rover.faction === "ALPHA"
                                            ? "bg-amber-950/40 text-amber-400 border-amber-500/20"
                                            : rover.faction === "BRAVO"
                                                ? "bg-amber-950/40 text-amber-400 border-amber-500/20"
                                                : "bg-zinc-900/40 text-zinc-400 border-zinc-800";

                                    return (
                                        <tr
                                            key={rover.profileId}
                                            className={`border-b border-amber-500/5 transition duration-200 ${isCurrentUser
                                                ? "bg-amber-500/10 border-amber-500/30 text-amber-300 font-extrabold"
                                                : "hover:bg-zinc-900/40 text-zinc-300"
                                                }`}
                                        >
                                            <td className="py-4 px-4 text-center font-bold">
                                                <span
                                                    className={`inline-block px-2.5 py-1 rounded text-[10px] tracking-wider uppercase font-black ${isTopThree
                                                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                                        : "text-zinc-500"
                                                        }`}
                                                >
                                                    {rankBadge}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 font-bold flex items-center gap-2">
                                                {rover.profile.fullName}
                                                {isCurrentUser && (
                                                    <span className="text-[8px] bg-amber-500 text-black px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
                                                        YOU
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span
                                                    className={`px-2.5 py-0.5 rounded text-[9px] uppercase border font-bold ${factionBadgeColor}`}
                                                >
                                                    {rover.faction || "UNASSIGNED"}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center font-mono text-zinc-400">
                                                {rover.profile.unit || "N/A"}
                                            </td>
                                            <td className="py-4 px-4 text-right pr-6 font-extrabold font-mono text-amber-400 text-sm">
                                                {rover.roverCredits} CR
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
