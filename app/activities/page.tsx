"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { addHours, format, getDay, parse, startOfMonth, startOfWeek } from "date-fns";
import { arSA } from "date-fns/locale/ar-SA";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { CTAButton } from "@/components/cta-button";
import { useLanguage } from "@/components/language-provider";
import { translations } from "@/lib/translations";

type CalendarEvent = {
    id: string;
    title: string;
    start: Date;
    end: Date;
    section: string;
    location: string;
    slug: string;
};

const locales = {
    "en-US": enUS,
    "ar-SA": arSA,
};

const localizer = dateFnsLocalizer({
    format,
    parse: (value: string, formatString: string) => parse(value, formatString, new Date()),
    startOfWeek: (date: Date, culture?: string) => {
        const localeKey = (culture ?? "en-US") as keyof typeof locales;
        return startOfWeek(date, { locale: locales[localeKey] ?? enUS });
    },
    getDay,
    locales,
});

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
    const router = useRouter();
    const englishActivities = translations.en.home.activities.items;
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

    const localizedActivities = activities.items;
    const featured = localizedActivities;
    const calendarCulture = language === "ar" ? "ar-SA" : "en-US";
    const locale = language === "ar" ? "ar-LB" : "en-US";
    const [currentDate, setCurrentDate] = useState(() => {
        const sortedDates = [...englishActivities]
            .map((item) => new Date(item.datetime))
            .sort((a, b) => a.getTime() - b.getTime());
        return startOfMonth(sortedDates[0] ?? new Date());
    });
    const monthLabel = useMemo(
        () =>
            new Intl.DateTimeFormat(locale, {
                month: "long",
                year: "numeric",
            }).format(currentDate),
        [locale, currentDate],
    );
    const dayFormatter = useMemo(
        () =>
            new Intl.DateTimeFormat(locale, {
                weekday: "short",
                day: "numeric",
                month: "short",
            }),
        [locale],
    );
    const timeFormatter = useMemo(
        () =>
            new Intl.DateTimeFormat(locale, {
                hour: "numeric",
                minute: "2-digit",
            }),
        [locale],
    );

    const calendarEvents = useMemo<CalendarEvent[]>(
        () =>
            localizedActivities.map((activity) => {
                const start = new Date(activity.datetime);
                const end = activity.endTime ? new Date(activity.endTime) : addHours(start, 2);

                return {
                    id: activity.slug,
                    title: activity.title,
                    start,
                    end,
                    section: activity.section,
                    location: activity.location,
                    slug: activity.slug,
                };
            }),
        [localizedActivities],
    );
    const monthEvents = useMemo(
        () =>
            calendarEvents
                .filter(
                    (event) =>
                        event.start.getMonth() === currentDate.getMonth() &&
                        event.start.getFullYear() === currentDate.getFullYear(),
                )
                .sort((a, b) => a.start.getTime() - b.start.getTime()),
        [calendarEvents, currentDate],
    );

    const calendarMessages = useMemo(
        () =>
            language === "ar"
                ? {
                    date: "التاريخ",
                    time: "الوقت",
                    event: "نشاط",
                    allDay: "طوال اليوم",
                    week: "أسبوع",
                    work_week: "أسبوع العمل",
                    day: "يوم",
                    month: "شهر",
                    previous: "السابق",
                    next: "التالي",
                    yesterday: "الأمس",
                    tomorrow: "غداً",
                    today: "اليوم",
                    agenda: "قائمة",
                    noEventsInRange: "لا توجد نشاطات في هذه الفترة.",
                }
                : undefined,
        [language],
    );

    const formatTimeRange = useCallback(
        (start: Date, end: Date) => {
            const sameDay =
                start.getFullYear() === end.getFullYear() &&
                start.getMonth() === end.getMonth() &&
                start.getDate() === end.getDate();

            if (sameDay) {
                return `${timeFormatter.format(start)} – ${timeFormatter.format(end)}`;
            }

            return `${dayFormatter.format(start)} · ${timeFormatter.format(start)} → ${dayFormatter.format(end)} · ${timeFormatter.format(end)}`;
        },
        [dayFormatter, timeFormatter],
    );

    const spotlights = useMemo(
        () =>
            language === "ar"
                ? [
                    {
                        badge: "رحلات مهارية",
                        title: "نتعلم في قلب الطبيعة",
                        description:
                            "فرق صغيرة يقودها قادتنا تتدرّب على إشعال النار، قراءة الخرائط، والسلامة الليلية من خلال سيناريوهات حقيقية تشجع الجرأة.",
                        image:
                            "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
                        statValue: "6",
                        statLabel: "مخيّمات ليلية سنوياً",
                    },
                    {
                        badge: "خدمة ورسالة",
                        title: "نخدم مجتمعنا",
                        description:
                            "من حملات التنظيف إلى زيارة المسنين، يعيش الكشافون الخدمة شهرياً ويكتشفون معنى القيادة المتواضعة.",
                        image:
                            "https://images.unsplash.com/photo-1460400355176-3680d9ab85fa?auto=format&fit=crop&w=1200&q=80",
                        statValue: "12",
                        statLabel: "مبادرة تطوعية",
                    },
                    {
                        badge: "لحظات إيمان",
                        title: "سهرات حول النار",
                        description:
                            "تتخلل كل طلعة لحظات صلاة وتأمل جماعي تشعل في القلوب روح الامتنان وتعزز الروابط بين الكشافين.",
                        image:
                            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
                        statValue: "1",
                        statLabel: "وقفة روحية أسبوعية",
                    },
                ]
                : [
                    {
                        badge: "Adventure Labs",
                        title: "Skills in the Wild",
                        description:
                            "Small teams led by our scouters practice fire building, navigation, and overnight safety through real-life scenarios that fuel courage.",
                        image:
                            "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
                        statValue: "6",
                        statLabel: "overnight camps / year",
                    },
                    {
                        badge: "Service Impact",
                        title: "Community First",
                        description:
                            "From riverbank cleanups to visiting seniors, scouts live out service every month and discover what humble leadership looks like.",
                        image:
                            "https://images.unsplash.com/photo-1460400355176-3680d9ab85fa?auto=format&fit=crop&w=1200&q=80",
                        statValue: "12",
                        statLabel: "service projects",
                    },
                    {
                        badge: "Faith Moments",
                        title: "Campfire Reflections",
                        description:
                            "Evening reflections and chapel moments invite scouts to root their adventures in gratitude, friendship, and prayerful silence.",
                        image:
                            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
                        statValue: "1",
                        statLabel: "weekly faith pause",
                    },
                ],
        [language],
    );

    const handleNavigate = useCallback((date: Date) => {
        setCurrentDate(startOfMonth(date));
    }, []);
    const handleSelectEvent = useCallback(
        (event: CalendarEvent) => {
            router.push(`/activities/${event.slug}`);
        },
        [router],
    );

    const eventStyleGetter = useCallback(() => {
        return {
            style: {
                backgroundColor: "#047857",
                borderRadius: "14px",
                border: "none",
                color: "#fff",
                padding: "4px 8px",
                boxShadow: "0 10px 20px rgba(4, 120, 87, 0.18)",
            },
        };
    }, []);

    return (
        <div className="space-y-16 pb-20 -my-10 -mx-6 md:-mx-12">
            <section className="overflow-hidden rounded-b border border-slate-900/40 bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 px-6 py-16 shadow-xl md:px-12">
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
                    {featured.map((activity) => {
                        const start = new Date(activity.datetime);
                        const end = activity.endTime ? new Date(activity.endTime) : addHours(start, 2);
                        const timeRange = formatTimeRange(start, end);

                        return (
                            <article
                                key={activity.slug}
                                className="snap-center rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md md:snap-align-none"
                            >
                                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">
                                    {activity.date}
                                </p>
                                <span className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-700">
                                    {activity.section}
                                </span>
                                <h3 className="mt-4 text-xl font-semibold text-slate-900">
                                    {activity.title}
                                </h3>
                                <p className="mt-2 text-sm text-emerald-600">
                                    {timeRange}
                                </p>
                                <p className="mt-3 text-sm text-slate-600">
                                    {activity.description}
                                </p>
                                <p className="mt-4 text-sm font-semibold text-slate-500">
                                    📍 {activity.location}
                                </p>
                                <CTAButton
                                    href={`/activities/${activity.slug}`}
                                    variant="outline"
                                    className="mt-5 w-fit text-xs sm:text-sm"
                                >
                                    {language === "ar" ? "اكتشف التفاصيل" : "See details"}
                                </CTAButton>
                            </article>
                        );
                    })}
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
                <div className="space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">
                        {language === "ar" ? `شهر ${monthLabel}` : `${monthLabel} calendar`}
                    </p>
                    <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-sm">
                        <Calendar
                            culture={calendarCulture}
                            events={calendarEvents}
                            date={currentDate}
                            onNavigate={handleNavigate}
                            onSelectEvent={handleSelectEvent}
                            localizer={localizer}
                            views={["month"]}
                            toolbar
                            messages={calendarMessages}
                            rtl={language === "ar"}
                            eventPropGetter={eventStyleGetter}
                            popup
                            tooltipAccessor={(event) => `${event.section} · ${event.location}`}
                            className="calendar-activities"
                            style={{ minHeight: 460 }}
                        />
                    </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {monthEvents.length > 0 ? (
                        monthEvents.map((event) => {
                            const sameDay =
                                event.start.getFullYear() === event.end.getFullYear() &&
                                event.start.getMonth() === event.end.getMonth() &&
                                event.start.getDate() === event.end.getDate();

                            const dayLabel = sameDay
                                ? dayFormatter.format(event.start)
                                : `${dayFormatter.format(event.start)} → ${dayFormatter.format(event.end)}`;
                            const timeLabel = formatTimeRange(event.start, event.end);

                            return (
                                <Link
                                    key={event.id}
                                    href={`/activities/${event.slug}`}
                                    className="flex flex-col gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/40 px-5 py-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                                >
                                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">
                                        {dayLabel}
                                    </p>
                                    <p className="text-base font-semibold text-slate-900">
                                        {event.title}
                                    </p>
                                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-500/80">
                                        {event.section}
                                    </p>
                                    <p className="text-sm text-slate-600">{timeLabel}</p>
                                    <p className="text-sm text-slate-500">{event.location}</p>
                                </Link>
                            );
                        })
                    ) : (
                        <p className="rounded-2xl border border-dashed border-emerald-100 bg-emerald-50/20 px-5 py-4 text-sm text-emerald-900/70">
                            {language === "ar"
                                ? "لا نشاطات مجدولة في هذا الشهر. تفقدوا الشهور الأخرى عبر التقويم."
                                : "No activities scheduled this month. Try exploring another month in the calendar."}
                        </p>
                    )}
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl space-y-8">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
                            {language === "ar"
                                ? "لماذا يعشق الكشافون برنامجنا"
                                : "Why scouts love our program"}
                        </h2>
                        <p className="text-sm text-slate-500 md:text-base">
                            {language === "ar"
                                ? "لقطات مصورة من مغامراتنا، خدمتنا، ولحظات الإيمان التي تصنع ذكريات مدى الحياة."
                                : "Visual snapshots of the adventures, service, and faith moments that shape lifelong memories."}
                        </p>
                    </div>
                    <CTAButton href="/join" variant="outline">
                        {language === "ar" ? "انضموا إلينا" : "Join the adventure"}
                    </CTAButton>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    {spotlights.map((item) => (
                        <article
                            key={item.title}
                            className="group overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="relative h-48 w-full overflow-hidden">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                    className="object-cover transition duration-500 group-hover:scale-105"
                                />
                                <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 shadow-sm">
                                    {item.badge}
                                </span>
                            </div>
                            <div className="space-y-3 px-6 py-6">
                                <h3 className="text-lg font-semibold text-slate-900">
                                    {item.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-slate-600">
                                    {item.description}
                                </p>
                                <div className="flex items-baseline gap-2 text-emerald-600">
                                    <span className="text-3xl font-bold">{item.statValue}</span>
                                    <span className="text-xs uppercase tracking-[0.3em] text-emerald-600/80">
                                        {item.statLabel}
                                    </span>
                                </div>
                            </div>
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
