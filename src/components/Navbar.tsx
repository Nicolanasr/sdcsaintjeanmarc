"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, X, Globe, Anchor } from "lucide-react";
import { Dictionary } from "@/lib/dictionary";
import Image from "next/image";

interface NavbarProps {
    dict: Dictionary;
    locale: string;
}

export default function Navbar({ dict, locale }: NavbarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Handle scroll detection for solid background transition
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Switch locale inside current path
    const handleLanguageChange = (newLocale: string) => {
        if (newLocale === locale) return;
        const pathSegments = pathname.split("/");
        pathSegments[1] = newLocale;
        const newPath = pathSegments.join("/");
        router.push(newPath);
    };

    const navItems = [
        { name: dict.nav.home, href: `/${locale}` },
        { name: dict.nav.about, href: `/${locale}#about` },
        { name: dict.nav.sections, href: `/${locale}/sections` },
        { name: dict.nav.leadership, href: `/${locale}/leadership` },
        { name: dict.nav.agenda, href: `/${locale}/activities` },
        { name: dict.nav.gallery, href: `/${locale}/gallery` },
        { name: dict.nav.faq, href: `/${locale}#faq` },
        { name: dict.nav.contact, href: `/${locale}/contact` },
    ];

    const isHomepage = pathname === `/${locale}` || pathname === `/${locale}/` || pathname === "/";

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || !isHomepage
                ? "bg-scout-navy shadow-lg border-b border-scout-navy-light/30 text-white py-3"
                : "bg-transparent text-white py-5"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-12">
                    {/* Logo Brand */}
                    <Link
                        href={`/${locale}`}
                        className="flex items-center gap-2 group cursor-pointer"
                    >
                        <Image src="/sdc-logo-removebg-preview.png" height={50} width={50} className="filter invert-100" alt="SDC Saint Jean Marc logo" />
                        <div className="flex flex-col">
                            <span className="font-bold text-sm sm:text-base tracking-wide leading-tight font-display">
                                {dict.hero.title}
                            </span>
                            <span className="text-[10px] text-scout-gold-light leading-none font-semibold">
                                {dict.hero.subtitle}
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-sm font-medium opacity-80 hover:opacity-100 hover:text-scout-gold-light transition-all relative py-1 group"
                            >
                                {item.name}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-scout-gold transition-all duration-300 group-hover:w-full" />
                            </Link>
                        ))}

                        {/* Language Switcher */}
                        <div className="flex items-center gap-2 border-l border-white/20 pl-4 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-4">
                            <Globe className="w-4 h-4 text-scout-gold-light" />
                            <button
                                onClick={() => handleLanguageChange("en")}
                                className={`text-xs px-2 py-1 rounded transition-colors cursor-pointer ${locale === "en"
                                    ? "bg-scout-gold text-scout-navy font-semibold"
                                    : "opacity-75 hover:opacity-100 hover:text-scout-gold-light"
                                    }`}
                            >
                                EN
                            </button>
                            <button
                                onClick={() => handleLanguageChange("ar")}
                                className={`text-xs px-2 py-1 rounded transition-colors cursor-pointer ${locale === "ar"
                                    ? "bg-scout-gold text-scout-navy font-semibold"
                                    : "opacity-75 hover:opacity-100 hover:text-scout-gold-light"
                                    }`}
                            >
                                العربية
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        {/* Language Switcher Mobile Quick toggle */}
                        <button
                            onClick={() => handleLanguageChange(locale === "en" ? "ar" : "en")}
                            className="flex items-center gap-1 text-xs bg-white/10 px-2 py-1.5 rounded hover:bg-white/20 transition-all border border-white/10 cursor-pointer"
                        >
                            <Globe className="w-3.5 h-3.5 text-scout-gold-light" />
                            <span>{locale === "en" ? "العربية" : "EN"}</span>
                        </button>

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-white hover:text-scout-gold-light focus:outline-none transition-colors cursor-pointer"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer Menu */}
            {isOpen && (
                <div className="md:hidden glass-panel-dark animate-fade-in absolute top-full left-0 right-0 border-b border-scout-navy-light/35 shadow-2xl">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className="block px-3 py-2.5 rounded-md text-base font-medium text-white hover:bg-white/10 hover:text-scout-gold transition-all"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}
