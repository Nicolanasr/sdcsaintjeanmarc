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
            name: "Leaderboard",
            href: `/${locale}/rovers/leaderboard`,
            icon: "🏆",
            disabled: false,
        },
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
    ];

    return (
        <nav className="border-b border-amber-500/10 bg-zinc-950/80 backdrop-blur-md py-2.5 px-4 sticky top-[69px] z-30">
            <div className="max-w-7xl mx-auto grid grid-cols-2 sm:flex sm:flex-row sm:flex-wrap sm:justify-center items-center gap-2 text-[10px] sm:text-xs uppercase tracking-widest font-semibold">
                {links.map((link) => {
                    const isActive = pathname === link.href || pathname.startsWith(link.href + "/");

                    if (link.disabled) {
                        return (
                            <span
                                key={link.name}
                                className="text-zinc-600 border border-zinc-900/60 px-3 py-2 rounded flex items-center justify-center gap-1.5 cursor-not-allowed select-none bg-zinc-950/40 text-[10px]"
                                title="Access Restricted // Locked by Admin Control"
                            >
                                <span>[🔒]</span> {link.name.replace("_", " ")}
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`transition-all duration-300 relative flex items-center justify-center gap-1.5 py-2 px-3 border rounded text-center ${isActive
                                    ? "text-amber-400 border-amber-500/40 bg-amber-950/30 shadow-[0_0_8px_rgba(245,158,11,0.15)] font-bold"
                                    : "text-zinc-400 border-transparent hover:text-amber-400 hover:border-amber-500/25 hover:bg-amber-950/10"
                                }`}
                        >
                            <span>[{link.icon}]</span> {link.name.replace("_", " ")}
                            {isActive && (
                                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse" />
                            )}
                        </Link>
                    );
                })}

                {isAdmin && (
                    <Link
                        href={`/${locale}/rovers/admin`}
                        className={`transition-all duration-300 relative flex items-center justify-center gap-1.5 py-2 px-3 border rounded text-center font-extrabold col-span-2 sm:col-auto ${pathname === `/${locale}/rovers/admin` || pathname.startsWith(`/${locale}/rovers/admin/`)
                                ? "text-amber-300 border-amber-500/60 bg-amber-950/40 shadow-[0_0_10px_rgba(245,158,11,0.25)]"
                                : "text-amber-500/90 border-amber-500/30 bg-amber-950/10 hover:bg-amber-950/20 hover:text-amber-400 hover:border-amber-500/50"
                            }`}
                    >
                        <span>[⚙️]</span> Admin Panel
                        {(pathname === `/${locale}/rovers/admin` || pathname.startsWith(`/${locale}/rovers/admin/`)) && (
                            <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-amber-400 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.9)] animate-pulse" />
                        )}
                    </Link>
                )}
            </div>
        </nav>
    );
}
