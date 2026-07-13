import React from "react";
import { redirect } from "next/navigation";
import { getRoverSession } from "@/app/actions/rovers";
import { prisma } from "@/lib/prisma";

interface PageProps {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ page?: string }>;
}

export default async function publicLogsPage({ params, searchParams }: PageProps) {
    const { locale } = await params;
    const { page } = await searchParams;
    const session = await getRoverSession();

    if (!session) {
        redirect(`/${locale}/login`);
    }

    const currentPage = parseInt(page || "1", 10) || 1;
    const limit = 20;
    const skip = (currentPage - 1) * limit;

    // Fetch system logs
    const logs = await prisma.whatsAppLog.findMany({
        where: {
            phone: "SYSTEM",
            status: "LOG",
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: skip,
    });

    const totalLogs = await prisma.whatsAppLog.count({
        where: {
            phone: "SYSTEM",
            status: "LOG",
        },
    });

    const totalPages = Math.max(1, Math.ceil(totalLogs / limit));

    return (
        <div className="flex flex-col gap-6 font-mono max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center bg-zinc-950/40 border border-amber-500/20 rounded-lg p-4 sm:p-5 shadow-[0_0_15px_rgba(0,0,0,0.6)]">
                <div>
                    <h2 className="text-lg font-bold tracking-widest text-amber-400">
                        🛰️ HELIOS_SYSTEM_LOGS_
                    </h2>
                    <p className="text-zinc-500 text-[10px] uppercase tracking-wider mt-0.5">
                        Historical registry of sector activations and decryptions
                    </p>
                </div>
                <a 
                    href={`/${locale}/rovers/terminal`}
                    className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400 text-amber-400 font-extrabold text-xs rounded transition uppercase tracking-wider"
                >
                    [RETURN_TO_DASH_]
                </a>
            </div>

            {/* Logs Terminal Box */}
            <div className="bg-zinc-950/40 border border-amber-500/20 rounded-lg p-5 shadow-[0_0_15px_rgba(0,0,0,0.5)] flex flex-col gap-4">
                <div className="flex justify-between items-center text-[10px] font-bold text-amber-500/60 uppercase border-b border-amber-500/10 pb-2">
                    <span>TRANSMISSION_DATA</span>
                    <span>LOG_COUNT: {totalLogs}</span>
                </div>

                <div className="flex flex-col gap-3 min-h-[300px]">
                    {logs.length === 0 ? (
                        <p className="text-zinc-600 text-xs text-center py-16">
                            No logs found in registry. System standby.
                        </p>
                    ) : (
                        logs.map((log) => {
                            const dateObj = new Date(log.createdAt);
                            const dateStr = dateObj.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
                                month: "short",
                                day: "numeric",
                            });
                            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            return (
                                <div key={log.id} className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs items-start border-b border-amber-500/5 pb-2.5 last:border-0 last:pb-0">
                                    <div className="flex gap-2 text-zinc-500 font-bold shrink-0">
                                        <span>[{dateStr}]</span>
                                        <span>[{timeStr}]</span>
                                    </div>
                                    <div className="text-zinc-300 leading-relaxed font-semibold break-words">
                                        {log.error || log.body}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center border-t border-amber-500/10 pt-4 mt-2">
                        <a
                            href={currentPage > 1 ? `/${locale}/rovers/terminal/logs?page=${currentPage - 1}` : undefined}
                            className={`px-3 py-1.5 text-xs font-bold rounded border uppercase tracking-wider transition ${
                                currentPage > 1
                                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-400 cursor-pointer"
                                    : "border-zinc-800 text-zinc-600 cursor-not-allowed opacity-40"
                            }`}
                        >
                            [PREV_PAGE]
                        </a>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">
                            Page {currentPage} of {totalPages}
                        </span>
                        <a
                            href={currentPage < totalPages ? `/${locale}/rovers/terminal/logs?page=${currentPage + 1}` : undefined}
                            className={`px-3 py-1.5 text-xs font-bold rounded border uppercase tracking-wider transition ${
                                currentPage < totalPages
                                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-400 cursor-pointer"
                                    : "border-zinc-800 text-zinc-600 cursor-not-allowed opacity-40"
                            }`}
                        >
                            [NEXT_PAGE]
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
