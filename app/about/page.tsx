"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
    GiCampfire,
    GiCompass,
    GiMountains,
    GiStumpRegrowth,
    GiThreeFriends,
    GiVibratingShield,
} from "react-icons/gi";
import { FaHandsHelping } from "react-icons/fa";
import { FiCalendar, FiChevronDown, FiClock, FiMapPin } from "react-icons/fi";

import { CTAButton } from "@/components/cta-button";
import { useLanguage } from "@/components/language-provider";
import { translations } from "@/lib/translations";

const timelineIcons = [GiCampfire, GiThreeFriends, GiMountains, GiVibratingShield];
const pillarIcons = [GiCampfire, FaHandsHelping, GiCompass, GiStumpRegrowth];
const rhythmImage =
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80";

export default function AboutPage() {
    const { language } = useLanguage();
    const content = translations[language].about;
    const { hero, history, pillars, leadership, rhythm, impact, faq, callToAction } = content;
    const homeSections = translations[language].home.sections;
    const sectionsPreview = translations[language].sectionsPage.sections.slice(0, 4);
    const sectionAccents = [
        "from-emerald-50 via-white to-white",
        "from-lime-50 via-white to-white",
        "from-cyan-50 via-white to-white",
        "from-amber-50 via-white to-white",
    ];
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
    const leaderMap = useMemo(() => {
        const map: Record<string, (typeof leadership.items)[number]> = {};
        leadership.items.forEach((item) => {
            map[item.id] = item;
        });
        return map;
    }, [leadership]);
    const orgRows = leadership.orgChart.rows
        .map((row) => ({
            ...row,
            nodes: row.nodes
                .map(({ leader: leaderId, assistants: assistantIds }) => {
                    const leader = leaderMap[leaderId];
                    if (!leader) {
                        return null;
                    }
                    const assistants = assistantIds
                        .map((assistantId) => leaderMap[assistantId])
                        .filter(Boolean) as (typeof leadership.items)[number][];
                    return { leader, assistants };
                })
                .filter(Boolean) as { leader: (typeof leadership.items)[number]; assistants: (typeof leadership.items)[number][] }[],
        }))
        .filter((row) => row.nodes.length > 0);

    return (
        <div className="space-y-16 pb-20 ">
            <section className="-mx-6 md:-mx-12 overflow-hidden border border-slate-900/20 bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 px-6 py-16 text-white shadow-xl md:px-12">
                <div className="mx-auto grid w-full max-w-6xl gap-12 md:grid-cols-2 md:items-center">
                    <div className="space-y-6">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.35em] text-emerald-100">
                            {hero.badge}
                        </span>
                        <h1 className="text-4xl font-bold leading-tight md:text-5xl">{hero.title}</h1>
                        <p className="text-lg text-emerald-50/90">{hero.description}</p>
                        <div className="flex gap-3 flex-wrap">
                            <CTAButton href="/join" variant="light" className="whitespace-nowrap">
                                {language === "ar" ? "انضموا إلينا" : "Join the movement"}
                            </CTAButton>
                            <CTAButton href="#history" variant="ghost" className="whitespace-nowrap">
                                {language === "ar" ? "تعرّفوا على تاريخنا" : "Explore our history"}
                            </CTAButton>
                        </div>
                    </div>
                    <div className="relative h-80 w-full overflow-hidden rounded-[32px] border border-white/10 bg-white/10 shadow-2xl">
                        <Image
                            src={hero.image}
                            alt={hero.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover"
                            priority
                        />
                    </div>
                </div>
            </section>

            <SectionDivider />

            <section id="history" className="mx-auto w-full max-w-6xl space-y-6 md:rounded-3xl md:border md:border-slate-200 md:bg-white md:p-8 md:shadow-sm">
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <h2 className="text-3xl font-semibold text-slate-900">{history.title}</h2>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    {history.timeline.map((item, index) => {
                        const Icon = timelineIcons[index % timelineIcons.length];
                        return (
                            <article key={item.year} className="rounded-3xl border border-emerald-100 bg-emerald-50/30 p-5">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow">
                                        <Icon className="h-6 w-6" />
                                    </span>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
                                            {item.year}
                                        </p>
                                        <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                                    </div>
                                </div>
                                <p className="mt-3 text-sm text-slate-700">{item.description}</p>
                            </article>
                        );
                    })}
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl space-y-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <h2 className="text-3xl font-semibold text-slate-900">{pillars.title}</h2>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    {pillars.items.map((item, index) => {
                        const Icon = pillarIcons[index % pillarIcons.length];
                        return (
                            <article
                                key={item.title}
                                className="flex flex-col gap-4 rounded-3xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/40 p-6 shadow-sm"
                            >
                                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                                    <Icon className="h-6 w-6" />
                                </span>
                                <div>
                                    <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                                    <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>

            <SectionDivider />

            <section className="mx-auto w-full max-w-6xl space-y-10">
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <h2 className="text-3xl font-semibold text-slate-900">{leadership.title}</h2>
                </div>
                {/* <div className="grid gap-6 md:grid-cols-2">
                    {leadership.items.map((leader) => (
                        <article
                            key={leader.name}
                            className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative h-20 w-20 overflow-hidden rounded-2xl">
                                    <Image
                                        src={leader.photo}
                                        alt={leader.name}
                                        fill
                                        sizes="80px"
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-slate-900">{leader.name}</p>
                                    <p className="text-sm text-emerald-600">{leader.role}</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600">{leader.bio}</p>
                        </article>
                    ))}
                </div> */}
                <div className="space-y-6 rmd:ounded-3xl md:border border-emerald-100 md:bg-emerald-50/40 md:p-6">
                    {orgRows.map((row, rowIndex) => (
                        <div key={rowIndex} className="space-y-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600 text-center">
                                {row.label}
                            </p>
                            <div className={`flex flex-wrap justify-center ${row.compact ? "gap-6" : "gap-6"}`}>
                                {row.nodes.map((node) => (
                                    <OrgNode
                                        key={node.leader.id}
                                        leader={node.leader}
                                        assistants={node.assistants}
                                        highlight={row.highlight}
                                        compact={row.compact}
                                    />
                                ))}
                            </div>
                            {rowIndex < orgRows.length - 1 ? (
                                <div className="flex justify-center">
                                    <span className="h-10 w-0.5 bg-emerald-200" />
                                </div>
                            ) : null}
                        </div>
                    ))}
                </div>
            </section>

            <SectionDivider />

            <section className="mx-auto w-full max-w-6xl space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm">
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="text-3xl font-semibold text-slate-900">
                            {language === "ar" ? "فروعنا في لمحة" : "Our sections at a glance"}
                        </h2>
                        <p className="text-sm text-slate-600">
                            {language === "ar"
                                ? "من القنادس إلى المنجدات، يتدرّج البرنامج مع نمو الأولاد ويقدّم لهم مغامرات تناسب عمرهم."
                                : "From Castors to Pionniers, every age group follows a tailored path of service and adventure."}
                        </p>
                    </div>
                    <CTAButton href="/sections" variant="outline">
                        {homeSections.cta}
                    </CTAButton>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    {sectionsPreview.map((section, index) => (
                        <article
                            key={section.id}
                            className={`flex flex-col gap-4 rounded-3xl border border-slate-200 bg-gradient-to-br ${sectionAccents[index % sectionAccents.length]} p-6 shadow-sm`}
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-lg font-semibold text-slate-900">{section.name}</p>
                                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">
                                        {section.ageRange}
                                    </p>
                                </div>
                                <span className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                                    {section.motto}

                                </span>
                            </div>
                            <p className="text-sm text-slate-600">{section.motto}</p>
                            <div className="flex flex-col gap-3 rounded-2xl border border-white/60 bg-white/80 p-4 text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                        <FiClock className="h-4 w-4" />
                                    </span>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">
                                            {language === "ar" ? "موعد اللقاء" : "Meeting time"}
                                        </p>
                                        <p>{section.meeting}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                        <FiMapPin className="h-4 w-4" />
                                    </span>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">
                                            {language === "ar" ? "الطلائع" : "Patrols"}
                                        </p>
                                        <p>{section.leadership.patrols.slice(0, 2).map((patrol) => patrol.name).join(" · ")}</p>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <SectionDivider />

            <section className="mx-auto w-full max-w-6xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr),minmax(0,1.15fr)]">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-semibold text-slate-900">{rhythm.title}</h2>
                        <ul className="space-y-4">
                            {rhythm.schedule.map((item) => (
                                <li key={item.day} className="flex items-start gap-3">
                                    <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                        <FiCalendar className="h-4 w-4" />
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{item.day}</p>
                                        <p className="text-sm text-slate-600">{item.description}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4 rounded-3xl border border-emerald-100 bg-emerald-50/40 p-6">
                            <h3 className="text-xl font-semibold text-slate-900">{rhythm.participation.title}</h3>
                            <ol className="space-y-3 text-sm text-slate-700">
                                {rhythm.participation.steps.map((step, index) => (
                                    <li key={step} className="flex items-start gap-3">
                                        <span className="mt-1 text-sm font-semibold text-emerald-600">
                                            {index + 1}.
                                        </span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                        <div className="relative min-h-[220px] overflow-hidden rounded-3xl">
                            <Image
                                src={rhythmImage}
                                alt="Weekly gatherings"
                                fill
                                sizes="(max-width: 1024px) 100vw, 400px"
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-transparent" />
                            <div className="absolute bottom-4 left-4 text-white">
                                <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">{language === "ar" ? "كل سبت" : "Every Saturday"}</p>
                                <p className="text-xl font-semibold">SDC Saint Jean Marc</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <h2 className="text-3xl font-semibold text-slate-900">{impact.title}</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {impact.stats.map((stat) => (
                        <div key={stat.label} className="rounded-3xl border border-emerald-100 bg-emerald-50/40 px-6 py-5 text-center">
                            <p className="text-3xl font-bold text-emerald-700">{stat.value}</p>
                            <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="text-3xl font-semibold text-slate-900">{faq.title}</h2>
                <div className="space-y-4">
                    {faq.items.map((item, index) => {
                        const isOpen = openFaqIndex === index;
                        return (
                            <article key={item.question} className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/70">
                                <button
                                    type="button"
                                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                                    aria-expanded={isOpen}
                                >
                                    <span className="text-lg font-semibold text-slate-900">{item.question}</span>
                                    <FiChevronDown
                                        className={`h-5 w-5 text-emerald-600 transition ${isOpen ? "rotate-180" : "rotate-0"}`}
                                    />
                                </button>
                                <div
                                    className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                                        }`}
                                >
                                    <div className="overflow-hidden px-5 pb-4">
                                        <p className="text-sm text-slate-600">{item.answer}</p>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl rounded-3xl bg-emerald-600 px-6 py-12 text-center text-white shadow-lg">
                <h2 className="text-3xl font-semibold md:text-4xl">{callToAction.title}</h2>
                <p className="mx-auto mt-4 max-w-3xl text-lg text-emerald-50/90">{callToAction.description}</p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <CTAButton href="/contact" variant="light">
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

function OrgNode({
    leader,
    assistants,
    highlight = false,
    compact = false,
}: {
    leader: LeaderItem;
    assistants: LeaderItem[];
    highlight?: boolean;
    compact?: boolean;
}) {
    const widthClass = compact ? "w-36 md:w-56" : "w-36 md:w-56";
    return (
        <div
            className={`flex  ${widthClass} flex-col items-center gap-4 rounded-3xl border ${highlight ? "border-emerald-300 bg-white" : "border-white/60 bg-white/80"
                } p-4 text-center shadow`}
        >
            <LeaderCardLink member={leader} size="lg" />
            {assistants.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-3">
                    {assistants.map((assistant) => (
                        <LeaderCardLink key={assistant.id} member={assistant} size="sm" />
                    ))}
                </div>
            ) : null}
        </div>
    );
}

type LeaderItem = (typeof translations)["en"]["about"]["leadership"]["items"][number];

function LeaderCardLink({ member, size = "lg" }: { member: LeaderItem; size?: "lg" | "sm" }) {
    const avatarSize = size === "lg" ? "h-20 w-20" : "h-14 w-14";
    const nameClass = size === "lg" ? "text-sm" : "text-xs";
    const roleClass = size === "lg" ? "text-[10px]" : "text-[9px]";
    return (
        <Link
            href={`/about/leadership/${member.id}`}
            className="flex flex-col items-center gap-2 text-center transition hover:text-emerald-700"
        >
            <div className={`relative ${avatarSize} overflow-hidden rounded-full border border-emerald-100`}>
                <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    sizes={size === "lg" ? "80px" : "56px"}
                    className="object-cover"
                />
            </div>
            <p className={`${nameClass} font-semibold text-slate-900`}>{member.name}</p>
            <p className={`${roleClass} uppercase tracking-[0.3em] text-emerald-600`}>{member.role}</p>
        </Link>
    );
}

function SectionDivider() {
    return (
        <></>
        // <div className="mx-auto my-12 w-full max-w-6xl">
        //     <div className="relative h-12 overflow-hidden rounded-3xl border border-emerald-50 bg-gradient-to-r from-emerald-50 via-white to-emerald-50">
        //         <div className="absolute inset-0 opacity-30 [background-image:url('/forest-silhouette.svg')] [background-position:bottom] [background-repeat:repeat-x]" />
        //     </div>
        // </div>
    );
}
