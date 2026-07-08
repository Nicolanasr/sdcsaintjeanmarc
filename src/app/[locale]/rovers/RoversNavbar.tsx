"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface RoversNavbarProps {
  locale: string;
  isAdmin: boolean;
  nightNavActive: boolean;
}

export default function RoversNavbar({ locale, isAdmin, nightNavActive }: RoversNavbarProps) {
  const pathname = usePathname();

  const links = [
    {
      name: "Terminal_Dash",
      href: `/${locale}/rovers/terminal`,
      icon: "🖥️",
      disabled: false,
    },
    {
      name: "Marketplace",
      href: `/${locale}/rovers/shop`,
      icon: "🛒",
      disabled: false,
    },
    {
      name: "Live_GPS_Map",
      href: `/${locale}/rovers/nav`,
      icon: "🗺️",
      disabled: !nightNavActive && !isAdmin, // lock for normal rovers if nav is disabled
    },
    {
      name: "Leaderboard",
      href: `/${locale}/rovers/leaderboard`,
      icon: "🏆",
      disabled: false,
    },
  ];

  return (
    <nav className="border-b border-amber-500/10 bg-zinc-950/30 py-2.5 px-4 overflow-x-auto scrollbar-thin">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 md:gap-8 min-w-max text-xs uppercase tracking-widest font-semibold">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");

          if (link.disabled) {
            return (
              <span
                key={link.name}
                className="text-zinc-600 border border-zinc-900 px-3 py-1.5 rounded flex items-center gap-1.5 cursor-not-allowed select-none bg-zinc-950/40 text-[11px]"
                title="Access Restricted // Locked by Admin Control"
              >
                <span>[🔒]</span> {link.name} (LOCKED)
              </span>
            );
          }

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`transition-all duration-300 flex items-center gap-1.5 py-1.5 px-3 border rounded ${
                isActive
                  ? "text-amber-400 border-amber-500/40 bg-amber-950/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                  : "text-zinc-400 border-transparent hover:text-amber-400 hover:border-amber-500/20 hover:bg-amber-950/15"
              }`}
            >
              <span>[{link.icon}]</span> {link.name}
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href={`/${locale}/rovers/admin`}
            className={`transition-all duration-300 flex items-center gap-1.5 py-1.5 px-3 border rounded font-extrabold ${
              pathname === `/${locale}/rovers/admin` || pathname.startsWith(`/${locale}/rovers/admin/`)
                ? "text-amber-300 border-amber-500/60 bg-amber-950/40 shadow-[0_0_10px_rgba(245,158,11,0.3)] animate-pulse"
                : "text-amber-500/80 border-amber-500/30 bg-amber-950/10 hover:bg-amber-950/20 hover:text-amber-400 hover:border-amber-500/40"
            }`}
          >
            <span>[⚙️]</span> Admin_Panel
          </Link>
        )}
      </div>
    </nav>
  );
}
