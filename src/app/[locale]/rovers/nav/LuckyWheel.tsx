"use client";

import React, { useRef, useState, useEffect } from "react";
import { spinLuckyWheel } from "@/app/actions/rovers";
import { cyberAudio } from "@/utils/audio";

interface LuckyWheelProps {
    currentCredits: number;
    onSpinCompleted: (remainingCredits: number) => void;
}

const OUTCOMES = [
    { type: "LOSE", label: "Better luck next time!", color: "#27272a" },
    { type: "SMALL_CREDITS", label: "Won +5 CR!", color: "#f59e0b" },
    { type: "SOCIAL_ANTHEM", label: "Challenge: Sing SDC Anthem (+50 CR)", color: "#6366f1" },
    { type: "MED_CREDITS", label: "Won +20 CR!", color: "#d97706" },
    { type: "BIG_CREDITS", label: "Won +50 CR!", color: "#b45309" },
    { type: "SOCIAL_LEAVES", label: "Challenge: Leaf Collector (+30 CR)", color: "#4f46e5" },
    { type: "DECOY_LAUNCHER", label: "Won 1x Decoy Node Launcher!", color: "#ea580c" },
    { type: "SHIELD_GENERATOR", label: "Won 1x Capture Shield Generator!", color: "#06b6d4" },
    { type: "JACKPOT", label: "JACKPOT! Won +150 CR!", color: "#db2777" }
];

export default function LuckyWheel({ currentCredits, onSpinCompleted }: LuckyWheelProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [spinning, setSpinning] = useState(false);
    const [outcome, setOutcome] = useState<{ type: string; label: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [credits, setCredits] = useState(currentCredits);

    useEffect(() => {
        setCredits(currentCredits);
    }, [currentCredits]);

    // Keep rendering the wheel base
    useEffect(() => {
        drawWheel(0);
    }, [credits]);

    const drawWheel = (angleOffset: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const radius = width / 2 - 10;
        const centerX = width / 2;
        const centerY = height / 2;

        ctx.clearRect(0, 0, width, height);

        // Draw outer glowing neon ring
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 10;
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0; // reset glow

        const numSlices = OUTCOMES.length;
        const sliceAngle = (Math.PI * 2) / numSlices;

        OUTCOMES.forEach((item, idx) => {
            const startAngle = idx * sliceAngle + angleOffset;
            const endAngle = startAngle + sliceAngle;

            // Draw slice
            ctx.fillStyle = item.color;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fill();

            // Outer slice border
            ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Draw Label text
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + sliceAngle / 2);
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 9px monospace";
            ctx.shadowColor = "#000000";
            ctx.shadowBlur = 4;

            // Truncate text for small slice
            const rawText = item.type === "SOCIAL_ANTHEM" ? "SING ANTHEM" : item.type === "SOCIAL_LEAVES" ? "LEAF COLLECT" : item.type === "DECOY_LAUNCHER" ? "DECOY NODE" : item.type === "SHIELD_GENERATOR" ? "SHIELD DOME" : item.label.split(" ").slice(1).join(" ") || item.label;

            ctx.fillText(rawText.toUpperCase(), radius / 2.5, 3);
            ctx.restore();
        });

        // Draw center tactical cap hub
        ctx.fillStyle = "#09090b";
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.fillText("SPIN", centerX, centerY + 3);
        ctx.textAlign = "left"; // reset
    };

    const handleSpin = async () => {
        if (spinning) return;
        setOutcome(null);
        setError(null);

        if (credits < 25) {
            setError("INSUFFICIENT_CREDITS: You need 25 CR to spin the Cyber-Wheel.");
            return;
        }

        setSpinning(true);
        cyberAudio.playScan();

        try {
            const res = await spinLuckyWheel();
            if (!res.success) {
                setError(res.error || "Failed to complete spin.");
                setSpinning(false);
                return;
            }

            const winningType = res.outcome;
            const targetIndex = OUTCOMES.findIndex((o) => o.type === winningType);

            // Animation parameters
            const numSlices = OUTCOMES.length;
            const sliceAngle = (Math.PI * 2) / numSlices;

            // Calculate angle offset to align the slice with the top pointer (index target)
            // Pointer is at the top (12 o'clock, which is angle: -Math.PI / 2)
            const targetAngle = -Math.PI / 2 - (targetIndex * sliceAngle + sliceAngle / 2);

            let currentAngle = 0;
            const totalRotations = 6 * Math.PI * 2; // Spin 6 times
            const destinationAngle = totalRotations + targetAngle;

            let startTimestamp: number | null = null;
            const duration = 4000; // 4 seconds spin

            const animate = (timestamp: number) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);

                // Easing out cubic: 1 - (1 - x)^3
                const easeOut = 1 - Math.pow(1 - progress, 3);
                currentAngle = easeOut * destinationAngle;

                drawWheel(currentAngle);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    setSpinning(false);
                    setOutcome({ type: res.outcome!, label: res.label! });
                    setCredits(res.remainingCredits!);
                    onSpinCompleted(res.remainingCredits!);

                    if (res.outcome === "LOSE") {
                        cyberAudio.playFailure();
                    } else {
                        cyberAudio.playSuccess();
                    }
                }
            };

            requestAnimationFrame(animate);
        } catch (err: any) {
            setError(err.message || "Network link failure.");
            setSpinning(false);
        }
    };

    return (
        <div className="bg-zinc-950/40 border border-amber-500/20 rounded-lg p-6 shadow-[0_0_15px_rgba(0,0,0,0.6)] flex flex-col items-center gap-6">
            <div className="w-full flex justify-between items-center border-b border-amber-500/20 pb-3">
                <h2 className="text-xl font-bold tracking-widest text-amber-400 uppercase">
                    🎡 CYBER_SPIN_WHEEL_
                </h2>
                <span className="font-mono text-xs bg-amber-500/10 border border-amber-500/35 text-amber-400 px-3 py-1.5 rounded">
                    BALANCE: {credits} CR
                </span>
            </div>

            <div className="relative flex flex-col items-center">
                {/* Top center selector pointer */}
                <div className="absolute top-0 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-amber-400 z-10 filter drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]" />

                <canvas
                    ref={canvasRef}
                    width={300}
                    height={300}
                    className="mt-3 bg-transparent select-none cursor-pointer max-w-full"
                    onClick={handleSpin}
                />
            </div>

            {error && (
                <div className="w-full text-center text-xs bg-red-950/20 border border-red-500/30 text-red-400 p-2.5 rounded font-mono uppercase">
                    ⚠️ {error}
                </div>
            )}

            {outcome && (
                <div className="w-full text-center bg-green-950/20 border-2 border-green-500/30 p-4 rounded flex flex-col gap-2 font-mono animate-pulse">
                    <span className="text-green-400 font-extrabold uppercase tracking-widest text-sm">
                        🎉 SPIN RESULT INCOMING:
                    </span>
                    <p className="text-xs text-white font-bold uppercase">{outcome.label}</p>
                </div>
            )}

            <button
                onClick={handleSpin}
                disabled={spinning || credits < 25}
                className="w-full max-w-xs bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:pointer-events-none text-black font-extrabold text-xs py-3.5 rounded transition uppercase tracking-widest cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.2)] font-mono"
            >
                🚀 {spinning ? "SPINNING MATRIX..." : "SPIN FOR 25 CR"}
            </button>
        </div>
    );
}
