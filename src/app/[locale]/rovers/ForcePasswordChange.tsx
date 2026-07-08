"use client";

import React, { useState } from "react";
import { changeRoverPassword } from "@/app/actions/rovers";

interface ForcePasswordChangeProps {
  locale: string;
}

export default function ForcePasswordChange({ locale }: ForcePasswordChangeProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password.length < 6) {
      setMessage({
        type: "error",
        text: "PASSWORD_TOO_SHORT: Minimun requirement is 6 characters.",
      });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({
        type: "error",
        text: "CIPHER_MISMATCH: Passcode verification keys do not match.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await changeRoverPassword(password);
      if (res.success) {
        setMessage({
          type: "success",
          text: "KEY_UPDATE_COMPLETE: System re-authorizing... Standby.",
        });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage({
          type: "error",
          text: `UPDATE_FAILED: ${res.error || "Could not save passcode."}`,
        });
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: `SYSTEM_ERROR: ${err.message || "Request timeout."}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const isAr = locale === "ar";

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-zinc-950/75 border-2 border-red-500/30 rounded-xl p-8 max-w-md w-full relative overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.15)] text-left">
        {/* Glow border element */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/60 to-transparent animate-pulse" />

        <div className="flex items-center gap-3 mb-6">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
          <h2 className="text-xl font-bold tracking-widest text-red-500 uppercase">
            {isAr ? "تغيير كلمة المرور الإلزامي" : "PASSWORD_RESET_REQUIRED_"}
          </h2>
        </div>

        <p className="text-zinc-400 text-xs leading-relaxed mb-6 font-mono border-l-2 border-red-500/40 pl-3">
          {isAr
            ? "هذا هو أول تسجيل دخول لك في البوابة. لأسباب أمنية ولحماية حسابك ودرجات فريقك، يرجى تعيين كلمة مرور جديدة لا تقل عن ٦ أحرف قبل المتابعة."
            : "INITIAL_ENTRY_DETECTED: To maintain tactical profile link integrity, you must replace your default authorization cipher keys with a custom passcode before accessing the Helios system."}
        </p>

        {message && (
          <div
            className={`text-xs p-3 rounded border uppercase font-mono mb-6 ${
              message.type === "success"
                ? "bg-green-950/20 border-green-500/30 text-green-400"
                : "bg-red-950/20 border-red-500/30 text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
              {isAr ? "كلمة المرور الجديدة:" : "New Secure Passcode:"}
            </label>
            <input
              type="password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black border border-red-500/20 focus:border-red-500/50 text-zinc-200 px-3 py-2.5 text-xs rounded focus:outline-none transition font-semibold"
              placeholder="••••••••"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
              {isAr ? "تأكيد كلمة المرور:" : "Confirm Passcode:"}
            </label>
            <input
              type="password"
              required
              disabled={loading}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-black border border-red-500/20 focus:border-red-500/50 text-zinc-200 px-3 py-2.5 text-xs rounded focus:outline-none transition font-semibold"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs py-3 rounded transition uppercase cursor-pointer mt-4 shadow-[0_0_15px_rgba(220,38,38,0.2)] disabled:opacity-50"
          >
            {loading ? (isAr ? "جاري التحديث..." : "WRITING_KEYS...") : (isAr ? "تحديث كلمة المرور" : "REPLACE_AUTHORIZATION_KEY_")}
          </button>
        </form>
      </div>
    </div>
  );
}
