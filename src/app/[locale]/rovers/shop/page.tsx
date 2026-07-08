import React from "react";
import { redirect } from "next/navigation";
import { getRoverSession } from "@/app/actions/rovers";
import { prisma } from "@/lib/prisma";
import ShopItemCard from "./ShopItemCard";
import { ShopItemType } from "@prisma/client";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function ShopPage({ params }: PageProps) {
  const { locale } = await params;
  const session = await getRoverSession();

  if (!session) {
    redirect(`/${locale}/login`);
  }

  // Load all shop items
  const shopItems = await prisma.shopItem.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      highestBidder: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  // Filter into Fixed Price and Auction
  const fixedItems = shopItems.filter((item) => item.type === ShopItemType.FIXED_PRICE);
  const auctionItems = shopItems.filter((item) => item.type === ShopItemType.AUCTION);
  const isAdmin = session.profile.role === "admin";

  return (
    <div className="flex flex-col gap-8">
      {/* Marketplace Instructions Banner */}
      <section className="bg-zinc-950/40 border border-amber-500/20 rounded-lg p-5 shadow-[0_0_15px_rgba(0,0,0,0.6)]">
        <h2 className="text-xl font-bold tracking-widest text-amber-400">
          HELIOS_BLACK_MARKET_
        </h2>
        <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
          Exchange your hard-earned credits for physical camp equipment, food perks, or exclusive team privileges. Fixed items are processed instantly. Auctions will close at the end of Camp on July 26.
        </p>
      </section>

      {/* 1. Live Auctions Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-xs font-bold text-amber-400/90 tracking-widest uppercase bg-amber-950/20 border border-amber-500/20 px-3 py-1.5 rounded">
            ⚡ ACTIVE_CAMP_AUCTIONS
          </h3>
          <div className="h-[1px] bg-amber-500/10 flex-grow" />
        </div>

        {auctionItems.length === 0 ? (
          <p className="text-zinc-500 text-xs py-4 text-center">No active auctions at this time.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {auctionItems.map((item) => (
              <ShopItemCard
                key={item.id}
                item={item}
                currentUserId={session.profile.id}
                locale={locale}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </div>

      {/* 2. Fixed Price Shop Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-xs font-bold text-amber-400/90 tracking-widest uppercase bg-amber-950/20 border border-amber-500/20 px-3 py-1.5 rounded">
            📦 FIXED_PRICE_SUPPLIES
          </h3>
          <div className="h-[1px] bg-amber-500/10 flex-grow" />
        </div>

        {fixedItems.length === 0 ? (
          <p className="text-zinc-500 text-xs py-4 text-center">No items available for instant purchase.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fixedItems.map((item) => (
              <ShopItemCard
                key={item.id}
                item={item}
                currentUserId={session.profile.id}
                locale={locale}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
