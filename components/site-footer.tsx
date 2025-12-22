"use client";

import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FiPhoneCall } from "react-icons/fi";
import { HiOutlineMail } from "react-icons/hi";
import Link from "next/link";

import { translations } from "@/lib/translations";

import { useLanguage } from "./language-provider";
import Image from "next/image";

const CONTACT_EMAIL = "info@sdcsaintjeanmarc.org";
const CONTACT_PHONE = "+96179013907";
const CONTACT_PHONE_DISPLAY = "+961 79 013 907";
const CONTACT_WHATSAPP = "+96179013907";
const INSTAGRAM_HANDLE = "@sdcsaintjeanmarc";
const INSTAGRAM_URL = "https://instagram.com/sdcsaintjeanmarc";
const FACEBOOK_HANDLE = "sdcsaintjeanmarc";
const FACEBOOK_URL = "https://facebook.com/sdcsaintjeanmarc";

export function SiteFooter() {
    const { language } = useLanguage();
    const layout = translations[language].layout;
    const labels =
        language === "ar"
            ? {
                connect: "تواصل معنا",
                follow: "تابعنا",
                email: "البريد الإلكتروني",
                phone: "الهاتف",
                whatsapp: "واتساب",
                instagram: "انستغرام",
                facebook: "فيسبوك",
                motto: "كن فضولياً · كن مستعداً",
                navigation: "التنقل",
            }
            : {
                connect: "Connect",
                follow: "Follow",
                email: "Email",
                phone: "Mobile",
                whatsapp: "WhatsApp",
                instagram: "Instagram",
                facebook: "Facebook",
                motto: "Stay Curious · Stay Prepared",
                navigation: "Navigation",
            };

    const socialLinks = [
        {
            label: labels.instagram,
            value: INSTAGRAM_HANDLE,
            href: INSTAGRAM_URL,
            icon: FaInstagram,
            external: true,
        },
        {
            label: labels.facebook,
            value: FACEBOOK_HANDLE,
            href: FACEBOOK_URL,
            icon: FaFacebookF,
            external: true,
        },
    ];

    const contactLinks = [
        {
            label: labels.email,
            value: CONTACT_EMAIL,
            href: `mailto:${CONTACT_EMAIL}`,
            icon: HiOutlineMail,
        },
        {
            label: labels.phone,
            value: CONTACT_PHONE_DISPLAY,
            href: `tel:${CONTACT_PHONE.replace(/[^+\d]/g, "")}`,
            icon: FiPhoneCall,
        },
        {
            label: labels.whatsapp,
            value: CONTACT_PHONE_DISPLAY,
            href: `https://wa.me/${CONTACT_WHATSAPP.replace(/\D/g, "")}`,
            icon: FaWhatsapp,
            external: true,
        },
    ];

    const navLinks = [
        { label: layout.nav.home, href: "/" },
        { label: layout.nav.about, href: "/about" },
        { label: layout.nav.sections, href: "/sections" },
        { label: layout.nav.activities, href: "/activities" },
        { label: layout.nav.gallery, href: "/gallery" },
        { label: layout.nav.join, href: "/join" },
        { label: layout.nav.contact, href: "/contact" },
    ];

    return (
        <footer className="border-t border-emerald-100/60 bg-white/95">
            <div className="mx-auto w-full max-w-6xl px-6 py-8">
                <div className="grid gap-8 md:grid-cols-3">
                    <div className="space-y-3">
                        <Image src="/sdc-logo-removebg-preview.png" height={100} width={100} alt="SDC Saint Jean Marc logo" className="h-24 w-24 object-contain" />
                        <p className="text-xs font-semibold uppercase tracking-[0.45em] text-emerald-600">
                            SDC
                        </p>
                        <div className="space-y-2">
                            <p className="text-xl font-semibold text-slate-900">
                                {layout.groupName}
                            </p>
                            <p className="text-sm text-slate-600">
                                {layout.footerMission}
                            </p>
                        </div>
                        <p className="text-sm text-slate-500">{layout.footerSchedule}</p>
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.45em] text-emerald-600">
                            {labels.navigation}
                        </p>
                        <nav className="grid gap-2 text-sm text-slate-600">
                            {navLinks.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="transition hover:text-emerald-700"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.45em] text-emerald-600">
                            {labels.follow}
                        </p>
                        <div className="grid gap-2 text-sm text-slate-600">
                            {socialLinks.map(({ label, value, href, icon: Icon, external }) => (
                                <a
                                    key={label + href}
                                    href={href}
                                    target={external ? "_blank" : undefined}
                                    rel={external ? "noreferrer" : undefined}
                                    className="flex items-center gap-3 transition hover:text-emerald-700"
                                >
                                    <Icon className="h-4 w-4 text-emerald-600" />
                                    <span>{value}</span>
                                </a>
                            ))}
                        </div>
                        <div className="grid gap-2 text-sm text-slate-600">
                            {contactLinks.map(({ label, value, href, icon: Icon, external }) => (
                                <a
                                    key={label + href}
                                    href={href}
                                    target={external ? "_blank" : undefined}
                                    rel={external ? "noreferrer" : undefined}
                                    className="flex items-center gap-3 transition hover:text-emerald-700"
                                >
                                    <Icon className="h-4 w-4 text-emerald-600" />
                                    <span>{value}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex flex-col gap-2 border-t border-emerald-100/60 pt-4 text-xs uppercase tracking-[0.3em] text-slate-500 md:flex-row md:items-center md:justify-between">
                    <span>{labels.motto}</span>
                    <span>© {new Date().getFullYear()} SDC {layout.groupName}</span>
                </div>
            </div>
        </footer>
    );
}
