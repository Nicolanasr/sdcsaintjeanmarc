"use client";

import { FiClock, FiMapPin, FiPhone, FiSend } from "react-icons/fi";

import { CTAButton } from "@/components/cta-button";
import { ContentSection } from "@/components/content-section";
import { PageHero } from "@/components/page-hero";
import { useLanguage } from "@/components/language-provider";

const content = {
    en: {
        hero: {
            badge: "Contact",
            title: "Let's plan your visit or collaboration",
            description:
                "Reach out to our leadership team for membership questions, volunteering opportunities, or partnerships.",
            image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
        },
        info: [
            {
                icon: FiPhone,
                label: "Phone / WhatsApp",
                value: "+961 76 000 120",
            },
            {
                icon: FiSend,
                label: "Email",
                value: "info@sdcsaintjeanmarc.com",
            },
            {
                icon: FiClock,
                label: "Meetings",
                value: "Saturdays · 2:00 PM – 6:00 PM",
            },
            {
                icon: FiMapPin,
                label: "Parish center",
                value: "Saint Jean Marc Church, Dekwaneh",
            },
        ],
        form: {
            title: "Send us a note",
            name: "Full name",
            email: "Email",
            message: "Message",
            submit: "Send message",
        },
        visit: {
            title: "Visit the troop house",
            description:
                "Parents and scouts are welcome to visit during Saturday activities or schedule a dedicated tour with our coordinators.",
        },
    },
    ar: {
        hero: {
            badge: "تواصلوا معنا",
            title: "فلنخطط لزيارتكم أو تعاوننا",
            description:
                "تواصلوا مع فريق القيادة لأي سؤال حول الانتساب، التطوع، أو الشراكات.",
            image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
        },
        info: [
            {
                icon: FiPhone,
                label: "الهاتف / واتساب",
                value: "+961 76 000 120",
            },
            {
                icon: FiSend,
                label: "البريد الإلكتروني",
                value: "info@sdcsaintjeanmarc.com",
            },
            {
                icon: FiClock,
                label: "مواعيد الاجتماعات",
                value: "السبت · 2:00 بعد الظهر – 6:00 بعد الظهر",
            },
            {
                icon: FiMapPin,
                label: "مركز الفوج",
                value: "كنيسة سان جان مارك، الدكوانة",
            },
        ],
        form: {
            title: "أرسلوا رسالة",
            name: "الاسم الكامل",
            email: "البريد الإلكتروني",
            message: "الرسالة",
            submit: "أرسلوا الرسالة",
        },
        visit: {
            title: "زورونا خلال الاجتماعات",
            description:
                "أهلاً بكم كل سبت أو يمكن تحديد موعد خاص مع أحد منسقينا.",
        },
    },
} as const;

export default function ContactPage() {
    const { language } = useLanguage();
    const t = content[language];

    return (
        <div className="space-y-12 pb-16 md:space-y-16">
            <PageHero
                badge={t.hero.badge}
                title={t.hero.title}
                description={t.hero.description}
                image={t.hero.image}
                imagePriority
            />

            <ContentSection padded bordered paddingClassName="p-4 md:p-8" className="bg-white/95 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-semibold text-slate-900">
                            {language === "ar" ? "تفاصيل الاتصال" : "Contact details"}
                        </h2>
                        <div className="grid gap-4">
                            {t.info.map((item) => (
                                <div key={item.label} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                                        <item.icon className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">{item.label}</p>
                                        <p className="text-sm font-semibold text-slate-900">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm text-slate-700">
                            <p className="font-semibold text-slate-900">{t.visit.title}</p>
                            <p className="mt-2">{t.visit.description}</p>
                            <div className="mt-4 flex flex-wrap gap-3">
                                <CTAButton href="/join" variant="light">
                                    {language === "ar" ? "طلب انتساب" : "Apply now"}
                                </CTAButton>
                                <CTAButton href="mailto:info@sdcsaintjeanmarc.com" variant="ghost">
                                    {language === "ar" ? "راسلونا" : "Email us"}
                                </CTAButton>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <div className="space-y-1 text-center">
                            <p className="text-xs uppercase tracking-[0.35em] text-emerald-600">{t.form.title}</p>
                            <h3 className="text-xl font-semibold text-slate-900">
                                {language === "ar" ? "نحب الاستماع إليكم" : "We'd love to hear from you"}
                            </h3>
                        </div>
                        <form className="space-y-3 text-sm text-slate-600">
                            <label className="flex flex-col gap-1">
                                {t.form.name}
                                <input
                                    type="text"
                                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-400 focus:outline-none"
                                />
                            </label>
                            <label className="flex flex-col gap-1">
                                {t.form.email}
                                <input
                                    type="email"
                                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-400 focus:outline-none"
                                />
                            </label>
                            <label className="flex flex-col gap-1">
                                {t.form.message}
                                <textarea
                                    rows={4}
                                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-emerald-400 focus:outline-none"
                                />
                            </label>
                            <button
                                type="button"
                                className="w-full rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
                            >
                                {t.form.submit}
                            </button>
                        </form>
                    </div>
                </div>
            </ContentSection>

            <ContentSection padded bordered paddingClassName="p-4 md:p-8" className="bg-white">
                <div className="grid gap-6 md:grid-cols-[1fr,1.2fr] md:items-center">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-semibold text-slate-900">
                            {language === "ar" ? "موقعنا" : "Where to find us"}
                        </h2>
                        <p className="text-sm text-slate-600">
                            {language === "ar"
                                ? "نلتقي في قاعة الرعية ونتوزع على الحديقة الخارجية للأنشطة. استخدموا الخريطة لتحديد أفضل طريقة للوصول."
                                : "We gather at the parish hall and use the outdoor grounds for activities. Use the map to plan your route."}
                        </p>
                        <ul className="text-sm text-slate-600 space-y-2">
                            <li>{language === "ar" ? "مواقف متاحة قرب الكنيسة." : "Parking available near the church."}</li>
                            <li>
                                {language === "ar"
                                    ? "يمكنكم استخدام الحافلات التي تمر على طريق الدكوانة الرئيسي."
                                    : "Public buses stop on the main Dekwaneh road nearby."}
                            </li>
                        </ul>
                    </div>
                    <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
                        <iframe
                            title="SDC Location"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3282.150248840563!2d35.548!3d33.888!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDUzJzE2LjgiTiAzNcKwMzInNTIuOCJF!5e0!3m2!1sen!2slb!4v1700000000000"
                            width="100%"
                            height="320"
                            loading="lazy"
                            className="h-[320px] w-full border-0"
                            allowFullScreen
                        />
                    </div>
                </div>
            </ContentSection>
        </div>
    );
}
