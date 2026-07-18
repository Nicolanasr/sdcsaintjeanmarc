"use client";

import React, { useState } from "react";
import { submitQuestCode, requestQuestLeaderSignOff } from "@/app/actions/rovers";

interface QuestCardProps {
    quest: {
        id: string;
        title: string;
        description: string;
        clueHint: string | null;
        verificationType: "DIGITAL_CODE" | "LEADER_SIGN_OFF";
        creditReward: number;
        expiresAt?: Date | string | null;
        isBlind?: boolean;
    };
    completion: {
        isVerified: boolean;
    } | null;
    locale: string;
}

export default function QuestCard({ quest, completion, locale }: QuestCardProps) {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleSubmitCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;

        setLoading(true);
        setMessage(null);

        try {
            const res = await submitQuestCode(quest.id, code);
            if (res.success) {
                setMessage({
                    type: "success",
                    text: res.isBlind ? res.message : `DECRYPTION_SUCCESSFUL: Awarded +${res.reward} credits! Terminal updated.`,
                });
                setCode("");
            } else {
                setMessage({
                    type: "error",
                    text: `DECRYPTION_FAILED: ${res.error || "Incorrect answer code."}`,
                });
            }
        } catch (err: any) {
            setMessage({
                type: "error",
                text: `SYSTEM_ERROR: ${err.message || "Request timed out."}`,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRequestSignOff = async () => {
        setLoading(true);
        setMessage(null);

        try {
            const res = await requestQuestLeaderSignOff(quest.id);
            if (res.success) {
                setMessage({
                    type: "success",
                    text: "STATUS_UPDATED: Awaiting Leader Sign-Off verification.",
                });
            } else {
                setMessage({
                    type: "error",
                    text: `REQUEST_FAILED: ${res.error || "Unknown error."}`,
                });
            }
        } catch (err: any) {
            setMessage({
                type: "error",
                text: `SYSTEM_ERROR: ${err.message || "Request timed out."}`,
            });
        } finally {
            setLoading(false);
        }
    };

    const isCompleted = completion?.isVerified === true;
    const isAwaiting = completion && completion.isVerified === false;
    const isExpired = quest.expiresAt ? new Date() > new Date(quest.expiresAt) : false;

    return (
        <div className="bg-zinc-950/60 border border-amber-500/20 rounded-lg p-5 hover:border-amber-500/40 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden group shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            {/* Laser line detail on top of card */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

            {/* Title & Reward Badge */}
            <div className="flex justify-between items-start gap-4">
                <div>
                    <h3 className="text-zinc-100 font-extrabold text-base tracking-wide group-hover:text-amber-400 transition-colors">
                        {quest.title}
                    </h3>
                    <div className="text-[10px] text-amber-500/50 uppercase mt-0.5">
                        Type: {quest.verificationType === "DIGITAL_CODE" ? "Digital cipher" : "Scout Milestone"}
                    </div>
                    {quest.expiresAt && (
                        <div className={`text-[9px] uppercase font-bold mt-1.5 flex items-center gap-1 ${isExpired ? "text-red-500 animate-pulse" : "text-amber-500/60"}`}>
                            <span>🕒</span>
                            <span>
                                {isExpired ? "EXPIRED_AT: " : "EXPIRES: "}
                                {new Date(quest.expiresAt).toLocaleString(locale === "ar" ? "ar-LB" : "en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </div>
                    )}
                </div>
                <div className="bg-amber-950/30 text-amber-400 border border-amber-500/30 text-xs px-2.5 py-1 rounded font-bold whitespace-nowrap">
                    +{quest.creditReward} CR
                </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
                {renderQuestDescription(quest.description)}
            </div>

            {/* Clue Hint */}
            {quest.clueHint && !isCompleted && !isExpired && (
                <div className="bg-amber-950/10 border border-amber-500/10 rounded p-2.5 text-[11px] text-amber-500/80">
                    <span className="font-bold text-amber-400">🔍 CLUE HINT:</span> {quest.clueHint}
                </div>
            )}

            {/* Status Badges & Controls */}
            <div className="mt-auto pt-2 flex flex-col gap-3">
                {isExpired && !isCompleted ? (
                    <div className="bg-red-950/20 border border-red-500/40 text-red-500 text-xs font-bold py-2.5 rounded text-center uppercase tracking-wider animate-pulse flex items-center justify-center gap-2">
                        <span>🚨</span> CHALLENGE EXPIRED - SUBMISSION CLOSED
                    </div>
                ) : quest.verificationType === "DIGITAL_CODE" ? (
                    <div>
                        {isCompleted ? (
                            <div className="bg-emerald-950/30 border border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)] text-xs font-extrabold px-3 py-2.5 rounded text-center uppercase tracking-wider">
                                ✓ Decrypted & Completed
                            </div>
                        ) : (
                            <form onSubmit={handleSubmitCode} className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="answer of TERMINAL_DECRYPT_KEY"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        disabled={loading}
                                        className="bg-black border border-amber-500/30 focus:border-amber-400 text-zinc-200 placeholder-zinc-700 text-xs px-3 py-2 rounded focus:outline-none transition w-full uppercase tracking-wider font-semibold disabled:opacity-50"
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading || !code.trim()}
                                        className="bg-amber-500 text-black hover:bg-amber-400 font-extrabold text-xs px-4 py-2 rounded transition shadow-[0_0_8px_rgba(245,158,11,0.2)] hover:shadow-[0_0_12px_rgba(245,158,11,0.4)] disabled:opacity-30 cursor-pointer whitespace-nowrap uppercase animate-pulse"
                                    >
                                        {loading ? "LOAD..." : "DECRYPT_"}
                                    </button>
                                </div>
                                {quest.isBlind && (
                                    <div className="text-[9px] text-purple-400 font-mono uppercase tracking-widest text-center mt-1 animate-pulse">
                                        🚨 BLIND INTAKE GRID ACTIVE // MAX 2 SUBMISSIONS
                                    </div>
                                )}
                            </form>
                        )}
                    </div>
                ) : (
                    <div>
                        {isCompleted ? (
                            <div className="bg-emerald-950/35 border border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)] text-xs font-extrabold px-3 py-2.5 rounded text-center uppercase tracking-wider">
                                ✓ Completed (Leader Signed Off)
                            </div>
                        ) : isAwaiting ? (
                            <div className="bg-cyan-950/40 border border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] text-xs font-extrabold px-3 py-2.5 rounded text-center uppercase tracking-wider animate-pulse">
                                ⏳ Awaiting Leader Sign-Off
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <div className="bg-amber-950/20 border border-amber-500/30 text-amber-500 text-xs font-extrabold px-3 py-2 rounded text-center uppercase tracking-wider">
                                    ⚠️ Action Required (Needs Sign-Off)
                                </div>
                                <button
                                    onClick={handleRequestSignOff}
                                    disabled={loading}
                                    className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:border-amber-400 font-bold text-xs py-2.5 rounded transition cursor-pointer uppercase tracking-wider"
                                >
                                    {loading ? "PROCESSING..." : "REQUEST_LEADER_SIGN_OFF_"}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Message Banner */}
                {message && (
                    <div
                        className={`text-[11px] p-2 rounded border uppercase font-semibold ${message.type === "success"
                            ? "bg-green-950/20 border-green-500/30 text-green-400"
                            : "bg-red-950/20 border-red-500/30 text-red-400"
                            }`}
                    >
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
}

function renderQuestDescription(text: string) {
    if (!text) return null;

    const lines = text.split("\n");

    return lines.map((line, idx) => {
        if (!line.trim()) {
            return <div key={idx} className="h-2.5" />;
        }

        const isBullet = line.trim().startsWith("* ") || line.trim().startsWith("- ");
        let content = isBullet ? line.trim().substring(2) : line;

        const parts: React.ReactNode[] = [];
        let currentPos = 0;

        const regex = /(\*\*.*?\*\*|`.*?`|\*.*?\*)/g;
        let match;
        let keyCounter = 0;

        while ((match = regex.exec(content)) !== null) {
            const matchIndex = match.index;
            const matchedText = match[0];

            if (matchIndex > currentPos) {
                parts.push(content.substring(currentPos, matchIndex));
            }

            if (matchedText.startsWith("**") && matchedText.endsWith("**")) {
                const boldVal = matchedText.slice(2, -2);
                parts.push(
                    <strong key={keyCounter++} className="text-amber-400 font-extrabold">
                        {boldVal}
                    </strong>
                );
            } else if (matchedText.startsWith("`") && matchedText.endsWith("`")) {
                const codeVal = matchedText.slice(1, -1);
                const isAlertVar = codeVal.includes("SYS_LOG") || codeVal.includes("CONTEXT_MASK");
                const isFormula = codeVal.includes("TERMINAL_DECRYPT_KEY") || codeVal.includes("VECTOR_DELTA") || codeVal.includes("OFFICIAL_FOJ_REGISTRY_COUNT") || codeVal.includes("Freeze_Duration_Days");
                parts.push(
                    <code
                        key={keyCounter++}
                        className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${isAlertVar
                            ? "bg-red-950/20 border-red-500/20 text-red-400 font-bold"
                            : isFormula
                                ? "bg-purple-950/20 border-purple-500/20 text-purple-300 font-bold font-semibold"
                                : "bg-zinc-900 border-zinc-800 text-zinc-300"
                            }`}
                    >
                        {codeVal}
                    </code>
                );
            } else if (matchedText.startsWith("*") && matchedText.endsWith("*")) {
                const italicVal = matchedText.slice(1, -1);
                parts.push(
                    <em key={keyCounter++} className="text-zinc-300 italic">
                        {italicVal}
                    </em>
                );
            }

            currentPos = regex.lastIndex;
        }

        if (currentPos < content.length) {
            parts.push(content.substring(currentPos));
        }

        if (isBullet) {
            return (
                <div key={idx} className="flex gap-2 items-start pl-2 text-zinc-200 text-xs">
                    <span className="text-amber-500/60 mt-1.5 text-[8px]">■</span>
                    <span className="flex-1 leading-relaxed">{parts}</span>
                </div>
            );
        }

        const isSystemAlert = line.startsWith("🚨") || line.includes("SYSTEM INTEGRITY");
        if (isSystemAlert) {
            return (
                <div key={idx} className="bg-red-950/10 border border-red-500/20 rounded p-3 text-center my-1.5">
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-red-400 uppercase tracking-widest">
                        {parts}
                    </div>
                </div>
            );
        }

        return (
            <p key={idx} className="text-zinc-200 text-xs leading-relaxed">
                {parts}
            </p>
        );
    });
}
