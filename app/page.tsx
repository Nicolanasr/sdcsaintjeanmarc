"use client";

import Image from "next/image";

const CONTACT_EMAIL = "info@sdcsaintjeanmarc.org";
const CONTACT_PHONE = "+9613724473";
const CONTACT_WHATSAPP = "+9613724473";

const STAR_POINTS = [
    { cx: 6, cy: 12, r: 0.18 },
    { cx: 12, cy: 28, r: 0.22 },
    { cx: 18, cy: 8, r: 0.16 },
    { cx: 24, cy: 42, r: 0.2 },
    { cx: 30, cy: 18, r: 0.24 },
    { cx: 36, cy: 6, r: 0.12 },
    { cx: 42, cy: 32, r: 0.2 },
    { cx: 48, cy: 14, r: 0.26 },
    { cx: 54, cy: 24, r: 0.18 },
    { cx: 60, cy: 10, r: 0.2 },
    { cx: 66, cy: 34, r: 0.22 },
    { cx: 72, cy: 16, r: 0.18 },
    { cx: 78, cy: 4, r: 0.14 },
    { cx: 84, cy: 22, r: 0.24 },
    { cx: 90, cy: 12, r: 0.16 },
    { cx: 96, cy: 30, r: 0.22 },
    { cx: 10, cy: 62, r: 0.2 },
    { cx: 20, cy: 74, r: 0.18 },
    { cx: 34, cy: 58, r: 0.24 },
    { cx: 46, cy: 68, r: 0.2 },
    { cx: 58, cy: 78, r: 0.18 },
    { cx: 70, cy: 60, r: 0.22 },
    { cx: 82, cy: 72, r: 0.2 },
    { cx: 94, cy: 64, r: 0.18 },
    { cx: 14, cy: 88, r: 0.2 },
    { cx: 26, cy: 94, r: 0.15 },
    { cx: 38, cy: 82, r: 0.2 },
    { cx: 50, cy: 90, r: 0.17 },
    { cx: 62, cy: 96, r: 0.2 },
    { cx: 74, cy: 88, r: 0.18 },
    { cx: 86, cy: 94, r: 0.2 },
    { cx: 98, cy: 86, r: 0.16 },
    { cx: 5, cy: 48, r: 0.17 },
    { cx: 17, cy: 54, r: 0.23 },
    { cx: 29, cy: 46, r: 0.19 },
    { cx: 41, cy: 50, r: 0.2 },
    { cx: 53, cy: 44, r: 0.16 },
    { cx: 65, cy: 48, r: 0.21 },
    { cx: 77, cy: 56, r: 0.18 },
    { cx: 89, cy: 46, r: 0.22 },
];

export default function Home() {
    return (
        <div className="flex w-full flex-col items-center gap-12 text-center md:py-20 fixed top-0 bottom-0 overflow-auto">
            <BackgroundGlow />
            <section className="space-y-6 mt-auto relative">
                <Image src="/sdc-logo-removebg-preview.png" alt="logo" height={200} width={200} className="relative mx-auto z-50 brightness-[5]" />
                <p className="text-xs font-semibold uppercase tracking-[0.5em] text-emerald-300/80">
                    Site Under construction
                </p>
                <h1 className="text-balance text-5xl font-bold tracking-[0.2em] text-white md:text-6xl">
                    Coming Soon
                </h1>
                <div className="mx-auto h-1 w-56 rounded-full bg-emerald-500/40">
                    <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-200 to-emerald-100 shadow-lg" />
                </div>
            </section>

            <Pillars />

            <ContactCard />

            <footer className="flex flex-col items-center gap-3 text-xs uppercase tracking-[0.4em] text-slate-500/70 mb-auto relative">
                <span>Stay Curious · Stay Prepared</span>
                <span>© {new Date().getFullYear()} SDC Saint Jean Marc</span>
            </footer>
        </div>
    );
}

function ContactCard() {
    const contactMethods = [
        {
            label: CONTACT_EMAIL,
            href: `mailto:${CONTACT_EMAIL}`,
            icon: MailIcon,
            description: "Email",
        },
        {
            label: CONTACT_PHONE,
            href: `tel:${CONTACT_PHONE.replace(/[^+\d]/g, "")}`,
            icon: PhoneIcon,
            description: "Call",
        },
        {
            label: CONTACT_WHATSAPP,
            href: `https://wa.me/${CONTACT_WHATSAPP.replace(/\D/g, "")}`,
            icon: WhatsAppIcon,
            description: "WhatsApp",
            external: true,
        },
    ];

    return (
        <div className="flex w-full max-w-lg flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 px-8 py-6 backdrop-blur-md">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200/80">
                Contact us
            </p>
            <div className="flex flex-col gap-3 text-base font-medium text-white/90">
                {contactMethods.map(({ label, href, icon: Icon, description, external }) => (
                    <a
                        key={label + href}
                        href={href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noreferrer" : undefined}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-emerald-300/40 hover:text-emerald-100"
                    >
                        <span className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-emerald-200" />
                            <span className="text-sm uppercase tracking-[0.3em] text-slate-300/80">{description}</span>
                        </span>
                        <span className="text-sm font-semibold text-white/90">{label}</span>
                    </a>
                ))}
            </div>
        </div>
    );
}

function Pillars() {
    const items = [
        { label: "Adventure", icon: CompassIcon },
        { label: "Leadership", icon: FlagIcon },
        { label: "Service", icon: HandshakeIcon },
    ];

    return (
        <div className="flex flex-wrap items-center flex-col md:flex-row justify-center gap-6 text-sm uppercase tracking-[0.35em] text-slate-300/70 relative">
            {items.map(({ label, icon: Icon }) => (
                <span key={label} className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-emerald-300/80" />
                    {label}
                </span>
            ))}
        </div>
    );
}

function BackgroundGlow() {
    return (
        <>
            <div className="absolute inset-0 overflow-hidden">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25)_0%,_rgba(13,17,23,0.6)_55%,_rgba(5,7,15,1)_100%)]" />
                <div className="pointer-events-none absolute inset-0 bg-[url('/forest-silhouette.svg')] bg-bottom bg-no-repeat opacity-80" />
                <div className="pointer-events-none absolute inset-0 animate-pulse-slow bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.18)_0%,_rgba(5,7,15,0.2)_60%,_rgba(5,7,15,0.9)_100%)] mix-blend-screen" />
                <Stars />
            </div>
        </>
    );
}

function Stars() {
    return (
        <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
        >
            {STAR_POINTS.map((point, index) => (
                <circle
                    key={index}
                    cx={point.cx}
                    cy={point.cy}
                    r={point.r}
                    fill="rgba(255,255,255,0.6)"
                />
            ))}
        </svg>
    );
}

function MailIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
        </svg>
    );
}

function PhoneIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h3l2 5-2.2 1.1a11 11 0 0 0 5.1 5.1L13 13l5 2v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4 6.2 2 2 0 0 1 4 4z" />
        </svg>
    );
}

function WhatsAppIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.04 2a9.9 9.9 0 0 0-8.48 15.08L3 22l4.1-1.54A10 10 0 1 0 12.04 2Zm5.96 14.28c-.25.7-1.44 1.33-2 1.42-.52.08-1.2.11-1.94-.12-.45-.14-1.02-.33-1.76-.65-3.1-1.35-5.12-4.48-5.28-4.69-.16-.21-1.26-1.66-1.26-3.17 0-1.5.79-2.23 1.07-2.54.28-.3.62-.38.82-.38h.6c.19 0 .44-.07.69.53.25.6.85 2.07.93 2.22.08.15.13.32.02.52-.11.21-.16.32-.32.5-.16.18-.34.4-.48.54-.16.16-.32.33-.14.65.18.32.8 1.32 1.72 2.14 1.18 1.05 2.18 1.38 2.5 1.54.32.16.5.14.68-.09.18-.23.78-.91.99-1.22.21-.3.42-.25.7-.15.28.1 1.79.84 2.1.99.32.15.53.22.61.34.08.12.08.68-.17 1.38Z" />
        </svg>
    );
}

function CompassIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="12 8 16 16 8 16 12 8" />
        </svg>
    );
}

function FlagIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4v16" />
            <path d="M4 4h10l-2.5 4L14 12H4" />
        </svg>
    );
}

function HandshakeIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12 7 8h3l2 2 2-2h3l4 4" />
            <path d="M17 9v7a2 2 0 0 1-2 2h-1l-1.5-2" />
            <path d="m8 10-5 5a2 2 0 0 0 2.83 2.83L8 15" />
            <path d="m14 14 2 3a2 2 0 0 0 2.83 0L22 14" />
        </svg>
    );
}
