"use client";

import React, { useState } from "react";
import ShopItemCard from "./ShopItemCard";
import LuckyWheel from "../nav/LuckyWheel";
import { cyberAudio } from "@/utils/audio";

interface ShopClientPageProps {
  fixedItems: any[];
  auctionItems: any[];
  currentUserId: string;
  locale: string;
  isAdmin: boolean;
  initialCredits: number;
  luckyWheelActive: boolean;
}

export default function ShopClientPage({
  fixedItems,
  auctionItems,
  currentUserId,
  locale,
  isAdmin,
  initialCredits,
  luckyWheelActive
}: ShopClientPageProps) {
  const [activeTab, setActiveTab] = useState<"fixed" | "auctions" | "wheel">("fixed");
  const [credits, setCredits] = useState(initialCredits);

  // Sync credits when initialCredits changes on page revalidation
  React.useEffect(() => {
    setCredits(initialCredits);
  }, [initialCredits]);

  return (
    <div className="flex flex-col gap-6">
      {/* Black Market Header Banner */}
      <section className="bg-zinc-950/40 border border-amber-500/20 rounded-lg p-5 shadow-[0_0_15px_rgba(0,0,0,0.6)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-widest text-amber-400 uppercase">
            HELIOS_BLACK_MARKET_
          </h2>
          <p className="text-zinc-500 text-[11px] mt-1 leading-relaxed">
            Exchange your credits for physical camp equipment, food perks, or spin the cyber-wheel for rare items.
          </p>
        </div>
        <div className="font-mono text-xs bg-amber-500/10 border border-amber-500/35 text-amber-400 px-4 py-2 rounded shrink-0">
          BALANCE: <span className="font-black text-sm">{credits} CR</span>
        </div>
      </section>

      {/* Cyber Sub-Tabs selector */}
      <div className="flex bg-black border border-amber-500/20 rounded-lg p-1 font-mono">
        <button
          onClick={() => {
            cyberAudio.playScan();
            setActiveTab("fixed");
          }}
          className={`flex-1 text-center py-2 text-xs font-black uppercase tracking-wider rounded transition cursor-pointer ${
            activeTab === "fixed"
              ? "bg-amber-500 text-black shadow-[0_0_8px_rgba(245,158,11,0.25)]"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          📦 Instant Shop
        </button>
        <button
          onClick={() => {
            cyberAudio.playScan();
            setActiveTab("auctions");
          }}
          className={`flex-1 text-center py-2 text-xs font-black uppercase tracking-wider rounded transition cursor-pointer ${
            activeTab === "auctions"
              ? "bg-amber-500 text-black shadow-[0_0_8px_rgba(245,158,11,0.25)]"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          ⚡ Live Auctions
        </button>
        <button
          onClick={() => {
            cyberAudio.playScan();
            setActiveTab("wheel");
          }}
          className={`flex-1 text-center py-2 text-xs font-black uppercase tracking-wider rounded transition cursor-pointer ${
            activeTab === "wheel"
              ? "bg-amber-500 text-black shadow-[0_0_8px_rgba(245,158,11,0.25)]"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          🎡 Cyber-Spin
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "fixed" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-xs font-bold text-amber-400/90 tracking-widest uppercase bg-amber-950/20 border border-amber-500/20 px-3 py-1.5 rounded">
              📦 FIXED_PRICE_SUPPLIES
            </h3>
            <div className="h-[1px] bg-amber-500/10 flex-grow" />
          </div>

          {fixedItems.length === 0 ? (
            <p className="text-zinc-500 text-xs py-8 text-center border border-dashed border-zinc-800 rounded-lg">
              No items available for instant purchase.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fixedItems.map((item) => (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  currentUserId={currentUserId}
                  locale={locale}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "auctions" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-xs font-bold text-amber-400/90 tracking-widest uppercase bg-amber-950/20 border border-amber-500/20 px-3 py-1.5 rounded">
              ⚡ ACTIVE_CAMP_AUCTIONS
            </h3>
            <div className="h-[1px] bg-amber-500/10 flex-grow" />
          </div>

          {auctionItems.length === 0 ? (
            <p className="text-zinc-500 text-xs py-8 text-center border border-dashed border-zinc-800 rounded-lg">
              No active auctions at this time.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {auctionItems.map((item) => (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  currentUserId={currentUserId}
                  locale={locale}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "wheel" && (
        !luckyWheelActive ? (
          <div className="bg-zinc-950/60 border border-red-500/35 rounded-lg p-12 text-center shadow-[0_0_25px_rgba(239,68,68,0.15)] font-mono flex flex-col items-center gap-4">
            <span className="text-4xl animate-pulse">🔒</span>
            <h3 className="text-lg font-black text-red-500 uppercase tracking-widest">
              HELIOS_CYBER_SPIN_OFFLINE_
            </h3>
            <p className="text-zinc-500 text-xs max-w-md leading-relaxed">
              The spinning wheel has been disabled by Command. Please check back later during active operational hours.
            </p>
          </div>
        ) : (
          <LuckyWheel
            currentCredits={credits}
            onSpinCompleted={(newCredits) => {
              setCredits(newCredits);
            }}
          />
        )
      )}
    </div>
  );
}
