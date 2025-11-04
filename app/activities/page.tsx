"use client";

import Image from "next/image";
import { GiCampfire, GiMountainCave, GiCompass } from "react-icons/gi";
import { FaHandsHelping } from "react-icons/fa";

import { CTAButton } from "@/components/cta-button";
import { useLanguage } from "@/components/language-provider";
import { translations } from "@/lib/translations";

const calendarDays = [
    { date: "Sat 7", title: "Trail Discovery", section: "Louveteaux" },
    { date: "Sun 8", title: "Patrol Leadership Lab", section: "Scouts" },
    { date: "Sat 14", title: "Family Campfire Night", section: "All sections" },
    { date: "Sun 15", title: "Community Garden Help", section: "Pionniers" },
    { date: "Sat 21", title: "River Kayak Basics", section: "Scouts" },
    { date: "Sun 22", title: "Service Visit", section: "Castors" },
    { date: "Sat 28", title: "Autumn Skills Prep", section: "All leaders" },
];

const categories = [
    {
        icon: GiCompass,
        title: "Outdoor Adventure",
        description:
            "Weekend hikes, camp craft, and challenges that build confidence in nature.",
    },
    {
        icon: FaHandsHelping,
        title: "Community Service",
        description:
            "Monthly service projects that let scouts make a difference close to home.",
    },
    {
        icon: GiCampfire,
        title: "Faith & Fellowship",
        description:
            "Shared moments around the campfire and gatherings that strengthen friendships.",
    },
    {
        icon: GiMountainCave,
        title: "Skill Workshops",
        description:
            "Hands-on sessions for first aid, pioneering, eco-awareness, and leadership.",
    },
];

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    alt: "Camp campfire",
    title: "Campfire night",
  },
  {
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
    alt: "Team hike",
    title: "Trail hike",
  },
  {
    src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
    alt: "River activity",
    title: "River challenge",
  },
  {
    src: "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?auto=format&fit=crop&w=1200&q=80",
    alt: "Service project",
    title: "Service day",
  },
];

export default function ActivitiesPage() {
    const { language } = useLanguage();
    const { activities, callToAction } = translations[language].home;

    const heroText =
        language === "ar"
            ? {
                badge: "تقويم النشاطات",
                title: "مغامراتنا القادمة",
                description:
                    "يبقى فوج سان جان مارك نشطاً طوال العام عبر مخيمات، طلعات، وخدمة مجتمعية لكل الفئات. إليكم لمحة عن ما ينتظر عائلاتكم.",
            }
            : {
                badge: "Activities Calendar",
                title: "Upcoming adventures & gatherings",
                description:
                    "The SDC Saint Jean Marc program keeps scouts moving with camps, service, and leadership opportunities. Explore what’s coming this month.",
            };

    const introParagraph =
        language === "ar"
            ? "نحرص على تقديم مزيج متوازن من المغامرة، الخدمة، والتكوين الروحي. يشارك الكشافون في نشاطات أسبوعية ودورات خاصة تبقى راسخة في ذاكرتهم."
            : "We weave together adventure, service, and faith-forming moments. Every section discovers experiences that grow character and leave lasting memories.";

    const featured = activities.items;

    return (
        <div className="space-y-16 pb-20">
            <section className="overflow-hidden rounded-3xl border border-slate-900/40 bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 px-6 py-16 shadow-xl md:px-12">
                <div className="mx-auto grid w-full max-w-6xl gap-12 md:grid-cols-[minmax(0,1.05fr),minmax(0,1fr)] md:items-center">
                    <div className="space-y-7 text-left text-white md:pr-8">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.35em] text-emerald-100 shadow-sm">
                            {heroText.badge}
                        </span>
                        <div className="space-y-5">
                            <h1 className="text-balance text-4xl font-bold leading-tight md:text-5xl">
                                {heroText.title}
                            </h1>
                            <p className="max-w-xl text-lg leading-relaxed text-emerald-50/90 md:text-xl">
                                {heroText.description}
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <CTAButton href="#calendar" variant="light">
                                {language === "ar" ? "اكتشف التقويم" : "View calendar"}
                            </CTAButton>
                            <CTAButton href="#featured" variant="ghost">
                                {language === "ar" ? "نشاطات بارزة" : "Highlighted events"}
                            </CTAButton>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur">
              <Image
                src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1500&q=80"
                alt="Scouts enjoying outdoor activities"
                width={1200}
                height={900}
                className="h-full w-full object-cover"
                priority
              />
                        </div>
                        <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-white/10 bg-white/10 px-6 py-4 text-center text-white backdrop-blur sm:flex-row sm:text-left">
                            <div className="min-w-[110px]">
                                <p className="text-2xl font-semibold text-white">4</p>
                                <p className="text-xs uppercase tracking-[0.3em] text-emerald-100/80">
                                    {language === "ar" ? "فروع نشطة" : "Active Sections"}
                                </p>
                            </div>
                            <div className="min-w-[110px]">
                                <p className="text-2xl font-semibold text-white">12</p>
                                <p className="text-xs uppercase tracking-[0.3em] text-emerald-100/80">
                                    {language === "ar" ? "نشاط شهري" : "Monthly Events"}
                                </p>
                            </div>
                            <div className="min-w-[110px]">
                                <p className="text-2xl font-semibold text-white">3</p>
                                <p className="text-xs uppercase tracking-[0.3em] text-emerald-100/80">
                                    {language === "ar" ? "رحلات كبرى" : "Major Camps"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-4xl text-center">
                <p className="text-lg text-slate-600 md:text-xl">{introParagraph}</p>
            </section>

            <section
                id="calendar"
                className="mx-auto w-full max-w-6xl space-y-8 rounded-3xl border border-slate-200 bg-white p-10 shadow-sm"
            >
                <div className="flex flex-col gap-2 text-left md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
                            {language === "ar" ? "تقويم شهر واحد" : "This month at a glance"}
                        </h2>
                        <p className="text-sm text-slate-500 md:text-base">
                            {language === "ar"
                                ? "نُحدّث هذا التقويم أسبوعياً لمتابعة النشاطات والعائلات المشاركة."
                                : "Check back each week for updates and registration notes for families."}
                        </p>
                    </div>
                    <CTAButton href="/contact" variant="outline">
                        {language === "ar" ? "اسأل عن نشاط" : "Ask about an activity"}
                    </CTAButton>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {calendarDays.map((day) => (
                        <div
                            key={day.date}
                            className="flex flex-col gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/40 px-5 py-4 shadow-sm"
                        >
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">
                                {day.date}
                            </p>
                            <p className="text-base font-semibold text-slate-900">
                                {day.title}
                            </p>
                            <p className="text-sm text-slate-600">{day.section}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl space-y-8">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
                            {language === "ar" ? "مجالات النشاط" : "Activity categories"}
                        </h2>
                        <p className="text-sm text-slate-500 md:text-base">
                            {language === "ar"
                                ? "نغطي أربعة مسارات رئيسية تضمن تنمية متوازنة لكل كشاف."
                                : "Four pillars ensure every scout experiences a balanced program all year long."}
                        </p>
                    </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    {categories.map((category) => (
                        <article
                            key={category.title}
                            className="flex items-start gap-4 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >
                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm">
                                <category.icon className="h-6 w-6" />
                            </span>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-slate-900">
                                    {category.title}
                                </h3>
                                <p className="text-sm text-slate-600">{category.description}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section
                id="featured"
                className="mx-auto w-full max-w-6xl space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
            >
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
                            {language === "ar" ? "نشاطات مميزة" : "Highlighted activities"}
                        </h2>
                        <p className="text-sm text-slate-500 md:text-base">
                            {language === "ar"
                                ? "خطة مختارة للأحداث التي لا تُفوّت في الشهر القادم."
                                : "A curated look at the standout events you won’t want to miss this month."}
                        </p>
                    </div>
                </div>
                <div className="flex snap-x gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
                    {featured.map((activity) => (
                        <article
                            key={activity.title}
                            className="snap-center rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md md:snap-align-none"
                        >
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">
                                {activity.date}
                            </p>
                            <h3 className="mt-3 text-xl font-semibold text-slate-900">
                                {activity.title}
                            </h3>
                            <p className="mt-3 text-sm text-slate-600">
                                {activity.description}
                            </p>
                            <p className="mt-4 text-sm font-semibold text-slate-500">
                                📍 {activity.location}
                            </p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl space-y-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
                            {language === "ar" ? "لمحات مصورة" : "Gallery preview"}
                        </h2>
                        <p className="text-sm text-slate-500 md:text-base">
                            {language === "ar"
                                ? "صور سريعة من مخيماتنا وورشاتنا الأخيرة."
                                : "A peek at recent camps, workshops, and service projects."}
                        </p>
                    </div>
                    <CTAButton href="/gallery" variant="outline">
                        {language === "ar" ? "شاهد المعرض" : "See full gallery"}
                    </CTAButton>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                    {galleryImages.map((item) => (
                        <div
                            key={item.alt}
                            className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                        >
                            <Image
                                src={item.src}
                                alt={item.alt}
                                width={600}
                                height={480}
                                className="h-40 w-full object-cover transition group-hover:scale-105"
                            />
                            <div className="px-4 py-3">
                                <p className="text-sm font-semibold text-slate-900">
                                    {item.title}
                                </p>
                            </div>
                        </div>
                    ))}
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
