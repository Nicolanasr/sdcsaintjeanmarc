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
          text: `DECRYPTION_SUCCESSFUL: Awarded +${res.reward} credits! Terminal updated.`,
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
        </div>
        <div className="bg-amber-950/30 text-amber-400 border border-amber-500/30 text-xs px-2.5 py-1 rounded font-bold whitespace-nowrap">
          +{quest.creditReward} CR
        </div>
      </div>

      {/* Description */}
      <p className="text-zinc-400 text-xs leading-relaxed whitespace-pre-line">
        {quest.description}
      </p>

      {/* Clue Hint */}
      {quest.clueHint && !isCompleted && (
        <div className="bg-amber-950/10 border border-amber-500/10 rounded p-2.5 text-[11px] text-amber-500/80">
          <span className="font-bold text-amber-400">🔍 CLUE HINT:</span> {quest.clueHint}
        </div>
      )}

      {/* Status Badges & Controls */}
      <div className="mt-auto pt-2 flex flex-col gap-3">
        {quest.verificationType === "DIGITAL_CODE" ? (
          <div>
            {isCompleted ? (
              <div className="bg-green-950/30 border border-green-500/40 text-green-400 text-xs font-bold px-3 py-2 rounded text-center uppercase tracking-wider">
                ✓ Decrypted & Completed
              </div>
            ) : (
              <form onSubmit={handleSubmitCode} className="flex gap-2">
                <input
                  type="text"
                  placeholder="ENTER_DECRYPTION_KEY_"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={loading}
                  className="bg-black border border-amber-500/30 focus:border-amber-400 text-zinc-200 placeholder-zinc-700 text-xs px-3 py-2 rounded focus:outline-none transition w-full uppercase tracking-wider font-semibold disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading || !code.trim()}
                  className="bg-amber-500 text-black hover:bg-amber-400 font-extrabold text-xs px-4 py-2 rounded transition shadow-[0_0_8px_rgba(245,158,11,0.2)] hover:shadow-[0_0_12px_rgba(245,158,11,0.4)] disabled:opacity-30 cursor-pointer whitespace-nowrap uppercase"
                >
                  {loading ? "LOAD..." : "DECRYPT_"}
                </button>
              </form>
            )}
          </div>
        ) : (
          <div>
            {isCompleted ? (
              <div className="bg-green-950/30 border border-green-500/40 text-green-400 text-xs font-bold px-3 py-2 rounded text-center uppercase tracking-wider">
                ✓ Completed (Leader Signed Off)
              </div>
            ) : isAwaiting ? (
              <div className="bg-yellow-950/30 border border-yellow-500/40 text-yellow-400 text-xs font-bold px-3 py-2 rounded text-center uppercase tracking-wider animate-pulse">
                ⏳ Awaiting Leader Sign-Off
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="bg-red-950/30 border border-red-500/30 text-red-400 text-xs font-bold px-3 py-1.5 rounded text-center uppercase tracking-wider">
                  ⚠️ Locked (Needs Sign-Off)
                </div>
                <button
                  onClick={handleRequestSignOff}
                  disabled={loading}
                  className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:border-amber-400 font-bold text-xs py-2 rounded transition cursor-pointer uppercase tracking-wider"
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
