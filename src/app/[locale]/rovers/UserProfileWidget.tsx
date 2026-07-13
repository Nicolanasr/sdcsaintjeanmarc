"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { getRoverIdentityData } from "@/app/actions/rovers";
import CyberIDCard from "./nav/CyberIDCard";
import { cyberAudio } from "@/utils/audio";

interface UserProfileWidgetProps {
    fullName: string;
    faction: string;
    credits: number;
    logoutAction: () => void;
    locale: string;
}

export default function UserProfileWidget({ fullName, faction, credits, logoutAction, locale }: UserProfileWidgetProps) {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [identityData, setIdentityData] = useState<{ completedQuests: any[] } | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleOpenModal = async () => {
        cyberAudio.playScan();
        setShowModal(true);
        setLoading(true);
        try {
            const data = await getRoverIdentityData();
            if (data) {
                setIdentityData({ completedQuests: data.completedQuests });
            }
        } catch (err) {
            console.error("Failed to load completed quests:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex items-center gap-4 text-xs md:text-sm">
                {/* Clickable Profile Badge */}
                <div
                    onClick={handleOpenModal}
                    className="text-right cursor-pointer group select-none border border-transparent hover:border-amber-500/30 hover:bg-amber-950/10 px-2 py-1 rounded transition duration-200"
                >
                    <div className="font-bold text-amber-300 group-hover:text-amber-400 transition-colors flex items-center gap-1.5 justify-end">
                        <span>👤</span> {fullName}
                    </div>
                    <div className="text-[9px] text-amber-500/55 uppercase tracking-widest mt-0.5 font-mono group-hover:text-amber-500/80 transition-colors">
                        VIEW_CYBER_ID_
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Clickable Credits Display */}
                    <a
                        href={`/${locale}/rovers/terminal/points`}
                        className="bg-amber-950/40 border border-amber-500/30 hover:border-amber-400 hover:bg-amber-950/60 px-3 py-1.5 rounded flex flex-col items-center min-w-[80px] shadow-[inset_0_0_6px_rgba(245,158,11,0.1)] transition duration-200 cursor-pointer"
                        title="View Points Ledger History"
                    >
                        <span className="text-[9px] text-amber-500/60 uppercase tracking-wider font-mono">Credits</span>
                        <span className="text-amber-400 font-extrabold text-lg animate-pulse font-mono">
                            {credits}
                        </span>
                    </a>

                    {/* Exit Link */}
                    <form action={logoutAction}>
                        <button
                            type="submit"
                            className="bg-red-950/20 hover:bg-red-900/40 border border-red-500/30 hover:border-red-500 text-red-500 hover:text-red-400 font-extrabold text-[10px] px-2.5 py-3 rounded transition cursor-pointer uppercase tracking-wider font-mono"
                            title="Disconnect Link"
                        >
                            EXIT_
                        </button>
                    </form>
                </div>
            </div>


            {/* Cyber-ID Global Modal */}
            {showModal && mounted && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="max-w-md w-full relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 z-50 text-zinc-500 hover:text-amber-400 font-bold uppercase transition font-mono text-xs cursor-pointer"
                        >
                            CLOSE [X]
                        </button>
                        <div className="bg-zinc-950 border border-amber-500/40 rounded-lg overflow-hidden p-6 shadow-[0_0_50px_rgba(245,158,11,0.25)]">
                            {loading ? (
                                <div className="text-center py-12 font-mono text-xs text-amber-500 animate-pulse uppercase">
                                    📡 CONNECTING TO IDENTITY DATABASE...
                                </div>
                            ) : (
                                <CyberIDCard
                                    fullName={fullName}
                                    faction={faction}
                                    credits={credits}
                                    completedQuests={identityData?.completedQuests || []}
                                />
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
