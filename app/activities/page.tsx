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
import { ContentSection } from "@/components/content-section";
import { PageHero } from "@/components/page-hero";
import { useLanguage } from "@/components/language-provider";
import { usePageContent } from "@/hooks/use-page-content";
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

export default function ActivitiesPage() {
    const { language } = useLanguage();
    const router = useRouter();
    const englishActivities = translations.en.home.activities.items;
    const homeContent = usePageContent("home");
    const activitiesContent = usePageContent("activitiesPage");
    const { activities, callToAction } = homeContent;
    const { hero, intro, featured, calendar, spotlights, spotlightsIntro, galleryPreview } = activitiesContent;

    const localizedActivities = activities.items;
    const featuredActivities = localizedActivities;
    const calendarCulture = language === "ar" ? "ar-SA" : "en-US";
    const locale = language === "ar" ? "ar-LB" : "en-US";
    const [currentDate, setCurrentDate] = useState(() => startOfMonth(new Date()));
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
    const calendarBadge = `${calendar.badgePrefix}${monthLabel}${calendar.badgeSuffix}`;

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
        <div className="space-y-16 pb-20">
            <PageHero
                badge={hero.badge}
                title={hero.title}
                description={hero.description}
                image={hero.image}
                imagePriority
                actions={
                    <div className="flex flex-wrap gap-3">
                        <CTAButton href={hero.primaryCta.href} variant="light">
                            {hero.primaryCta.label}
                        </CTAButton>
                        <CTAButton href={hero.secondaryCta.href} variant="ghost">
                            {hero.secondaryCta.label}
                        </CTAButton>
                    </div>
                }
                footer={
                    <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.3em] text-emerald-100/80">
                        {hero.highlights.map((item) => (
                            <span key={item} className="rounded-full border border-white/20 px-3 py-1">
                                {item}
                            </span>
                        ))}
                    </div>
                }
            />

            <ContentSection id="featured" bordered padded backgroundClass="bg-white" className="space-y-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">{featured.title}</h2>
                        <p className="text-sm text-slate-500 md:text-base">{featured.subtitle}</p>
                    </div>
                </div>
                <div className="flex snap-x gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
                    {featuredActivities.map((activity) => {
                        const start = new Date(activity.datetime);
                        const end = activity.endTime ? new Date(activity.endTime) : addHours(start, 2);
                        const timeRange = formatTimeRange(start, end);

                        console.log(end > new Date())
                        return (
                            end > new Date() &&
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
            </ContentSection>

            <ContentSection className="text-center" maxWidthClass="max-w-4xl">
                <p className="text-lg text-slate-600 md:text-xl">{intro}</p>
            </ContentSection>

            <ContentSection
                id="calendar"
                bordered
                backgroundClass="bg-white"
                className="space-y-8 p-6 md:p-10"
            >
                <div className="flex flex-col gap-2 text-left md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">{calendar.title}</h2>
                        <p className="text-sm text-slate-500 md:text-base">{calendar.subtitle}</p>
                    </div>
                    <CTAButton href={calendar.ctaHref} variant="outline">
                        {calendar.ctaLabel}
                    </CTAButton>
                </div>
                <div className="space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">
                        {calendarBadge}
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
            </ContentSection>

            <ContentSection className="space-y-8">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">{spotlightsIntro.title}</h2>
                        <p className="text-sm text-slate-500 md:text-base">{spotlightsIntro.subtitle}</p>
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
            </ContentSection>


            <ContentSection className="space-y-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">{galleryPreview.title}</h2>
                        <p className="text-sm text-slate-500 md:text-base">{galleryPreview.subtitle}</p>
                    </div>
                    <CTAButton href="/gallery" variant="outline">
                        {galleryPreview.ctaLabel}
                    </CTAButton>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                    {galleryPreview.images.map((item) => (
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
            </ContentSection>

            <ContentSection
                bordered
                padded
                backgroundClass="bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600"
                borderClassName="border-emerald-500/60"
                className="text-center text-white"
                maxWidthClass="max-w-5xl"
            >
                <h2 className="text-3xl font-semibold md:text-4xl">{callToAction.title}</h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-emerald-50/90">{callToAction.description}</p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <CTAButton href="/join" variant="light">
                        {callToAction.primaryCta}
                    </CTAButton>
                    <CTAButton href="/contact" variant="ghost">
                        {callToAction.secondaryCta}
                    </CTAButton>
                </div>
            </ContentSection>
        </div>
    );
}
