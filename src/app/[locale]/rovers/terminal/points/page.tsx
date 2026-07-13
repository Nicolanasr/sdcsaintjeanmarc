import React from "react";
import { redirect } from "next/navigation";
import { getRoverSession, getScoutPointHistory } from "@/app/actions/rovers";

interface PageProps {
    params: Promise<{ locale: string }>;
}

export default async function ScoutPointsPage({ params }: PageProps) {
    const { locale } = await params;
    const session = await getRoverSession();

    if (!session) {
        redirect(`/${locale}/login`);
    }

    const res = await getScoutPointHistory();
    const history = res.success ? res.history || [] : [];

    return (
        <div className="flex flex-col gap-6 font-mono max-w-2xl mx-auto w-full">
            {/* Header Card */}
            <div className="flex justify-between items-center bg-zinc-950/40 border border-amber-500/20 rounded-lg p-4 sm:p-5 shadow-[0_0_15px_rgba(0,0,0,0.6)]">
                <div>
                    <h2 className="text-lg font-bold tracking-widest text-amber-400">
                        💳 CREDITS_LEDGER_
                    </h2>
                    <p className="text-zinc-500 text-[10px] uppercase tracking-wider mt-0.5">
                        Your transaction timeline and points history
                    </p>
                </div>
                <a 
                    href={`/${locale}/rovers/terminal`}
                    className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400 text-amber-400 font-extrabold text-xs rounded transition uppercase tracking-wider"
                >
                    [CLOSE_]
                </a>
            </div>

            {/* Total Balance Card */}
            <div className="bg-zinc-950/40 border border-amber-500/20 rounded-lg p-5 flex justify-between items-center shadow-[inset_0_0_10px_rgba(245,158,11,0.05)]">
                <div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Active Balance</div>
                    <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                        {session.roverProfile?.roverCredits ?? 0} <span className="text-xs text-amber-500/60 font-normal">CR</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Faction Network</div>
                    <span className={`inline-block mt-2 text-xs px-2.5 py-1 rounded font-extrabold border uppercase tracking-wider ${
                        session.roverProfile?.faction === "ALPHA"
                            ? "bg-red-950/20 border-red-500/40 text-red-500"
                            : "bg-blue-950/20 border-blue-500/40 text-blue-500"
                    }`}>
                        {session.roverProfile?.faction || "UNASSIGNED"}
                    </span>
                </div>
            </div>

            {/* Timeline */}
            <div className="bg-zinc-950/40 border border-amber-500/20 rounded-lg p-5 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <div className="text-[10px] font-bold text-amber-500/60 uppercase border-b border-amber-500/10 pb-2 mb-4">
                    TRANSACTIONS_LOG
                </div>

                <div className="flex flex-col gap-3 min-h-[250px]">
                    {history.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="text-3xl">📭</span>
                            <h3 className="text-zinc-500 text-xs font-bold uppercase mt-2">No Transactions Registered</h3>
                            <p className="text-zinc-600 text-[10px] uppercase mt-1">Complete quests or conquer sectors to earn credits.</p>
                        </div>
                    ) : (
                        history.map((item, idx) => {
                            const dateObj = new Date(item.timestamp);
                            const dateStr = dateObj.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
                                month: "short",
                                day: "numeric",
                            });
                            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            const isPositive = item.change > 0;
                            return (
                                <div key={idx} className="flex justify-between gap-4 text-xs items-center border-b border-amber-500/5 pb-3 last:border-0 last:pb-0">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-zinc-300 font-semibold leading-relaxed">
                                            {item.description}
                                        </span>
                                        <div className="flex gap-2 text-[10px] text-zinc-500 font-bold uppercase">
                                            <span>[{item.type}]</span>
                                            <span>{dateStr} {timeStr}</span>
                                        </div>
                                    </div>
                                    <div className={`font-mono font-black text-sm shrink-0 ${
                                        isPositive ? "text-green-400" : "text-red-500"
                                    }`}>
                                        {isPositive ? `+${item.change}` : item.change} CR
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
