"use client";

import { useMemo } from "react";
import { FiCheckCircle, FiMail, FiUsers } from "react-icons/fi";

import { CTAButton } from "@/components/cta-button";
import { ContentSection } from "@/components/content-section";
import { PageHero } from "@/components/page-hero";
import { useLanguage } from "@/components/language-provider";

const content = {
    en: {
        hero: {
            badge: "Join Us",
            title: "Become part of SDC Saint Jean Marc",
            description:
                "Whether you are a young scout eager for adventure or a leader ready to mentor, we welcome you to our troop family.",
            image: "https://images.unsplash.com/photo-1460400355176-3680d9ab85fa?auto=format&fit=crop&w=1600&q=80",
        },
        intro: [
            "Our troop blends outdoor skills, faith-filled service, and friendships that last a lifetime.",
            "Fill the quick application and one of our coordinators will guide you through the next steps.",
        ],
        steps: [
            { title: "Submit the form", description: "Tell us about the scout, age group, and preferred section." },
            { title: "Meet the leaders", description: "We schedule a short call or visit to answer every question." },
            { title: "First activity", description: "Join a Saturday meeting to experience scouting up close." },
        ],
        requirements: [
            "Copy of ID/passport",
            "Parent/guardian consent",
            "Commitment to the code of conduct",
            "Participation fee (covers insurance & gear)",
        ],
        volunteer: {
            title: "Volunteer leaders",
            description:
                "We are always looking for energetic adults to accompany sections, teach skills, or support logistics. Training is provided.",
        },
        form: {
            title: "Application form",
            name: "Full name",
            email: "Email",
            phone: "Phone number",
            section: "Preferred section",
            message: "Tell us about your interest",
            submit: "Send application",
        },
    },
    ar: {
        hero: {
            badge: "انضموا إلينا",
            title: "كونوا جزءاً من فوج سيدة الدكوانة سان جان مارك",
            description:
                "سواء كنتم أولاداً تتطلعون للمغامرة أو قادة مستعدين للمرافقة، نرحب بكم في عائلتنا الكشفية.",
            image: "https://images.unsplash.com/photo-1460400355176-3680d9ab85fa?auto=format&fit=crop&w=1600&q=80",
        },
        intro: [
            "يجمع فوجنا بين المهارات الكشفية، الخدمة، والصداقات التي تدوم.",
            "املأوا الطلب السريع وسيتواصل معكم أحد منسقي الأقسام لتحديد الخطوات التالية.",
        ],
        steps: [
            { title: "تعبئة الطلب", description: "أخبرونا عن ابنكم، عمره، والقسم الذي يستهويه." },
            { title: "لقاء القادة", description: "نحدد اتصالاً أو زيارة قصيرة للإجابة عن أي سؤال." },
            { title: "أول نشاط", description: "شاركوا في اجتماع السبت لتتعرفوا على الأجواء." },
        ],
        requirements: ["صورة عن الهوية", "موافقة ولي الأمر", "الالتزام بميثاق الفوج", "مساهمة لتغطية التأمين والمعدات"],
        volunteer: {
            title: "القادة المتطوعون",
            description:
                "نبحث دائماً عن راشدين متحمسين لمرافقة الفروع أو دعم اللوجستيات. نقدم تدريباً كاملاً.",
        },
        form: {
            title: "طلب الانتساب",
            name: "الاسم الكامل",
            email: "البريد الإلكتروني",
            phone: "رقم الهاتف",
            section: "القسم المفضل",
            message: "أخبرونا عن اهتمامكم",
            submit: "أرسلوا الطلب",
        },
    },
} as const;

const sections = [
    "Castors",
    "Louveteaux / Jeannettes",
    "Scouts / Guides",
    "Routiers / Caravelles",
] as const;

export default function JoinPage() {
    const { language } = useLanguage();
    const t = content[language];
    const sectionOptions = useMemo(() => sections, []);

    return (
        <div className="space-y-12 pb-16 md:space-y-16">
            <PageHero
                badge={t.hero.badge}
                title={t.hero.title}
                description={t.hero.description}
                image={t.hero.image}
                stats={[
                    { value: "80+", label: language === "ar" ? "كشاف" : "Scouts" },
                    { value: "6", label: language === "ar" ? "فروع" : "Sections" },
                    { value: "20", label: language === "ar" ? "قائد" : "Leaders" },
                ]}
            />

            <ContentSection padded bordered paddingClassName="p-4 md:p-8" className="bg-white/95 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                        <h2 className="text-3xl font-semibold text-slate-900">{t.hero.title}</h2>
                        {t.intro.map((paragraph) => (
                            <p key={paragraph} className="text-sm text-slate-600">
                                {paragraph}
                            </p>
                        ))}
                        <div className="grid gap-4 md:grid-cols-3">
                            {t.steps.map((step) => (
                                <div key={step.title} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">{step.title}</p>
                                    <p className="mt-2 text-sm text-slate-600">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/70 p-6">
                        <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                            <FiUsers className="text-emerald-600" />
                            {language === "ar" ? "متطلبات الانتساب" : "Requirements"}
                        </h3>
                        <ul className="mt-4 space-y-2 text-sm text-slate-600">
                            {t.requirements.map((item) => (
                                <li key={item} className="flex items-start gap-2">
                                    <FiCheckCircle className="mt-0.5 text-emerald-600" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-6 rounded-2xl border border-emerald-200 bg-white/70 p-4">
                            <p className="text-sm font-semibold text-slate-900">{t.volunteer.title}</p>
                            <p className="mt-2 text-sm text-slate-600">{t.volunteer.description}</p>
                        </div>
                    </div>
                </div>
            </ContentSection>

            <ContentSection padded bordered paddingClassName="p-4 md:p-8" className="bg-white/95 space-y-6">
                <div className="space-y-2 text-center">
                    <p className="text-xs uppercase tracking-[0.35em] text-emerald-600">{t.form.title}</p>
                    <h2 className="text-3xl font-semibold text-slate-900">
                        {language === "ar" ? "املأوا الطلب" : "Complete the application"}
                    </h2>
                </div>
                <form className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-1 text-sm text-slate-600">
                        {t.form.name}
                        <input
                            type="text"
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-emerald-400 focus:outline-none"
                            placeholder={language === "ar" ? "الاسم الكامل" : "John / Jane Doe"}
                        />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-slate-600">
                        {t.form.email}
                        <input
                            type="email"
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-emerald-400 focus:outline-none"
                            placeholder="you@example.com"
                        />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-slate-600">
                        {t.form.phone}
                        <input
                            type="tel"
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-emerald-400 focus:outline-none"
                            placeholder="+961 70 000 000"
                        />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-slate-600">
                        {t.form.section}
                        <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-emerald-400 focus:outline-none">
                            <option value="">{language === "ar" ? "اختاروا القسم" : "Select a section"}</option>
                            {sectionOptions.map((section) => (
                                <option key={section} value={section}>
                                    {section}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="md:col-span-2 flex flex-col gap-1 text-sm text-slate-600">
                        {t.form.message}
                        <textarea
                            rows={4}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-emerald-400 focus:outline-none"
                        />
                    </label>
                    <div className="md:col-span-2 flex flex-col gap-3 text-sm text-slate-600">
                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-full border border-emerald-600 bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
                        >
                            {t.form.submit}
                        </button>
                        <p className="text-center text-xs text-slate-500">
                            {language === "ar"
                                ? "بإرسالكم الطلب توافقون على التواصل معكم حول النشاطات والرسوم."
                                : "By submitting you agree to be contacted regarding availability, fees, and onboarding."}
                        </p>
                    </div>
                </form>
            </ContentSection>

            <ContentSection
                padded
                bordered
                paddingClassName="p-4 md:p-8"
                backgroundClass="bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600"
                borderClassName="border-emerald-500/50"
                className="text-center text-white"
            >
                <div className="mx-auto max-w-4xl space-y-4">
                    <FiMail className="mx-auto h-10 w-10 text-emerald-100" />
                    <h2 className="text-3xl font-semibold">
                        {language === "ar" ? "جاهزون للبدء؟" : "Ready to get started?"}
                    </h2>
                    <p className="text-sm text-emerald-50/90">
                        {language === "ar"
                            ? "نرافق كل عائلة خطوة بخطوة ونخصص القسم المناسب لعمر أبنائكم."
                            : "We walk every family through the process and pair scouts with the right section."}
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <CTAButton href="/activities" variant="light">
                            {language === "ar" ? "اكتشفوا نشاطاتنا" : "Browse activities"}
                        </CTAButton>
                        <CTAButton href="/contact" variant="ghost">
                            {language === "ar" ? "تواصلوا معنا" : "Contact us"}
                        </CTAButton>
                    </div>
                </div>
            </ContentSection>
        </div>
    );
}
