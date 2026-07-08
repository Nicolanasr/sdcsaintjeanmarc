import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getRoverSession, logoutRover } from "@/app/actions/rovers";
import { prisma } from "@/lib/prisma";
import { Faction } from "@prisma/client";
import RoversNavbar from "./RoversNavbar";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RoversLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  const session = await getRoverSession();

  // If not authenticated, redirect to login
  if (!session) {
    redirect(`/${locale}/login`);
  }

  // Load faction tallies
  const alphaNodes = await prisma.geoNode.count({
    where: { controllingFaction: Faction.ALPHA },
  });
  const bravoNodes = await prisma.geoNode.count({
    where: { controllingFaction: Faction.BRAVO },
  });
  const totalNodes = await prisma.geoNode.count();

  // Calculate percentages for the map control display
  const alphaPercent = totalNodes > 0 ? (alphaNodes / totalNodes) * 100 : 0;
  const bravoPercent = totalNodes > 0 ? (bravoNodes / totalNodes) * 100 : 0;

  const currentCredits = session.roverProfile?.roverCredits ?? 0;
  const userFaction = session.roverProfile?.faction ?? "UNASSIGNED";
  const isAdmin = session.profile.role === "admin";

  const navSetting = await prisma.systemSetting.findUnique({
    where: { key: "night_nav_active" },
  });
  const nightNavActive = navSetting?.value === "true";

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-mono flex flex-col relative overflow-x-hidden selection:bg-amber-500 selection:text-black">
      {/* Scanline CRT overlay effect */}
      <div className="pointer-events-none fixed inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] opacity-35" />

      {/* Retro grid glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.05)_0%,rgba(0,0,0,0)_80%)] pointer-events-none" />

      {/* Top Console Diagnostic Header */}
      <header className="border-b border-amber-500/30 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* System Name / Status */}
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,1)]" />
            <div>
              <Link href={`/${locale}/rovers/terminal`}>
                <h1 className="text-lg font-bold tracking-widest text-amber-400 hover:text-amber-300 transition cursor-pointer">
                  PROJECT_HELIOS_v1.0.4
                </h1>
              </Link>
              <div className="text-[10px] text-amber-500/60 uppercase">
                Secure Terminal Network // Troop Ra
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="flex items-center gap-4 text-xs md:text-sm">
            <div className="text-right">
              <div className="font-bold text-amber-300">{session.profile.fullName}</div>
              <div className="text-[9px] text-amber-500/55 uppercase tracking-widest mt-0.5">
                ROVER_USER_LINK
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 rounded flex flex-col items-center min-w-[80px] shadow-[inset_0_0_6px_rgba(245,158,11,0.1)]">
                <span className="text-[9px] text-amber-500/60 uppercase tracking-wider">Credits</span>
                <span className="text-amber-400 font-extrabold text-lg animate-pulse">
                  {currentCredits}
                </span>
              </div>
              <form action={logoutRover}>
                <button
                  type="submit"
                  className="bg-red-950/20 hover:bg-red-900/40 border border-red-500/30 hover:border-red-500 text-red-500 hover:text-red-400 font-extrabold text-[10px] px-2.5 py-3 rounded transition cursor-pointer uppercase tracking-wider"
                  title="Disconnect Link"
                >
                  EXIT_
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Monospace Cybersecurity Sub-Header (Page Navigation) */}
      <RoversNavbar locale={locale} isAdmin={isAdmin} nightNavActive={nightNavActive} />

      {/* Main Grid Workstation */}
      <main className="flex-grow p-4 md:p-8 max-w-7xl w-full mx-auto relative z-10 flex flex-col gap-6">
        {children}
      </main>

      {/* Footer Diagnostic Ticker */}
      <footer className="border-t border-amber-500/20 bg-zinc-950/50 py-3 px-4 text-center text-[10px] text-amber-500/40 uppercase tracking-widest mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>© {new Date().getFullYear()} SDC Saint Jean Marc - All Rights Reserved</div>
          <div>Security: SECURE_CONNECTION // GPS_ENCRYPTED</div>
        </div>
      </footer>
    </div>
  );
}
