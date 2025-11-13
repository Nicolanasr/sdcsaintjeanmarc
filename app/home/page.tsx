"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import {
    GiAcorn,
    GiCampfire,
    GiLaurelCrown,
    GiMountainCave,
    GiPathDistance,
    GiWolfHowl,
} from "react-icons/gi";
import { FaHandsHelping, FaQuoteLeft, FaSeedling } from "react-icons/fa";
import { FiCalendar, FiUsers } from "react-icons/fi";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import { CTAButton } from "@/components/cta-button";
import { useLanguage } from "@/components/language-provider";
import { translations } from "@/lib/translations";

export default function Home() {
    const { language } = useLanguage();
    const content = translations[language].home;
    const {
        hero,
        whoWeAre,
        sections,
        activities,
        gallery,
        highlightStrip,
        testimonial,
        callToAction,
    } = content;
    const englishActivitiesList = translations.en.home.activities.items;

    const whoHighlights = [
        {
            icon: GiCampfire,
            title: whoWeAre.highlights.mission.title,
            description: whoWeAre.highlights.mission.description,
        },
        {
            icon: GiPathDistance,
            title: whoWeAre.highlights.rhythm.title,
            description: whoWeAre.highlights.rhythm.description,
        },
        {
            icon: FaHandsHelping,
            title: whoWeAre.highlights.service.title,
            description: whoWeAre.highlights.service.description,
        },
        {
            icon: GiLaurelCrown,
            title: whoWeAre.highlights.leadership.title,
            description: whoWeAre.highlights.leadership.description,
        },
    ];

    const sectionVisuals = [
        {
            icon: GiAcorn,
            image:
                "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
            label: language === "ar" ? "فضول" : "Curiosity",
        },
        {
            icon: GiWolfHowl,
            image:
                "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80",
            label: language === "ar" ? "مغامرة" : "Adventure",
        },
        {
            icon: FaSeedling,
            image:
                "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?auto=format&fit=crop&w=800&q=80",
            label: language === "ar" ? "خدمة" : "Service",
        },
        {
            icon: GiMountainCave,
            image:
                "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80",
            label: language === "ar" ? "قيادة" : "Leadership",
        },
    ];

    const galleryVisuals = [
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    ];

    const localizedActivitiesList = activities.items;
    const nextEnglishEvent = useMemo(() => {
        const sorted = [...englishActivitiesList].sort(
            (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
        );
        return sorted[0];
    }, [englishActivitiesList]);

    const localizedNextEvent = useMemo(() => {
        if (!nextEnglishEvent) {
            return null;
        }
        return localizedActivitiesList.find((activity) => activity.slug === nextEnglishEvent.slug) ?? null;
    }, [localizedActivitiesList, nextEnglishEvent]);

    const highlightItems = useMemo(() => {
        const fallback = language === "ar" ? "يُعلن قريباً" : "To be announced";
        const nextValue = localizedNextEvent
            ? `${localizedNextEvent.title} · ${localizedNextEvent.date}`
            : fallback;

        return [
            {
                label: highlightStrip.nextEventLabel,
                value: nextValue,
            },
            ...highlightStrip.stats,
        ];
    }, [highlightStrip, language, localizedNextEvent]);

    const highlightIcons = [FiCalendar, FiUsers, GiCampfire];

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
                <section className="overflow-hidden md:rounded-3xl border border-slate-900/40 bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 px-6 py-16 shadow-xl md:px-12">
                    <div className="flex flex-col gap-12 md:flex-row md:items-center max-w-6xl mx-auto">
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
                                    className="h-full max-h-96 w-full object-cover"
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
            <section className="mx-auto w-full max-w-6xl overflow-hidden md:rounded-3xl md:border md:border-slate-200 md:bg-white md:shadow-sm">
                <div className="grid gap-0 md:grid-cols-[1.1fr,0.9fr]">
                    <div className="space-y-6 md:bg-emerald-50/60 md:p-10">
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-600/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.45em] text-emerald-700">
                            {language === "ar" ? "من نحن" : "Who We Are"}
                        </span>
                        <div className="space-y-4">
                            <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
                                {whoWeAre.title}
                            </h2>
                            {whoWeAre.paragraphs.map((paragraph, index) => (
                                <p key={index} className="text-base leading-relaxed text-slate-600 md:text-lg">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                        <div className="grid gap-3 text-sm text-slate-600">
                            <p className="flex items-center gap-3">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                {language === "ar"
                                    ? "برامج تربوية متوازنة من مرحلة إلى أخرى"
                                    : "Balanced programs that grow with each age section."}
                            </p>
                            <p className="flex items-center gap-3">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                {language === "ar"
                                    ? "رحلات وخدمة تعزز روح الفريق"
                                    : "Adventures and service projects that build teamwork."}
                            </p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 md:bg-white mt-4 md:mt-0 md:p-8">
                        {whoHighlights.map(({ icon: Icon, title, description }) => (
                            <div
                                key={title}
                                className="flex items-start gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 px-5 py-4 shadow-sm"
                            >
                                <span className="flex  md:h-full md:aspect-square items-center justify-center rounded-2xl bg-white text-emerald-600 shadow">
                                    <Icon className="h-1/2 w-1/2" />
                                </span>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                                        {title}
                                    </p>
                                    <p className="text-sm text-slate-600">{description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto -mt-6 w-full max-w-6xl rounded-[32px] border border-emerald-100 bg-white/90 p-4 shadow-lg backdrop-blur">
                <div className="grid gap-4 md:grid-cols-3">
                    {highlightItems.map((item, index) => {
                        const Icon = highlightIcons[index % highlightIcons.length];
                        return (
                            <div
                                key={item.label}
                                className="flex flex-col gap-2 rounded-3xl border border-emerald-50 bg-emerald-50/40 px-5 py-4"
                            >
                                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow">
                                        <Icon className="h-4 w-4" />
                                    </span>
                                    {item.label}
                                </span>
                                <p className="text-base font-semibold text-slate-900">
                                    {item.value}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </section>

            <SectionDivider />
            <SectionBlock
                title={sections.title}
                subtitle={sections.subtitle}
                ctaLabel={sections.cta}
                ctaHref="/sections"
            >
                <div className="grid gap-6 sm:grid-cols-2">
                    {sections.items.map((section, index) => {
                        const visual = sectionVisuals[index % sectionVisuals.length];
                        const SectionIcon = visual.icon;
                        return (
                            <article
                                key={section.name}
                                className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="relative h-44 w-full overflow-hidden">
                                    <Image
                                        src={visual.image}
                                        alt={section.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className="object-cover transition duration-500 group-hover:scale-105"
                                    />
                                    <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-60`} />
                                    <div className="absolute inset-0 flex items-end justify-between px-5 pb-4">
                                        <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">
                                            {visual.label}
                                        </span>
                                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-emerald-600 shadow">
                                            <SectionIcon className="h-6 w-6" />
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-1 flex-col gap-4 p-6">
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className="text-xl font-semibold text-slate-900">
                                            {section.name}
                                        </h3>
                                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                            {section.ageRange}
                                        </span>
                                    </div>
                                    <p className="text-sm leading-relaxed text-slate-600">
                                        {section.description}
                                    </p>
                                    <div className="mt-auto text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
                                        {language === "ar" ? "تعرّف على البرنامج" : "Discover the track"}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
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
                            className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="relative h-40 w-full overflow-hidden">
                                <Image
                                    src={activity.image}
                                    alt={activity.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                    className="object-cover transition duration-500 hover:scale-105"
                                />
                                <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-700">
                                    {activity.location}
                                </span>
                            </div>
                            <div className="flex flex-1 flex-col justify-between p-6">
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
                                <div className="mt-4 flex items-center justify-between text-sm font-semibold text-slate-500">
                                    <span>📍 {activity.location}</span>
                                    <span>→</span>
                                </div>
                            </div>
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
                    {gallery.items.map((item, index) => (
                        <article
                            key={item.title}
                            className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="relative h-48 w-full overflow-hidden">
                                <Image
                                    src={galleryVisuals[index % galleryVisuals.length]}
                                    alt={item.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover transition duration-500 group-hover:scale-105"
                                />
                                <div className={`absolute inset-0 ${item.background} opacity-70`} />
                                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-6">
                                    <h3 className="text-lg font-semibold text-white">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-emerald-100">{item.description}</p>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </SectionBlock>

            <section className="mx-auto w-full max-w-6xl rounded-[32px] border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/40 p-8 shadow-lg">
                <div className="flex flex-col gap-4 text-left">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">
                        {testimonial.title}
                    </p>
                    <Swiper
                        modules={[Autoplay, Pagination]}
                        slidesPerView={2}
                        spaceBetween={24}
                        autoplay={{ delay: 6000, disableOnInteraction: false }}
                        pagination={{ clickable: true }}
                        breakpoints={{
                            768: {
                                slidesPerView: 2,
                            },
                        }}
                        className="w-full"
                    >
                        {testimonial.items.map((item) => (
                            <SwiperSlide key={`${item.author}-${item.role}`}>
                                <article className="flex h-full flex-col justify-between rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-inner">
                                    <FaQuoteLeft className="h-7 w-7 text-emerald-400" />
                                    <p className="mt-4 text-base italic text-slate-700">
                                        {item.quote}
                                    </p>
                                    <div className="mt-6">
                                        <p className="text-base font-semibold text-slate-900">
                                            {item.author}
                                        </p>
                                        <p className="text-sm text-slate-500">{item.role}</p>
                                    </div>
                                </article>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </section>

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
        <section className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[32px] border border-emerald-50 bg-white/95 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
            <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:url('/forest-silhouette.svg')] [background-position:bottom] [background-repeat:no-repeat]" />
            <div className="relative">
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
            </div>
        </section>
    );
}

function SectionDivider() {
    return (
        <>
        </>
        // <div className="mx-auto my-12 w-full max-w-6xl">
        //     <div className="relative h-12 overflow-hidden rounded-3xl border border-emerald-50 bg-gradient-to-r from-emerald-50 via-white to-emerald-50">
        //         <div className="absolute inset-0 opacity-30 [background-image:url('/forest-silhouette.svg')] [background-position:bottom] [background-repeat:repeat-x]" />
        //     </div>
        // </div>
    );
}
