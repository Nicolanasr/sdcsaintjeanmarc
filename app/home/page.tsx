"use client";

import Image from "next/image";
import Link from "next/link";

import { useLanguage } from "@/components/language-provider";
import { translations } from "@/lib/translations";

export default function Home() {
    const { language } = useLanguage();
    const content = translations[language].home;
    const { hero, whoWeAre, sections, activities, gallery, callToAction } =
        content;

    const heroStats =
        language === "ar"
            ? [
                { value: "80+", label: "كشاف نشط" },
                { value: "20", label: "قائد متطوع" },
                { value: "1957", label: "عام التأسيس" },
            ]
            : [
                { value: "80+", label: "Active Scouts" },
                { value: "20", label: "Volunteer Leaders" },
                { value: "1957", label: "Founded" },
            ];

    return (
        <div className="space-y-16 pb-20">
            <div className="-mx-6 md:-mx-12 lg:-mx-16">
                <section className="overflow-hidden rounded-3xl border border-slate-900/40 bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 px-6 py-16 shadow-xl md:px-12">
                    <div className="flex flex-col gap-12 md:flex-row md:items-center">
                        <div className="space-y-7 text-left text-white md:flex-1">
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.35em] text-emerald-100 shadow-sm">
                                {hero.badge}
                            </span>
                            <div className="space-y-5">
                                <h1 className="text-balance text-4xl font-bold leading-tight md:text-5xl">
                                    {hero.title}
                                </h1>
                                <p className="max-w-xl text-lg leading-relaxed text-emerald-50/90 md:text-xl">
                                    {hero.description}
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row text-center">
                                <CTAButton href="/join" variant="light">
                                    {hero.primaryCta}
                                </CTAButton>
                                <CTAButton href="/sections" variant="ghost">
                                    {hero.secondaryCta}
                                </CTAButton>
                            </div>
                            <div className="flex flex-wrap gap-6 text-xs uppercase tracking-[0.2em] md:tracking-[0.4em] text-emerald-100/80">
                                <span>Adventure</span>
                                <span>Leadership</span>
                                <span>Service</span>
                            </div>
                        </div>
                        <div className="space-y-6 md:flex-1">
                            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur">
                                <Image
                                    src={hero.heroImage}
                                    alt="Scouts illustration"
                                    width={1920}
                                    height={1920}
                                    className="h-full w-full object-cover"
                                    priority
                                />
                            </div>
                            <div className="flex flex-row items-center justify-between gap-6 rounded-3xl border border-white/10 bg-white/10 px-6 py-4 text-center text-white backdrop-blur sm:flex-row sm:text-left">
                                {heroStats.map((item) => (
                                    <div key={item.label} className="md:min-w-[110px] text-center">
                                        <p className="text-2xl font-semibold text-white">{item.value}</p>
                                        <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-emerald-100/80">
                                            {item.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <section className="mx-auto grid w-full max-w-6xl gap-10 rounded-3xl border border-slate-200 bg-white p-10 shadow-sm md:grid-cols-[2fr,3fr] md:items-center">
                <div className="space-y-5">
                    <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
                        {whoWeAre.title}
                    </h2>
                    {whoWeAre.paragraphs.map((paragraph, index) => (
                        <p key={index} className="text-base text-slate-600 md:text-lg">
                            {paragraph}
                        </p>
                    ))}
                </div>
                <div className="grid gap-4 rounded-3xl bg-slate-50 p-6">
                    <HighlightBlock
                        title={whoWeAre.highlights.mission.title}
                        description={whoWeAre.highlights.mission.description}
                    />
                    <HighlightBlock
                        title={whoWeAre.highlights.rhythm.title}
                        description={whoWeAre.highlights.rhythm.description}
                    />
                    <HighlightBlock
                        title={whoWeAre.highlights.service.title}
                        description={whoWeAre.highlights.service.description}
                    />
                    <HighlightBlock
                        title={whoWeAre.highlights.leadership.title}
                        description={whoWeAre.highlights.leadership.description}
                    />
                </div>
            </section>

            <SectionBlock
                title={sections.title}
                subtitle={sections.subtitle}
                ctaLabel={sections.cta}
                ctaHref="/sections"
            >
                <div className="grid gap-6 sm:grid-cols-2">
                    {sections.items.map((section) => (
                        <article
                            key={section.name}
                            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <h3 className="text-xl font-semibold text-slate-900">
                                    {section.name}
                                </h3>
                                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                    {section.ageRange}
                                </span>
                            </div>
                            <p className="mt-4 text-sm leading-relaxed text-slate-600">
                                {section.description}
                            </p>
                        </article>
                    ))}
                </div>
            </SectionBlock>

            <SectionBlock
                title={activities.title}
                subtitle={activities.subtitle}
                ctaLabel={activities.cta}
                ctaHref="/activities"
            >
                <div className="grid gap-6 md:grid-cols-3">
                    {activities.items.map((activity) => (
                        <article
                            key={activity.title}
                            className="flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >
                            <div className="space-y-3">
                                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                                    {activity.date}
                                </p>
                                <h3 className="text-xl font-semibold text-slate-900">
                                    {activity.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-slate-600">
                                    {activity.description}
                                </p>
                            </div>
                            <p className="mt-4 text-sm font-semibold text-slate-500">
                                📍 {activity.location}
                            </p>
                        </article>
                    ))}
                </div>
            </SectionBlock>

            <SectionBlock
                title={gallery.title}
                subtitle={gallery.subtitle}
                ctaLabel={gallery.cta}
                ctaHref="/gallery"
            >
                <div className="grid gap-6 sm:grid-cols-2">
                    {gallery.items.map((item) => (
                        <article
                            key={item.title}
                            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >
                            <div
                                className={`flex h-44 flex-col justify-end rounded-3xl ${item.background} p-6`}
                            >
                                <h3 className="text-lg font-semibold text-slate-900">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-slate-700">{item.description}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </SectionBlock>

            <section className="mx-auto w-full max-w-6xl rounded-3xl bg-emerald-600 px-6 py-12 text-center text-white shadow-lg">
                <h2 className="text-3xl font-semibold md:text-4xl">
                    {callToAction.title}
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-emerald-50/90">
                    {callToAction.description}
                </p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <CTAButton href="/join" variant="light">
                        {callToAction.primaryCta}
                    </CTAButton>
                    <CTAButton href="/contact" variant="ghost">
                        {callToAction.secondaryCta}
                    </CTAButton>
                </div>
            </section>
        </div>
    );
}

function HighlightBlock({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                {title}
            </p>
            <p className="mt-2 text-sm text-slate-600">{description}</p>
        </div>
    );
}

function SectionBlock({
    title,
    subtitle,
    ctaHref,
    ctaLabel,
    children,
}: {
    title: string;
    subtitle: string;
    ctaHref: string;
    ctaLabel: string;
    children: React.ReactNode;
}) {
    return (
        <section className="mx-auto w-full max-w-6xl">
            <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
                        {title}
                    </h2>
                    <p className="text-slate-600">{subtitle}</p>
                </div>
                <Link
                    href={ctaHref}
                    className="text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
                >
                    {ctaLabel}
                </Link>
            </div>
            {children}
        </section>
    );
}

function CTAButton({
    href,
    children,
    variant,
}: {
    href: string;
    children: React.ReactNode;
    variant: "solid" | "outline" | "light" | "ghost";
}) {
    const base =
        "rounded-full px-6 py-3 text-base font-semibold transition hover:-translate-y-0.5";
    const styles =
        variant === "solid"
            ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
            : variant === "light"
                ? "bg-white text-emerald-700 shadow-sm hover:bg-slate-100"
                : variant === "ghost"
                    ? "border border-white/70 text-white hover:border-white hover:bg-white/10"
                    : "border border-emerald-200 text-emerald-700 hover:border-emerald-300 hover:text-emerald-800";

    return (
        <Link href={href} className={`${base} ${styles}`}>
            {children}
        </Link>
    );
}
