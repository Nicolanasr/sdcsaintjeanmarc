"use client";

import { use, useState } from "react";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionary";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import sectionsData from "@/data/sections.json";
import galleryItems from "@/data/gallery.json";
import leadershipData from "@/data/leadership.json";
import { Users, Calendar, ArrowLeft, ArrowRight, ShieldAlert, Award, Maximize2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PageProps {
    params: Promise<{ locale: string; section: string }>;
}

export default function SectionDetailPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const locale = resolvedParams.locale;
    const sectionKey = resolvedParams.section;

    const dict = getDictionary(locale);
    const isAr = locale === "ar";

    const [activeImage, setActiveImage] = useState<typeof galleryItems[0] | null>(null);

    // Find the current section
    const section = sectionsData.find((sec) => sec.key === sectionKey);

    if (!section) {
        return (
            <>
                <Navbar dict={dict} locale={locale} />
                <main className="flex-grow pt-28 pb-20 bg-scout-beige text-center">
                    <div className="max-w-md mx-auto px-4 py-16 bg-white rounded-3xl shadow-md border border-scout-beige-dark/50">
                        <ShieldAlert className="w-16 h-16 text-scout-terracotta mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-scout-navy font-display mb-2">Section Not Found</h1>
                        <p className="text-scout-charcoal/70 mb-6">The scout section you are looking for does not exist.</p>
                        <Link href={`/${locale}/sections`} className="bg-scout-navy text-white px-6 py-2.5 rounded-xl font-bold hover:bg-scout-navy-light transition-all">
                            Back to Sections
                        </Link>
                    </div>
                </main>
                <Footer dict={dict} locale={locale} />
            </>
        );
    }

    const title = isAr ? section.titleAr : section.titleEn;
    const motto = isAr ? section.mottoAr : section.mottoEn;
    const colorName = isAr ? section.colorNameAr : section.colorNameEn;
    const schedule = isAr ? section.meetingScheduleAr : section.meetingScheduleEn;
    const description = isAr ? section.descriptionAr : section.descriptionEn;
    const details = isAr ? section.detailsAr : section.detailsEn;

    // Filter gallery photos for this section
    const sectionPhotos = galleryItems.filter((item) => item.section === sectionKey);

    return (
        <>
            <Navbar dict={dict} locale={locale} />
            <main className="flex-grow pt-28 pb-20 bg-scout-beige">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Breadcrumb */}
                    <nav className="text-xs sm:text-sm text-scout-charcoal/50 mb-6 font-semibold flex items-center gap-2">
                        <Link href={`/${locale}`} className="hover:text-scout-gold transition-colors">
                            {dict.nav.home}
                        </Link>
                        <span>/</span>
                        <Link href={`/${locale}/sections`} className="hover:text-scout-gold transition-colors">
                            {dict.nav.sections}
                        </Link>
                        <span>/</span>
                        <span className="text-scout-charcoal">{title}</span>
                    </nav>

                    {/* Section Detail Header Banner */}
                    <div className="bg-gradient-to-br from-scout-navy to-scout-navy-light rounded-3xl p-6 md:p-10 text-white border border-scout-navy-light/40 shadow-xl mb-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-scout-gold/10 rounded-full filter blur-3xl pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-widest bg-scout-gold text-scout-navy-dark px-4 py-1.5 rounded-full border border-scout-gold/20 mb-4 inline-block">
                                    {section.ages}
                                </span>
                                <h1 className="text-3xl sm:text-5xl font-extrabold font-display leading-tight mb-2">
                                    {title}
                                </h1>
                                <p className="text-scout-gold-light font-bold text-sm sm:text-base tracking-wide uppercase italic">
                                    {isAr ? "شعار الفئة: " : "Section Motto: "}{motto}
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
                                    <p className="text-[10px] uppercase tracking-wider opacity-60 font-bold mb-1">
                                        {dict.sectionsPage.membersCount}
                                    </p>
                                    <p className="text-2xl font-extrabold text-scout-gold-light leading-none">
                                        {section.membersCount}
                                    </p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
                                    <p className="text-[10px] uppercase tracking-wider opacity-60 font-bold mb-1">
                                        {dict.sectionsPage.schedule}
                                    </p>
                                    <p className="text-sm sm:text-base font-extrabold text-white leading-none">
                                        {schedule}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-8 items-start mb-16">
                        {/* Left Column: Description & Gallery */}
                        <div className="lg:col-span-8 space-y-8">

                            {/* Detailed Description */}
                            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-scout-beige-dark/50">
                                <h2 className="text-xl sm:text-2xl font-bold text-scout-navy font-display mb-4 border-b border-scout-beige-dark/45 pb-3">
                                    {isAr ? "عن هذا القسم" : "About This Section"}
                                </h2>
                                <p className="text-scout-charcoal/80 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                                    {details}
                                </p>
                            </div>

                            {/* Tagged Photos grouped by album */}
                            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-scout-beige-dark/50">
                                <h2 className="text-xl sm:text-2xl font-bold text-scout-navy font-display mb-6 border-b border-scout-beige-dark/45 pb-3">
                                    {dict.sectionsPage.photosTitle}
                                </h2>

                                {sectionPhotos.length === 0 ? (
                                    <p className="text-scout-charcoal/50 text-sm italic">{dict.sectionsPage.emptyPhotos}</p>
                                ) : (
                                    <div className="space-y-8">
                                        {Object.entries(
                                            sectionPhotos.reduce((acc: Record<string, typeof galleryItems>, item) => {
                                                const albumName = isAr ? item.albumAr : item.albumEn;
                                                if (!acc[albumName]) acc[albumName] = [];
                                                acc[albumName].push(item);
                                                return acc;
                                            }, {})
                                        ).map(([albumName, photos]) => (
                                            <div key={albumName} className="space-y-3">
                                                <h3 className="text-sm font-bold uppercase tracking-wider text-scout-gold border-l-4 border-scout-gold pl-2.5 rtl:border-l-0 rtl:border-r-4 rtl:pl-0 rtl:pr-2.5 leading-none">
                                                    {albumName}
                                                </h3>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                    {photos.map((item) => (
                                                        <div key={item.id} className="space-y-1.5">
                                                            <div
                                                                onClick={() => setActiveImage(item)}
                                                                className="relative rounded-2xl overflow-hidden aspect-square bg-scout-beige cursor-pointer group shadow-sm hover:shadow-md transition-all duration-300 border border-scout-beige-dark/20"
                                                            >
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img
                                                                    src={item.src}
                                                                    alt={isAr ? item.captionAr : item.captionEn}
                                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                                />
                                                                <div className="absolute inset-0 bg-scout-navy/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                                    <Maximize2 className="w-6 h-6 text-scout-gold-light" />
                                                                </div>
                                                            </div>
                                                            {item.activityId && (
                                                                <Link
                                                                    href={`/${locale}/activities/${item.activityId}`}
                                                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-scout-navy hover:text-scout-gold uppercase tracking-wider transition-colors"
                                                                >
                                                                    <span>{isAr ? "تفاصيل النشاط" : "Activity Info"}</span>
                                                                    {isAr ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                                                                </Link>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Right Column: Leadership & Troops */}
                        <div className="lg:col-span-4 space-y-8">

                            {/* Leaders Card */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-scout-beige-dark/50">
                                <h2 className="text-lg sm:text-xl font-bold text-scout-navy font-display mb-4 border-b border-scout-beige-dark/45 pb-2">
                                    {dict.sectionsPage.leader}
                                </h2>
                                <div className="space-y-4">
                                    {section.leaders.map((leader, index) => {
                                        const lName = isAr ? leader.nameAr : leader.nameEn;
                                        const lRole = isAr ? leader.roleAr : leader.roleEn;
                                        const matchingLeader = leadershipData.find(
                                            (l) => l.nameEn.toLowerCase() === leader.nameEn.toLowerCase()
                                        );
                                        return (
                                            <div key={index} className="flex flex-col gap-3">
                                                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-scout-beige w-full">
                                                    {matchingLeader?.image ? (
                                                        <img
                                                            src={matchingLeader.image}
                                                            alt={lName}
                                                            className="w-10 h-10 rounded-full object-cover shadow-sm border border-scout-gold/20"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-scout-gold/15 text-scout-gold flex items-center justify-center font-bold">
                                                            {lName.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-xs uppercase font-extrabold text-scout-charcoal/50 leading-none mb-1">
                                                            {lRole}
                                                        </p>
                                                        <p className="font-bold text-scout-navy text-sm leading-tight">
                                                            {lName}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Assistants under Section Leader Card */}
                                                {matchingLeader?.assistants && matchingLeader.assistants.length > 0 && (
                                                    <div className="flex flex-col gap-2 w-[90%] mx-auto pl-4 rtl:pl-0 rtl:pr-4">
                                                        {matchingLeader.assistants.map((assistant: any) => {
                                                            const astName = isAr ? assistant.nameAr : assistant.nameEn;
                                                            const astRole = isAr ? assistant.roleAr : assistant.roleEn;
                                                            return (
                                                                <div
                                                                    key={assistant.id}
                                                                    className="bg-white/80 p-2.5 rounded-xl border border-scout-beige-dark/40 shadow-sm flex items-center gap-2.5"
                                                                >
                                                                    {assistant.image ? (
                                                                        <img
                                                                            src={assistant.image}
                                                                            alt={astName}
                                                                            className="w-8 h-8 rounded-full object-cover shadow-sm border border-scout-beige-dark/30"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-8 h-8 rounded-full bg-scout-navy/5 text-scout-navy border border-scout-navy/10 flex items-center justify-center font-extrabold text-xs shadow-sm">
                                                                            {assistant.avatar}
                                                                        </div>
                                                                    )}
                                                                    <div className="flex-grow">
                                                                        <p className="text-[8px] font-extrabold text-scout-charcoal/40 uppercase tracking-wider mb-0.5 leading-none">
                                                                            {astRole}
                                                                        </p>
                                                                        <p className="font-bold text-scout-navy text-xs leading-tight">
                                                                            {astName}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Troops Card */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-scout-beige-dark/50">
                                <h2 className="text-lg sm:text-xl font-bold text-scout-navy font-display mb-4 border-b border-scout-beige-dark/45 pb-2">
                                    {dict.sectionsPage.troopsList}
                                </h2>
                                <div className="space-y-4">
                                    {section.troops.map((troop: any, index) => {
                                        const tName = isAr ? troop.nameAr : troop.nameEn;
                                        return (
                                            <div key={index} className="p-4 rounded-2xl bg-scout-beige/40 border border-scout-beige-dark/30 space-y-3">
                                                <div className="flex items-center gap-2 border-b border-scout-beige-dark/30 pb-2 mb-1">
                                                    <Award className="w-5 h-5 text-scout-gold flex-shrink-0" />
                                                    <span className="text-sm font-extrabold text-scout-navy">{tName}</span>
                                                </div>

                                                {/* Members list */}
                                                <div className="space-y-1.5">
                                                    {troop.members && troop.members.map((member: any, mIdx: number) => {
                                                        const mName = isAr ? member.nameAr : member.nameEn;
                                                        const mRank = isAr ? member.rankAr : member.rankEn;
                                                        return (
                                                            <div key={mIdx} className="flex items-center justify-between text-xs py-1.5 px-2 bg-white rounded-lg border border-scout-beige-dark/20">
                                                                <span className="font-bold text-scout-navy">{mName}</span>
                                                                <span className="text-[9px] font-extrabold uppercase text-scout-gold bg-scout-gold/5 px-2 py-0.5 rounded border border-scout-gold/10 leading-none">
                                                                    {mRank}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Registration Prompt */}
                            <div className="bg-gradient-to-br from-scout-green-light to-scout-green p-6 rounded-3xl text-white shadow-md border border-scout-green-light/40 relative overflow-hidden">
                                <h3 className="text-lg font-bold font-display mb-2">{dict.sectionsPage.joinSection}</h3>
                                <p className="text-xs text-white/80 leading-relaxed mb-5">
                                    {isAr
                                        ? "هل أنت مستعد لبدء هذه المغامرة الكشفية؟ املأ استمارة التسجيل وسنتواصل معك قريباً."
                                        : "Ready to write your scouting chapter inside this section? Sign up now and we will get in touch!"}
                                </p>
                                <Link
                                    href={`/${locale}/contact`}
                                    className="w-full block text-center bg-scout-gold hover:bg-scout-gold-light text-scout-navy-dark font-extrabold py-3 px-4 rounded-xl text-xs tracking-wider uppercase shadow hover:scale-[1.02] active:scale-95 transition-all duration-300"
                                >
                                    {dict.hero.cta}
                                </Link>
                            </div>

                        </div>
                    </div>

                </div>
            </main>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {activeImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-sm"
                        onClick={() => setActiveImage(null)}
                    >
                        <button
                            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors z-50 cursor-pointer"
                            onClick={() => setActiveImage(null)}
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative max-w-5xl max-h-[85vh] w-full h-full flex flex-col items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={activeImage.src}
                                alt={isAr ? activeImage.captionAr : activeImage.captionEn}
                                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl border border-white/5"
                            />
                            <div className="mt-4 text-center max-w-xl px-4 text-white">
                                <span className="inline-block text-[10px] uppercase font-bold tracking-widest text-scout-gold bg-scout-gold/10 px-3 py-1 rounded-full mb-2">
                                    {isAr ? activeImage.albumAr : activeImage.albumEn}
                                </span>
                                <p className="text-sm leading-relaxed mb-2">
                                    {isAr ? activeImage.captionAr : activeImage.captionEn}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer dict={dict} locale={locale} />
        </>
    );
}
