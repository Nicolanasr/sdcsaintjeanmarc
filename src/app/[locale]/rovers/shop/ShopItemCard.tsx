"use client";

import React, { useState } from "react";
import { purchaseShopItem, placeBid, adminCloseAuction } from "@/app/actions/rovers";

interface ShopItemProps {
  item: {
    id: string;
    title: string;
    description: string;
    type: "FIXED_PRICE" | "AUCTION";
    priceOrCurrentBid: number;
    stock: number;
    isAvailable: boolean;
    highestBidder: {
      id: string;
      fullName: string;
    } | null;
  };
  currentUserId: string;
  locale: string;
  isAdmin?: boolean;
}

export default function ShopItemCard({ item, currentUserId, locale, isAdmin = false }: ShopItemProps) {
  const [bidAmount, setBidAmount] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handlePurchase = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const res = await purchaseShopItem(item.id);
      if (res.success) {
        setMessage({
          type: "success",
          text: `PURCHASE_SUCCESS: Item purchased successfully. New balance: ${res.newCredits} CR.`,
        });
      } else {
        setMessage({
          type: "error",
          text: `PURCHASE_FAILED: ${res.error || "Could not complete transaction."}`,
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

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidAmount || bidAmount <= item.priceOrCurrentBid) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await placeBid(item.id, Number(bidAmount));
      if (res.success) {
        setMessage({
          type: "success",
          text: `BID_PLACED: Highest bidder updated! New balance: ${res.newCredits} CR.`,
        });
        setBidAmount("");
      } else {
        setMessage({
          type: "error",
          text: `BID_FAILED: ${res.error || "Could not place bid."}`,
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

  const handleCloseAuction = async () => {
    if (!confirm(`Are you sure you want to close the auction for "${item.title}" and award it to the highest bidder?`)) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await adminCloseAuction(item.id);
      if (res.success) {
        setMessage({
          type: "success",
          text: "AUCTION_CLOSED: Final bid locked and awarded successfully.",
        });
      } else {
        setMessage({
          type: "error",
          text: `CLOSE_FAILED: ${res.error || "Could not close auction."}`,
        });
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: `SYSTEM_ERROR: ${err.message || "Failed to contact system server."}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const isFixed = item.type === "FIXED_PRICE";
  const isOutofStock = isFixed && item.stock <= 0;
  const isHighestBidder = !isFixed && item.highestBidder?.id === currentUserId;
  const isClosed = !isFixed && !item.isAvailable;

  return (
    <div className="bg-zinc-950/60 border border-amber-500/20 rounded-lg p-5 hover:border-amber-500/40 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden group shadow-[0_0_15px_rgba(0,0,0,0.5)]">
      {/* Visual background gradient for auctions */}
      {!isFixed && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(245,158,11,0.03)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
      )}

      {/* Title & Type Badge */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="text-zinc-100 font-extrabold text-base tracking-wide group-hover:text-amber-400 transition-colors">
            {item.title}
          </h3>
          <div className="text-[10px] text-amber-500/50 uppercase mt-0.5">
            Category: {isFixed ? "Fixed Price Perk" : "Camp Auction"}
          </div>
        </div>
        <div className="bg-amber-950/30 text-amber-400 border border-amber-500/30 text-xs px-2.5 py-1 rounded font-bold whitespace-nowrap">
          {isFixed ? `${item.priceOrCurrentBid} CR` : `BID: ${item.priceOrCurrentBid} CR`}
        </div>
      </div>

      {/* Description */}
      <p className="text-zinc-400 text-xs leading-relaxed">
        {item.description}
      </p>

      {/* Special Category Stats */}
      <div className="text-xs bg-black/40 border border-amber-500/10 p-2.5 rounded flex items-center justify-between">
        {isFixed ? (
          <>
            <span className="text-amber-500/60 uppercase">Available Stock:</span>
            <span className={`font-bold ${isOutofStock ? "text-red-500" : "text-amber-400"}`}>
              {isOutofStock ? "OUT_OF_STOCK" : `${item.stock} units`}
            </span>
          </>
        ) : (
          <>
            <span className="text-amber-500/60 uppercase">Highest Bidder:</span>
            <span className={`font-bold ${isHighestBidder ? "text-green-400" : "text-amber-400"}`}>
              {isHighestBidder ? "YOU" : item.highestBidder?.fullName || "NO_BIDS_YET"}
            </span>
          </>
        )}
      </div>

      {/* Action Controls */}
      <div className="mt-auto pt-2 flex flex-col gap-3">
        {isClosed ? (
          <div className="bg-red-950/20 border border-red-500/30 text-red-500 text-xs font-bold py-2.5 rounded text-center uppercase tracking-wider">
            ✓ CLOSED & AWARDED TO: {item.highestBidder?.fullName || "NO_BIDS"}
          </div>
        ) : isFixed ? (
          <button
            onClick={handlePurchase}
            disabled={loading || isOutofStock}
            className="w-full bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-30 disabled:hover:bg-amber-500 font-extrabold text-xs py-2.5 rounded transition shadow-[0_0_8px_rgba(245,158,11,0.2)] hover:shadow-[0_0_12px_rgba(245,158,11,0.4)] cursor-pointer uppercase tracking-wider"
          >
            {loading ? "PROCESSING..." : isOutofStock ? "OUT_OF_STOCK_" : "PURCHASE_PERK_"}
          </button>
        ) : (
          <div className="flex flex-col gap-2.5">
            {isHighestBidder && (
              <div className="bg-green-950/20 border border-green-500/30 text-green-400 text-[10px] font-bold py-1 px-2 rounded text-center uppercase tracking-wider">
                ✓ You hold the highest bid
              </div>
            )}
            <form onSubmit={handleBidSubmit} className="flex gap-2">
              <input
                type="number"
                placeholder={`MIN_BID_>_${item.priceOrCurrentBid}_`}
                value={bidAmount}
                onChange={(e) =>
                  setBidAmount(e.target.value === "" ? "" : Number(e.target.value))
                }
                disabled={loading}
                className="bg-black border border-amber-500/30 focus:border-amber-400 text-zinc-200 placeholder-zinc-700 text-xs px-3 py-2 rounded focus:outline-none transition w-full font-semibold disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !bidAmount || bidAmount <= item.priceOrCurrentBid}
                className="bg-amber-500 text-black hover:bg-amber-400 font-extrabold text-xs px-4 py-2 rounded transition shadow-[0_0_8px_rgba(245,158,11,0.2)] disabled:opacity-30 cursor-pointer uppercase"
              >
                {loading ? "BIDDING..." : "BID_"}
              </button>
            </form>

            {isAdmin && (
              <button
                type="button"
                onClick={handleCloseAuction}
                disabled={loading}
                className="w-full bg-red-950/20 hover:bg-red-900/40 border border-red-500/40 hover:border-red-500 text-red-500 hover:text-red-400 font-extrabold text-[10px] py-2 rounded transition cursor-pointer uppercase tracking-wider mt-1"
              >
                {loading ? "LOCKING_BID..." : "CLOSE_AUCTION_&_AWARD_"}
              </button>
            )}
          </div>
        )}

        {/* Message Banner */}
        {message && (
          <div
            className={`text-[11px] p-2 rounded border uppercase font-semibold ${
              message.type === "success"
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
