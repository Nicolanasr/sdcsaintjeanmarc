"use client";

import Image from "next/image";
import Link from "next/link";
import { addHours } from "date-fns";
import { useMemo } from "react";

import { CTAButton } from "@/components/cta-button";
import { useLanguage, type Language } from "@/components/language-provider";
import type { ActivityContent } from "@/lib/translations";

type ActivityDetailProps = {
	event: Record<Language, ActivityContent>;
	related: Record<Language, ActivityContent[]>;
};

export function ActivityDetail({ event, related }: ActivityDetailProps) {
	const { language } = useLanguage();
	const locale = language === "ar" ? "ar-LB" : "en-US";
	const content = event[language];
	const start = new Date(content.datetime);
	const end = content.endTime ? new Date(content.endTime) : addHours(start, 2);

	const dateFormatter = useMemo(
		() =>
			new Intl.DateTimeFormat(locale, {
				weekday: "long",
				day: "numeric",
				month: "long",
				year: "numeric",
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

	const dateLabel = dateFormatter.format(start);
	const sameDay =
		start.getFullYear() === end.getFullYear() &&
		start.getMonth() === end.getMonth() &&
		start.getDate() === end.getDate();

	const detailedSchedule = sameDay
		? `${timeFormatter.format(start)} – ${timeFormatter.format(end)}`
		: `${dateFormatter.format(start)} · ${timeFormatter.format(start)} → ${dateFormatter.format(end)} · ${timeFormatter.format(end)}`;

	const details = useMemo(
		() => [
			{
				label: language === "ar" ? "التاريخ" : "Date",
				value: dateLabel,
			},
			{
				label: language === "ar" ? "البرنامج الزمني" : "Schedule",
				value: detailedSchedule,
			},
			{
				label: language === "ar" ? "المكان" : "Location",
				value: content.location,
			},
			{
				label: language === "ar" ? "الفروع المعنية" : "Sections",
				value: content.section,
			},
			{
				label: language === "ar" ? "جهة الاتصال" : "Point of contact",
				value: content.contact,
			},
		],
		[content.contact, content.location, content.section, dateLabel, detailedSchedule, language],
	);

	const relatedEvents = related[language];

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col gap-12 py-12">
			<Link
				href="/activities"
				className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
			>
				{language === "ar" ? "← العودة إلى النشاطات" : "← Back to activities"}
			</Link>

			<article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
				<div className="relative h-80 w-full md:h-96">
					<Image
						src={content.image}
						alt={content.title}
						fill
						sizes="(max-width: 768px) 100vw, 960px"
						className="object-cover"
						priority
					/>
					<div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
					<div className="absolute bottom-5 left-0 right-0 flex justify-center px-6">
						<div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.3em]">
							<span className="rounded-full bg-white/80 px-4 py-1 text-emerald-700 shadow">
								{content.section}
							</span>
							<span className="rounded-full bg-white/60 px-4 py-1 text-emerald-900 shadow">
								{content.location}
							</span>
						</div>
					</div>
				</div>

				<div className="space-y-10 px-6 py-8 md:px-10 md:py-10">
					<header className="space-y-3">
						<p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">
							{dateLabel}
						</p>
						<h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
							{content.title}
						</h1>
						<p className="max-w-3xl text-base leading-relaxed text-slate-600 md:text-lg">
							{content.description}
						</p>
					</header>

					<div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)]">
						<section className="space-y-4 rounded-3xl border border-emerald-100 bg-emerald-50/40 p-6">
							<h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">
								{language === "ar" ? "تفاصيل الحدث" : "Event details"}
							</h2>
							<ul className="space-y-3 text-sm text-slate-700">
								{details.map((detail) => (
									<li key={detail.label}>
										<span className="block text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">
											{detail.label}
										</span>
										<span className="mt-1 block text-base text-slate-800">
											{detail.value}
										</span>
									</li>
								))}
							</ul>
						</section>
						<div className="space-y-6">
							<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
								<h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-700">
									{language === "ar" ? "ماذا ينتظر الكشافين" : "What scouts will experience"}
								</h3>
								<ul className="mt-4 space-y-3 text-sm text-slate-700">
									{content.highlights.map((item) => (
										<li key={item} className="flex items-start gap-3">
											<span className="mt-1 inline-block h-2.5 w-2.5 flex-none rounded-full bg-emerald-500" />
											<span>{item}</span>
										</li>
									))}
								</ul>
							</section>
							<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
								<h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-700">
									{language === "ar" ? "الأغراض التي يجب إحضارها" : "What to bring"}
								</h3>
								<ul className="mt-4 space-y-3 text-sm text-slate-700">
									{content.gear.map((item) => (
										<li key={item} className="flex items-start gap-3">
											<span className="mt-1 inline-block h-2.5 w-2.5 flex-none rounded-full bg-emerald-500" />
											<span>{item}</span>
										</li>
									))}
								</ul>
							</section>
						</div>
					</div>

					<div className="flex flex-col gap-3 sm:flex-row">
						<CTAButton href="/contact" variant="solid">
							{language === "ar" ? "تواصلوا مع الفريق" : "Talk with our leaders"}
						</CTAButton>
						<CTAButton href="/join" variant="ghost">
							{language === "ar" ? "سجلوا أولادكم" : "Register your scout"}
						</CTAButton>
					</div>
				</div>
			</article>

			{relatedEvents.length > 0 ? (
				<section className="space-y-6">
					<div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
						<div>
							<h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
								{language === "ar" ? "نشاطات أخرى قادمة" : "More upcoming activities"}
							</h2>
							<p className="text-sm text-slate-500 md:text-base">
								{language === "ar"
									? "استكشفوا نشاطات إضافية تناسب فئات أخرى أو مواعيد لاحقة."
									: "Explore other events that might fit your section or schedule."}
							</p>
						</div>
						<CTAButton href="/activities" variant="outline">
							{language === "ar" ? "العودة إلى التقويم" : "Back to calendar"}
						</CTAButton>
					</div>
					<div className="grid gap-4 md:grid-cols-3">
						{relatedEvents.slice(0, 3).map((item) => {
							const relatedStart = new Date(item.datetime);
							const relatedEnd = item.endTime ? new Date(item.endTime) : addHours(relatedStart, 2);
							const relatedDate = dateFormatter.format(relatedStart);
							const relatedSameDay =
								relatedStart.getFullYear() === relatedEnd.getFullYear() &&
								relatedStart.getMonth() === relatedEnd.getMonth() &&
								relatedStart.getDate() === relatedEnd.getDate();
							const relatedSchedule = relatedSameDay
								? `${timeFormatter.format(relatedStart)} – ${timeFormatter.format(relatedEnd)}`
								: `${dateFormatter.format(relatedStart)} → ${dateFormatter.format(relatedEnd)}`;

							return (
								<Link
									key={item.slug}
									href={`/activities/${item.slug}`}
									className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
								>
									<span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
										{relatedDate}
									</span>
									<h3 className="text-lg font-semibold text-slate-900">
										{item.title}
									</h3>
									<p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500/70">
										{item.section}
									</p>
									<p className="text-sm text-emerald-600">
										{relatedSchedule}
									</p>
									<p className="text-sm text-slate-600">
										{item.description}
									</p>
								</Link>
							);
						})}
					</div>
				</section>
			) : null}
		</div>
	);
}
