"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { FiMenu, FiX } from "react-icons/fi";

import { translations, type LayoutContent } from "@/lib/translations";

import { LanguageSwitcher } from "./language-switcher";
import { useLanguage } from "./language-provider";

const navLinks: Array<{ key: keyof LayoutContent["nav"]; href: string }> = [
    { key: "home", href: "/home" },
    { key: "about", href: "/about" },
    { key: "sections", href: "/sections" },
    { key: "activities", href: "/activities" },
    { key: "gallery", href: "/gallery" },
    { key: "join", href: "/join" },
    { key: "contact", href: "/contact" },
];

export function SiteHeader() {
    const { language } = useLanguage();
    const pathname = usePathname();
    const layout = translations[language].layout;
    const [menuOpen, setMenuOpen] = useState(false);

    const handleToggle = () => setMenuOpen((open) => !open);
    const handleNavigate = () => setMenuOpen(false);

    return (
        <header className="border-b border-emerald-100/60 bg-white/90 shadow-sm backdrop-blur ">
            <nav className="mx-auto w-full max-w-6xl px-6 py-4">
                <div className="flex items-center justify-between md:gap-6">
                    <Link href="/home" className="flex items-center gap-2">
                        <Image
                            src="/sdc-logo-removebg-preview.png"
                            height={64}
                            width={64}
                            alt="SDC Saint Jean Marc logo"
                            className="h-14 w-14 object-contain"
                        />
                        <div className="hidden flex-col leading-tight md:flex">
                            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                {layout.groupTagline}
                            </span>
                            <span className="text-lg font-semibold text-slate-900">
                                {layout.groupName}
                            </span>
                        </div>
                    </Link>
                    <div className="flex items-center gap-3 md:hidden">
                        <LanguageSwitcher />
                        <button
                            type="button"
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-emerald-100 bg-white text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
                            onClick={handleToggle}
                            aria-expanded={menuOpen}
                            aria-label="Toggle navigation menu"
                        >
                            {menuOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
                        </button>
                    </div>
                    <div className="hidden flex-1 items-center justify-end gap-3 text-sm font-medium md:flex">
                        <NavLinks layout={layout} pathname={pathname} />
                        <LanguageSwitcher />
                    </div>
                </div>
                {menuOpen ? (
                    <div className="mt-4 flex flex-col gap-3 text-sm font-medium md:hidden">
                        <NavLinks
                            layout={layout}
                            pathname={pathname}
                            mobile
                            onNavigate={handleNavigate}
                        />
                    </div>
                ) : null}
            </nav>
        </header>
    );
}

function NavLinks({
    layout,
    pathname,
    mobile = false,
    onNavigate,
}: {
    layout: LayoutContent;
    pathname: string;
    mobile?: boolean;
    onNavigate?: () => void;
}) {
    return (
        <div
            className={
                mobile
                    ? "flex flex-col gap-2 rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-sm"
                    : "flex flex-wrap items-center gap-2"
            }
        >
            {navLinks.map((item) => {
                const isActive = pathname === item.href;
                const isJoin = item.key === "join";

                const baseClass = isJoin
                    ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700";

                const activeClass =
                    !isJoin && isActive
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "";

                const padding = mobile ? "px-4 py-3" : "px-4 py-2";

                return (
                    <Link
                        key={item.key}
                        href={item.href}
                        className={`rounded-full ${padding} transition ${baseClass} ${activeClass}`}
                        onClick={onNavigate}
                    >
                        {layout.nav[item.key]}
                    </Link>
                );
            })}
        </div>
    );
}
