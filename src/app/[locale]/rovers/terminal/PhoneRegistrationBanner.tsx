"use client";

import React, { useState } from "react";
import { updateRoverPhoneNumber } from "@/app/actions/rovers";

interface PhoneRegistrationBannerProps {
  roverId: string;
  initialPhone: string;
}

export default function PhoneRegistrationBanner({ roverId, initialPhone }: PhoneRegistrationBannerProps) {
  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setSuccess(false);

    try {
      const res = await updateRoverPhoneNumber(roverId, phone);
      if (res.success) {
        setSuccess(true);
      } else {
        setErrorMsg(res.error || "Failed to update phone number.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // If already registered and success isn't showing, don't show anything
  if (initialPhone && !success) return null;

  return (
    <div className="bg-amber-950/10 border border-amber-500/30 rounded-lg p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-[0_0_12px_rgba(245,158,11,0.05)] animate-pulse">
      <div className="flex-1">
        <h4 className="text-amber-400 font-extrabold text-sm tracking-widest uppercase">
          ⚠️ WA_ALERTS_INACTIVE
        </h4>
        <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
          {success
            ? "SYSTEM_ONLINE: Your WhatsApp gateway has been successfully registered. Test notifications will trigger on server actions."
            : "No mobile phone number registered on this terminal. Bind your active WhatsApp number to receive Quest drops, night nav updates, and live auction outbid warnings."}
        </p>
      </div>

      {!success && (
        <form onSubmit={handleRegister} className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            required
            placeholder="e.g. +96170123456"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
            className="bg-black border border-amber-500/30 focus:border-amber-400 text-zinc-200 placeholder-zinc-700 text-xs px-3 py-2 rounded focus:outline-none transition w-full md:w-48 font-semibold disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !phone.trim()}
            className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-4 py-2 rounded transition cursor-pointer whitespace-nowrap uppercase tracking-wider"
          >
            {loading ? "SAVING..." : "REGISTER_"}
          </button>
        </form>
      )}

      {errorMsg && (
        <div className="text-red-400 text-[10px] uppercase font-bold border border-red-500/20 bg-red-950/10 p-2 rounded w-full md:w-auto text-center">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
