"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { IconType } from "react-icons";
import {
    FiCalendar,
    FiChevronDown,
    FiClock,
    FiDownload,
    FiFileText,
    FiMapPin,
    FiPhoneCall,
    FiUser,
    FiUserPlus,
    FiUsers,
} from "react-icons/fi";
import { GiCampfire, GiCompass, GiPathDistance } from "react-icons/gi";

import { CTAButton } from "@/components/cta-button";
import { ContentSection } from "@/components/content-section";
import { FaqAccordion } from "@/components/faq-accordion";
import { useLanguage } from "@/components/language-provider";
import { PageHero } from "@/components/page-hero";
import { usePageContent } from "@/hooks/use-page-content";
import { translations } from "@/lib/translations";

const accentGradients = [
    "from-emerald-500/20 via-white to-white",
    "from-lime-400/20 via-white to-white",
    "from-cyan-400/20 via-white to-white",
    "from-amber-300/20 via-white to-white",
    "from-emerald-600/20 via-white to-white",
    "from-rose-300/20 via-white to-white",
];

const statIconMap: Record<string, IconType> = {
    campfire: GiCampfire,
    community: FiUsers,
    calendar: FiCalendar,
};
const fallbackStatsIcons: IconType[] = [GiCampfire, FiUsers, FiCalendar];

export default function SectionsPage() {
    const { language } = useLanguage();
    const content = usePageContent("sectionsPage");
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    const heroHighlights =
        language === "ar"
            ? ["برنامج تدريجي", "مرافقة شخصية", "حياة طليعة نابضة"]
            : ["Progressive program", "Personal mentoring", "Vibrant patrol life"];

    const overviewHeading =
        language === "ar" ? "كيف يعمل كل فرع" : "How each branch comes alive";

    const timelineSteps =
        language === "ar"
            ? [
                { month: "أيلول", title: "انطلاق السنة", description: "لقاء التعارف وتسليم البرنامج الجديد لكل الفروع." },
                { month: "تشرين الأول", title: "أول مخيم", description: "مخيم مهارات يختبر الطلائع في الحياة الكشفية." },
                { month: "كانون الأول", title: "خدمة الميلاد", description: "مبادرات روحية وخدمة اجتماعية مع العائلات المحتاجة." },
                { month: "شباط", title: "تبديل المسؤوليات", description: "القادة الناشئون يتسلمون أدواراً جديدة داخل الطلائع." },
                { month: "نيسان", title: "حج الفصح", description: "مسار تأملي ومخيم صغير يعمّق الحياة الروحية." },
                { month: "حزيران", title: "مخيم صيفي", description: "ختام السنة بمغامرة ممتدة لكل الفروع." },
            ]
            : [
                { month: "Sep", title: "Season kickoff", description: "Welcome weekend with program brief for every family." },
                { month: "Oct", title: "Skills camp", description: "First overnight where patrols test pioneering and cooking." },
                { month: "Dec", title: "Christmas service", description: "Community outreach and parish celebrations." },
                { month: "Feb", title: "Leadership swap", description: "Assistant patrol leaders rotate into new responsibilities." },
                { month: "Apr", title: "Easter pilgrimage", description: "Prayer hike and bivouac focused on faith formation." },
                { month: "Jun", title: "Summer camp", description: "Week-long expedition closing the scouting year." },
            ];

    const resourceCards =
        language === "ar"
            ? [
                {
                    title: "دليل البرنامج",
                    description: "تحميل نظرة تفصيلية عن الاجتماعات والمخيمات.",
                    icon: FiDownload,
                    href: "/docs/program-guide.pdf",
                },
                {
                    title: "لائحة الزيّ",
                    description: "كل ما يحتاجه ابنكم من شارة وحذاء ومعدات.",
                    icon: FiFileText,
                    href: "/docs/uniform-checklist.pdf",
                },
                {
                    title: "تواصلوا مع قائد الفرع",
                    description: "احجزوا مكالمة قصيرة للإجابة عن أي سؤال.",
                    icon: FiPhoneCall,
                    href: "/contact",
                },
            ]
            : [
                {
                    title: "Program guide",
                    description: "Download the full schedule with milestones and camps.",
                    icon: FiDownload,
                    href: "/docs/program-guide.pdf",
                },
                {
                    title: "Uniform checklist",
                    description: "Know exactly what scarf, badges, and gear to bring.",
                    icon: FiFileText,
                    href: "/docs/uniform-checklist.pdf",
                },
                {
                    title: "Talk to a section chief",
                    description: "Book a quick call to ask about capacity or routines.",
                    icon: FiPhoneCall,
                    href: "/contact",
                },
            ];

    return (
        <div className="space-y-16 pb-20">
            <PageHero
                badge={content.hero.badge}
                title={content.hero.title}
                description={content.hero.description}
                image={content.hero.image}
                imagePriority
                actions={
                    <div className="flex flex-wrap gap-3">
                        <CTAButton href={content.hero.ctaLink ?? "#sections-grid"} variant="light">
                            {content.hero.cta}
                        </CTAButton>
                        <CTAButton href="/about" variant="ghost">
                            {language === "ar" ? "تعرّفوا على قادتنا" : "Meet the leadership"}
                        </CTAButton>
                    </div>
                }
                footer={
                    <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.3em] text-emerald-100/80">
                        {heroHighlights.map((item) => (
                            <span key={item} className="rounded-full border border-white/20 px-3 py-1">
                                {item}
                            </span>
                        ))}
                    </div>
                }
            />

            <ContentSection bordered padded>
                <div className="grid gap-8 md:grid-cols-[1.15fr,0.85fr] md:items-start">
                    <div className="space-y-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">
                            {language === "ar" ? "نظرة عامة" : "Overview"}
                        </p>
                        <h2 className="text-3xl font-semibold text-slate-900">{overviewHeading}</h2>
                        <p className="text-base text-slate-600">{content.overview.text}</p>
                        <div className="grid gap-4 sm:grid-cols-3">
                            {content.overview.stats.map((stat, index) => {
                                const Icon =
                                    (stat.icon ? statIconMap[stat.icon] : undefined) ??
                                    fallbackStatsIcons[index % fallbackStatsIcons.length];
                                return (
                                    <div
                                        key={stat.label}
                                        className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-center"
                                    >
                                        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-emerald-600 shadow">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <p className="text-xl font-semibold text-slate-900">{stat.value}</p>
                                        <p className="text-xs uppercase tracking-[0.3em] text-emerald-600/80">{stat.label}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className=" grid gap-4 rounded-3xl md:border md:border-slate-200 md:bg-white md:p-6 md:shadow-sm grid-cols-1 md:grid-cols-3">
                        {content.sections.map((section) => (
                            <a href={`#${section.id}`} key={section.id} className="flex items-center gap-4 rounded-2xl border border-slate-100/80 bg-slate-50/80 p-4">
                                <div className="relative h-16 w-16 overflow-hidden rounded-2xl">
                                    <Image
                                        src={section.image}
                                        alt={section.name}
                                        fill
                                        sizes="64px"
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">{section.name}</p>
                                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">{section.ageRange}</p>
                                    <p className="text-xs text-slate-600">{section.motto}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </ContentSection>


            <ContentSection id="sections-grid" className="space-y-6" maxWidthClass="max-w-none md:max-w-6xl">
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="text-3xl font-semibold text-slate-900">
                            {language === "ar" ? "اكتشفوا كل فرع" : "Dive into each section"}
                        </h2>
                        <p className="text-sm text-slate-600">
                            {language === "ar"
                                ? "اضغطوا على أي فرع للتعرّف على شعاره، برنامج الاجتماعات، والطلائع التي تضبط حياة الفرع."
                                : "Explore the motto, meeting rhythm, and patrol crews that make each branch unique."}
                        </p>
                    </div>
                </div>
                <div className="grid gap-6 lg:grid-cols-2 -mx-8 md:mx-0">
                    {content.sections.map((section, index) => (
                        <SectionCard
                            key={section.id}
                            section={section}
                            accent={accentGradients[index % accentGradients.length]}
                            isRtl={language === "ar"}
                            expanded={expandedSection === section.id}
                            onToggle={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                        />
                    ))}
                </div>
            </ContentSection>

            <ContentSection bordered padded className="bg-white/95 space-y-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">
                            {language === "ar" ? "موارد سريعة" : "Quick resources"}
                        </p>
                        <h2 className="text-3xl font-semibold text-slate-900">
                            {language === "ar" ? "كل ما تحتاجونه للانطلاق" : "Everything to get started"}
                        </h2>
                    </div>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    {resourceCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <a
                                key={card.title}
                                href={card.href}
                                className="flex flex-col gap-3 rounded-3xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/40 p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200"
                            >
                                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                                    <Icon className="h-5 w-5" />
                                </span>
                                <p className="text-lg font-semibold text-slate-900">{card.title}</p>
                                <p className="text-sm text-slate-600">{card.description}</p>
                                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">
                                    {language === "ar" ? "اكتشفوا المزيد →" : "Learn more →"}
                                </span>
                            </a>
                        );
                    })}
                </div>
            </ContentSection>

            <ContentSection bordered padded className="bg-white/95 space-y-6 text-center" maxWidthClass="max-w-5xl">
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">
                        {language === "ar" ? "الأسئلة المتكررة" : "Frequently asked"}
                    </p>
                    <h2 className="text-3xl font-semibold text-slate-900">
                        {language === "ar" ? "تفاصيل تنظيم الفروع" : "Details about sections"}
                    </h2>
                </div>
                <FaqAccordion items={content.faq} initialOpen={0} />
            </ContentSection>

            <ContentSection
                bordered
                padded
                backgroundClass="bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600"
                borderClassName="border-emerald-500/60"
                className="text-center text-white"
                maxWidthClass="max-w-5xl"
            >
                <div className="mx-auto flex max-w-4xl flex-col items-center gap-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-100/90">
                        {language === "ar" ? "الخطوة التالية" : "Next step"}
                    </p>
                    <h2 className="text-3xl font-semibold">{content.cta.title}</h2>
                    <p className="text-base text-emerald-50/90">{content.cta.description}</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <CTAButton href="/join" variant="light">
                            {content.cta.primary}
                        </CTAButton>
                        <CTAButton href="/contact" variant="ghost">
                            {content.cta.secondary}
                        </CTAButton>
                    </div>
                </div>
            </ContentSection>
        </div>
    );
}

type SectionContent = (typeof translations)["en"]["sectionsPage"]["sections"][number];

function SectionCard({
    section,
    accent,
    isRtl,
    expanded,
    onToggle,
}: {
    section: SectionContent;
    accent: string;
    isRtl: boolean;
    expanded: boolean;
    onToggle: () => void;
}) {
    const chips = [GiCompass, GiPathDistance, GiCampfire];
    const meetingParts = section.meeting.split("·");
    const inferredLocation =
        meetingParts.length > 1 ? meetingParts[meetingParts.length - 1].trim() : section.meeting;
    const previewPatrols = section.leadership.patrols.slice(0, 2);
    const patrolSummary =
        previewPatrols.length > 0
            ? previewPatrols.map((patrol) => patrol.name).join(isRtl ? " • " : " · ")
            : isRtl
                ? "اضغطوا لعرض الطلائع"
                : "Toggle to view patrol roster";

    return (
        <article id={section.id} className={` flex flex-col gap-5 md:rounded-3xl border border-slate-200 bg-gradient-to-br ${accent} p-6 shadow-sm`}>
            <div className="flex flex-col gap-3">
                <p className="text-xs uppercase tracking-[0.35em] text-emerald-600">{section.ageRange}</p>
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <h3 className="text-2xl font-semibold text-slate-900">{section.name}</h3>
                        <p className="text-sm text-emerald-700">{section.motto}</p>
                    </div>
                    <span className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {isRtl ? "فرع" : "Section"}
                    </span>
                </div>
            </div>
            <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-white/60">
                <Image src={section.image} alt={section.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </div>
            <p className="text-sm text-slate-600">{section.description}</p>
            <div className="flex flex-wrap gap-2">
                {section.focus.map((item, index) => {
                    const Icon = chips[index % chips.length];
                    return (
                        <span
                            key={item}
                            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs text-emerald-700"
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {item}
                        </span>
                    );
                })}
            </div>
            <div className="grid gap-3 -mx-4 md:mx-0 md:rounded-2xl border border-slate-200 bg-white/90 p-4 sm:grid-cols-2">
                <InfoRow icon={FiClock} label={isRtl ? "موعد اللقاء" : "Meeting time"} value={section.meeting} />
                <InfoRow icon={FiMapPin} label={isRtl ? "المكان" : "Location"} value={inferredLocation} />
            </div>
            <div className="-mx-4 md:mx-0 md:rounded-2xl border border-emerald-100 bg-white/90 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-emerald-600">
                    {isRtl ? "فريق القيادة" : "Leadership team"}
                </p>
                <div className="mt-4 flex flex-wrap gap-4">
                    <LeaderBadge label={isRtl ? "القائد" : "Chief"} person={section.leadership.chief} />
                    {section.leadership.assistants.map((assistant, index) => (
                        <LeaderBadge
                            key={`${assistant.name}-${index}`}
                            label={
                                section.leadership.assistants.length > 1
                                    ? `${isRtl ? "المعاون" : "Assistant"} ${index + 1}`
                                    : isRtl ? "المعاون" : "Assistant"
                            }
                            person={assistant}
                            size="sm"
                        />
                    ))}
                </div>
            </div>
            <div className="-mx-4 md:mx-0 md:rounded-2xl border border-slate-200 bg-white/90 p-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-emerald-600">
                            {isRtl ? "الطلائع" : "Patrols"}
                        </p>
                        <p className="text-sm text-slate-600">{patrolSummary}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onToggle}
                        className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:border-emerald-200 hover:bg-emerald-50"
                    >
                        {expanded ? (isRtl ? "إخفاء التفاصيل" : "Hide details") : isRtl ? "عرض التفاصيل" : "View details"}
                    </button>
                </div>
                <div
                    className={`grid overflow-hidden transition-all ${expanded ? "grid-rows-[1fr] pt-4" : "grid-rows-[0fr]"} `}
                >
                    <div className="space-y-3 overflow-hidden">
                        {section.leadership.patrols.map((patrol) => (
                            <PatrolSummary key={patrol.name} patrol={patrol} isRtl={isRtl} />
                        ))}
                    </div>
                </div>
            </div>
        </article>
    );
}

function LeaderBadge({
    label,
    person,
    size = "lg",
}: {
    label: string;
    person: SectionContent["leadership"]["chief"];
    size?: "lg" | "sm";
}) {
    const avatarSize = size === "lg" ? "h-16 w-16" : "h-12 w-12";
    const avatarSizesAttr = size === "lg" ? "64px" : "48px";
    const containerSizeClass = size === "lg" ? "flex-1" : "flex-none";
    const nameClass = size === "lg" ? "text-sm" : "text-xs";

    const content = (
        <>
            <div className={`relative ${avatarSize} overflow-hidden rounded-full border border-emerald-100`}>
                <Image src={person.avatar} alt={person.name} fill sizes={avatarSizesAttr} className="object-cover" />
            </div>
            <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-emerald-600">{label}</p>
                <p className={`${nameClass} font-semibold text-slate-900`}>{person.name}</p>
            </div>
        </>
    );

    if (person.id) {
        return (
            <Link
                href={`/about/leadership/${person.id}`}
                className={`flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white ${containerSizeClass}`}
            >
                {content}
            </Link>
        );
    }

    return (
        <div className={`flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 ${containerSizeClass}`}>
            {content}
        </div>
    );
}

type PatrolContent = SectionContent["leadership"]["patrols"][number];

function PatrolSummary({ patrol, isRtl }: { patrol: PatrolContent; isRtl: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const memberLabel = isRtl
        ? `${patrol.members.length} ${patrol.members.length === 1 ? "عضو" : "أعضاء"}`
        : `${patrol.members.length} ${patrol.members.length === 1 ? "member" : "members"}`;

    return (
        <div className="-mx-4 md:mx-0 md:rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex w-full items-center justify-between gap-4 text-left"
            >
                <div>
                    <p className="text-sm font-semibold text-slate-900">{patrol.name}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">{memberLabel}</p>
                </div>
                <span
                    className={`rounded-full border border-slate-200 p-2 text-slate-500 transition ${isOpen ? "bg-emerald-50 text-emerald-600" : ""
                        }`}
                >
                    <FiChevronDown className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`} />
                </span>
            </button>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <RoleChip
                    icon={FiUser}
                    label={isRtl ? "قائد الطليعة" : "Patrol leader"}
                    value={patrol.leader}
                />
                <RoleChip
                    icon={FiUserPlus}
                    label={isRtl ? "مساعد الطليعة" : "Assistant leader"}
                    value={patrol.assistant}
                />
            </div>
            <div
                className={`grid overflow-hidden text-sm text-slate-600 transition-all ${isOpen ? "grid-rows-[1fr] pt-3" : "grid-rows-[0fr]"
                    }`}
            >
                <div className="overflow-hidden border-t border-slate-100 pt-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">
                        {isRtl ? "أسماء الأعضاء" : "Members"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {patrol.members.map((member) => (
                            <span key={member} className="rounded-full bg-white px-3 py-1 text-xs text-slate-700 shadow-sm">
                                {member}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function RoleChip({ icon: Icon, label, value }: { icon: IconType; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3 rounded-2xl border border-white/60 bg-white/80 p-3 shadow-sm">
            <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <Icon className="h-4 w-4" />
            </span>
            <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-emerald-600">{label}</p>
                <p className="text-sm font-semibold text-slate-900">{value}</p>
            </div>
        </div>
    );
}

function InfoRow({ icon: Icon, label, value }: { icon: IconType; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
            <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Icon className="h-4 w-4" />
            </span>
            <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">{label}</p>
                <p className="text-sm text-slate-900">{value}</p>
            </div>
        </div>
    );
}
