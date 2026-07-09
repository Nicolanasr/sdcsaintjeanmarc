"use client";

import React, { useState, useEffect } from "react";
import { captureNodeByPasscode, captureNodeByGPS } from "@/app/actions/rovers";

interface NodeCardProps {
  node: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    radiusMeters: number;
    controllingFaction: "ALPHA" | "BRAVO" | null;
    isHotSpot?: boolean;
    activeFaction?: "ALPHA" | "BRAVO" | null;
    activeCount?: number;
    requiredCount?: number;
    remainingSeconds?: number;
    checkedInRovers?: string[];
  };
  userFaction: string;
  userCoords: { latitude: number; longitude: number } | null;
  locale: string;
  userId: string;
}

// Client-side Haversine helper
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default function NodeCard({ node, userFaction, userCoords, locale, userId }: NodeCardProps) {
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  // Recalculate distance dynamically when user location changes
  useEffect(() => {
    if (userCoords) {
      const dist = getDistanceMeters(
        userCoords.latitude,
        userCoords.longitude,
        node.latitude,
        node.longitude
      );
      setDistance(dist);
    } else {
      setDistance(null);
    }
  }, [userCoords, node.latitude, node.longitude]);

  // Passcode capture
  const handlePasscodeCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    if (!userCoords) {
      setMessage({
        type: "error",
        text: "GPS_ERROR: Location coordinates required to verify physical presence.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await captureNodeByPasscode(
        node.id,
        passcode,
        userCoords.latitude,
        userCoords.longitude
      );
      if (res.success) {
        setMessage({
          type: "success",
          text: res.message || "NODE_CAPTURED: Grid territory updated.",
        });
        setPasscode("");
      } else {
        setMessage({
          type: "error",
          text: `HACK_FAILED: ${res.error || "Incorrect passcode."}`,
        });
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: `SYSTEM_ERROR: ${err.message || "Failed to reach node gateway."}`,
      });
    } finally {
      setLoading(false);
    }
  };

  // GPS capture
  const handleGPSCapture = async () => {
    if (!userCoords) {
      setMessage({
        type: "error",
        text: "GPS_ERROR: Location coordinates unavailable. Ensure GPS is enabled.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await captureNodeByGPS(node.id, userCoords.latitude, userCoords.longitude);
      if (res.success) {
        setMessage({
          type: "success",
          text: res.message || "NODE_CAPTURED: Grid coordinates verified.",
        });
      } else {
        setMessage({
          type: "error",
          text: `GPS_HACK_FAILED: ${res.error || "Verification failed."}`,
        });
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: `SYSTEM_ERROR: ${err.message || "Failed to query GPS server."}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const isControlledBySelf = node.controllingFaction === userFaction;
  const isAlpha = node.controllingFaction === "ALPHA";
  const isBravo = node.controllingFaction === "BRAVO";
  const canCapture = userFaction && userFaction !== "UNASSIGNED" && (!isControlledBySelf || node.isHotSpot);
  const isOpposingFactionHacking = !!(node.isHotSpot && node.activeFaction && node.activeFaction !== userFaction);
  const hasAlreadyCheckedIn = !!(node.isHotSpot && node.checkedInRovers && node.checkedInRovers.includes(userId));

  return (
    <div className="bg-zinc-950/60 border border-amber-500/20 rounded-lg p-5 hover:border-amber-500/40 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden group shadow-[0_0_15px_rgba(0,0,0,0.5)] min-h-[180px]">
      {/* Visual background control glow */}
      {node.isHotSpot && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.06)_0%,rgba(0,0,0,0)_75%)] pointer-events-none animate-pulse" />
      )}
      {isAlpha && !node.isHotSpot && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(220,38,38,0.04)_0%,rgba(0,0,0,0)_75%)] pointer-events-none" />
      )}
      {isBravo && !node.isHotSpot && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.04)_0%,rgba(0,0,0,0)_75%)] pointer-events-none" />
      )}

      {/* Node Info / Control Faction Tag */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="text-zinc-100 font-extrabold text-base tracking-wide group-hover:text-amber-400 transition-colors">
            {node.name}
          </h3>
          <div className="text-[10px] text-amber-500/50 uppercase mt-0.5">
            Coords: {node.latitude.toFixed(6)}, {node.longitude.toFixed(6)} // r: {node.radiusMeters}m
          </div>
        </div>
        <div
          className={`text-xs px-2.5 py-1 rounded font-extrabold border uppercase tracking-wider ${
            node.isHotSpot
              ? "bg-amber-950/40 border-amber-500/50 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)] animate-pulse font-extrabold"
              : isAlpha
              ? "bg-red-950/20 border-red-500/40 text-red-500 shadow-[0_0_6px_rgba(220,38,38,0.2)]"
              : isBravo
              ? "bg-blue-950/20 border-blue-500/40 text-blue-500 shadow-[0_0_6px_rgba(37,99,235,0.2)]"
              : "bg-zinc-900 border-zinc-700 text-zinc-500"
          }`}
        >
          {node.isHotSpot ? "🚨 HOT-ZONE" : node.controllingFaction || "UNCLAIMED"}
        </div>
      </div>

      {node.isHotSpot && node.activeFaction && (
        <div className="text-xs bg-amber-500/10 border border-amber-500/35 p-3 rounded flex flex-col gap-1.5 animate-pulse">
          <div className="flex justify-between items-center border-b border-amber-500/20 pb-1.5 mb-0.5">
            <span className="text-amber-400 font-extrabold uppercase">🚨 FACTION HACKING ACTIVE:</span>
            <span className="bg-amber-500 text-black px-1.5 py-0.5 rounded text-[10px] font-black">{node.activeFaction}</span>
          </div>
          <div className="flex justify-between font-mono">
            <span className="text-zinc-400 uppercase text-[10px]">CONVERGED MEMBERS:</span>
            <span className="text-zinc-200 font-bold">{node.activeCount} / {node.requiredCount}</span>
          </div>
          <div className="flex justify-between font-mono">
            <span className="text-zinc-400 uppercase text-[10px]">TIME REMAINING:</span>
            <span className="text-red-400 font-extrabold">{node.remainingSeconds}s</span>
          </div>
        </div>
      )}

      {/* Live Coordinates Radar / Range */}
      <div className="text-xs bg-black/40 border border-amber-500/10 p-3 rounded flex flex-col gap-1">
        <div className="flex justify-between">
          <span className="text-amber-500/60 uppercase">Target Range:</span>
          <span className="text-amber-400 font-bold">200 Meters</span>
        </div>
        <div className="flex justify-between">
          <span className="text-amber-500/60 uppercase">Current Distance:</span>
          <span
            className={`font-bold ${
              distance === null
                ? "text-zinc-500"
                : distance <= 200
                ? "text-green-400 animate-pulse"
                : "text-red-500"
            }`}
          >
            {distance === null
              ? "WAITING_GPS_"
              : `${Math.round(distance)} meters ${
                  distance <= 200 ? "(IN_RANGE)" : "(OUT_OF_RANGE)"
                }`}
          </span>
        </div>
      </div>

      {/* Hack inputs & Validation */}
      {canCapture ? (
        <div className="flex flex-col gap-3.5 mt-auto pt-2">
          {isOpposingFactionHacking && (
            <div className="text-[10px] bg-red-950/20 border border-red-500/30 text-red-400 p-2 rounded uppercase font-bold text-center tracking-wide">
              ⚠️ Opposing Faction {node.activeFaction} is actively hacking! Wait for queue to expire.
            </div>
          )}

          {hasAlreadyCheckedIn && (
            <div className="text-[10px] bg-green-950/20 border border-green-500/30 text-green-400 p-2 rounded uppercase font-bold text-center tracking-wide animate-pulse">
              ✓ YOU HAVE CHECKED IN! WAITING FOR TEAMMATES...
            </div>
          )}

          {/* Method 1: GPS Verify Hack */}
          <button
            onClick={handleGPSCapture}
            disabled={loading || distance === null || distance > 200 || isOpposingFactionHacking || hasAlreadyCheckedIn}
            className="w-full bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-30 font-extrabold text-xs py-2.5 rounded transition cursor-pointer uppercase tracking-wider"
          >
            {loading ? "CHECKING IN..." : node.isHotSpot ? "🚨 CHECK IN TO HOT-ZONE_" : "CAPTURE_VIA_GPS_GATEWAY_"}
          </button>

          <div className="flex items-center gap-2">
            <div className="h-[1px] bg-amber-500/10 flex-grow" />
            <span className="text-[9px] text-amber-500/40 uppercase">OR</span>
            <div className="h-[1px] bg-amber-500/10 flex-grow" />
          </div>

          {/* Method 2: Passcode Submit */}
          <form onSubmit={handlePasscodeCapture} className="flex gap-2">
            <input
              type="text"
              placeholder="INPUT_PHYSICAL_PASSCODE_"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              disabled={loading || isOpposingFactionHacking || hasAlreadyCheckedIn}
              className="bg-black border border-amber-500/30 focus:border-amber-400 text-zinc-200 placeholder-zinc-700 text-xs px-3 py-2 rounded focus:outline-none transition w-full uppercase tracking-wider font-semibold disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !passcode.trim() || isOpposingFactionHacking || hasAlreadyCheckedIn}
              className="bg-amber-500/15 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400 font-extrabold text-xs px-4 py-2 rounded transition cursor-pointer uppercase"
            >
              {loading ? "SUBMITTING..." : "SUBMIT_"}
            </button>
          </form>
        </div>
      ) : (
        <div className="mt-auto pt-2 text-center">
          {isControlledBySelf ? (
            <div className="bg-green-950/20 border border-green-500/30 text-green-400 text-xs font-bold py-2 rounded uppercase tracking-wider">
              ✓ SECURED BY YOUR FACTION
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 text-zinc-600 text-xs font-bold py-2 rounded uppercase tracking-wider">
              FACTION ASSIGNMENT REQUIRED
            </div>
          )}
        </div>
      )}

      {/* Message Output */}
      {message && (
        <div
          className={`text-[11px] p-2 rounded border uppercase font-semibold ${
            message.type === "success"
              ? "bg-green-950/20 border-green-500/30 text-green-400 animate-pulse"
              : "bg-red-950/20 border-red-500/30 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
