"use client";

import React, { useRef } from "react";

interface Badge {
  id: string;
  title: string;
  category: string;
}

interface CyberIDCardProps {
  fullName: string;
  faction: string;
  credits: number;
  completedQuests: Badge[];
}

export default function CyberIDCard({ fullName, faction, credits, completedQuests }: CyberIDCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute Rank based on credits
  let rank = "RECRUIT";
  if (credits > 800) rank = "ELITE COMMANDER";
  else if (credits > 400) rank = "OPERATIVE";
  else if (credits > 150) rank = "SPECIALIST";

  const factionColor = faction === "ALPHA" ? "#ef4444" : faction === "BRAVO" ? "#3b82f6" : "#a1a1aa";
  const factionName = faction === "ALPHA" ? "FACTION ALPHA (RED)" : faction === "BRAVO" ? "FACTION BRAVO (BLUE)" : "UNASSIGNED";

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid mesh lines
    ctx.strokeStyle = "rgba(245, 158, 11, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw Faction glowing borders
    ctx.strokeStyle = factionColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Outer glow effect
    ctx.shadowColor = factionColor;
    ctx.shadowBlur = 15;
    ctx.strokeStyle = factionColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);
    ctx.shadowBlur = 0; // reset shadow

    // Header Text
    ctx.fillStyle = "#f59e0b";
    ctx.font = "bold 14px monospace";
    ctx.fillText("HELIOS_TACTICAL_IDENTIFICATION_", 30, 45);

    // Divider line
    ctx.fillStyle = "rgba(245, 158, 11, 0.2)";
    ctx.fillRect(30, 55, canvas.width - 60, 2);

    // Name label and value
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "9px monospace";
    ctx.fillText("OPERATIVE FULL NAME:", 35, 80);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px monospace";
    ctx.fillText(fullName.toUpperCase(), 35, 100);

    // Faction label and value
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "9px monospace";
    ctx.fillText("ASSIGNED GRID FACTION:", 35, 130);

    ctx.fillStyle = factionColor;
    ctx.font = "bold 13px monospace";
    ctx.fillText(factionName, 35, 148);

    // Credits & Rank row
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "9px monospace";
    ctx.fillText("CREDITS EARNED:", 35, 180);
    ctx.fillText("OPERATIONAL RANK:", 200, 180);

    ctx.fillStyle = "#f59e0b";
    ctx.font = "bold 18px monospace";
    ctx.fillText(`${credits} CR`, 35, 202);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px monospace";
    ctx.fillText(rank, 200, 200);

    // Divider before Badges
    ctx.fillStyle = "rgba(245, 158, 11, 0.1)";
    ctx.fillRect(30, 220, canvas.width - 60, 1);

    // Badges Section
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "9px monospace";
    ctx.fillText("CURRICULUM COMPLETED BADGES:", 35, 240);

    // Draw first 6 badge symbols
    let xOffset = 35;
    let yOffset = 255;
    completedQuests.slice(0, 6).forEach((quest, idx) => {
      // Circle background
      ctx.fillStyle = "rgba(245, 158, 11, 0.08)";
      ctx.strokeStyle = "rgba(245, 158, 11, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(xOffset + 20, yOffset + 20, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Initials text inside circle badge
      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      const initials = quest.title.split(" ").map(w => w[0]).join("").substring(0, 3).toUpperCase();
      ctx.fillText(initials, xOffset + 20, yOffset + 23);
      ctx.textAlign = "left"; // reset alignment

      xOffset += 50;
      if ((idx + 1) % 6 === 0) {
        xOffset = 35;
        yOffset += 45;
      }
    });

    if (completedQuests.length === 0) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.font = "italic 10px monospace";
      ctx.fillText("NO COMPLETED BADGES SECURED IN GRID", 35, 270);
    }

    // Watermark/Footer
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.font = "7px monospace";
    ctx.fillText("HELIOS SECURE IDENTIFICATION PROTOCOL // VERIFIED SDC", 30, 340);

    // Download file
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `HELIOS_ID_${fullName.replace(/\s+/g, "_").toUpperCase()}.png`;
    link.href = url;
    link.click();
  };

  return (
    <div className="bg-zinc-950/40 border border-amber-500/20 rounded-lg p-5 shadow-[0_0_15px_rgba(0,0,0,0.6)] flex flex-col items-center gap-6">
      <h2 className="text-xl font-bold tracking-widest text-amber-400 uppercase w-full border-b border-amber-500/20 pb-3">
        🪪 CYBER_ID_GENERATOR_
      </h2>

      {/* Cyber Badge Preview */}
      <div 
        className="w-full max-w-[360px] aspect-[9/10] bg-black border-2 rounded-xl p-5 relative overflow-hidden flex flex-col gap-4 shadow-[0_0_20px_rgba(0,0,0,0.8)]"
        style={{ borderColor: factionColor }}
      >
        {/* Holographic background line lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none" />
        
        {/* Top Glow bar */}
        <div className="w-full h-1 bg-amber-500/20 rounded-full" />

        <div className="flex justify-between items-center text-[10px] text-amber-500/60 font-mono tracking-widest uppercase">
          <span>HELIOS IDENTITY SYSTEM</span>
          <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: factionColor }} />
        </div>

        {/* Identity Details */}
        <div className="mt-2 flex flex-col gap-3 font-mono">
          <div>
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider block">Operative Full Name</span>
            <span className="text-base font-black text-white uppercase tracking-wide block truncate">{fullName}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[9px] text-zinc-500 uppercase tracking-wider block">Assigned Faction</span>
              <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: factionColor }}>
                {factionName}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-zinc-500 uppercase tracking-wider block">Grid Rank</span>
              <span className="text-xs font-bold text-white uppercase tracking-wider block">{rank}</span>
            </div>
          </div>

          <div className="h-[1px] bg-amber-500/10 my-1" />

          <div>
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider block mb-2">Curriculum Badges ({completedQuests.length})</span>
            <div className="flex flex-wrap gap-2.5">
              {completedQuests.slice(0, 6).map((quest, idx) => (
                <div 
                  key={quest.id} 
                  title={quest.title}
                  className="w-10 h-10 rounded-full border border-amber-500/20 bg-amber-500/5 flex items-center justify-center text-[8px] font-black text-amber-400 select-none hover:border-amber-400 transition"
                >
                  {quest.title.split(" ").map(w => w[0]).join("").substring(0, 3).toUpperCase()}
                </div>
              ))}
              {completedQuests.length === 0 && (
                <span className="text-[10px] text-zinc-600 italic">No badges secured yet. Complete quests to unlock.</span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Credits Status */}
        <div className="mt-auto flex justify-between items-end font-mono">
          <div>
            <span className="text-[8px] text-zinc-600 block">BALANCE DATA</span>
            <span className="text-xl font-black text-amber-400">{credits} CR</span>
          </div>
          <span className="text-[8px] text-zinc-700 tracking-tighter">SECURE SDC PROTOCOL v4.1</span>
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-6 py-3 rounded transition uppercase tracking-widest cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.2)] font-mono"
      >
        📥 Download Digital ID Badge
      </button>

      {/* Hidden Canvas used to generate PNG export */}
      <canvas 
        ref={canvasRef} 
        width={360} 
        height={360} 
        className="hidden" 
      />
    </div>
  );
}
