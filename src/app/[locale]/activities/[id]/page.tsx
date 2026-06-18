"use client";

import { use, useState } from "react";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionary";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import agendaData from "@/data/agenda.json";
import galleryItems from "@/data/gallery.json";
import { Clock, MapPin, Compass, ShieldAlert, ArrowLeft, ArrowRight, Shield, CheckCircle, Maximize2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PageProps {
    params: Promise<{ locale: string; id: string }>;
}

export default function ActivityDetailPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const locale = resolvedParams.locale;
    const activityId = resolvedParams.id;

    const dict = getDictionary(locale);
    const isAr = locale === "ar";

    // Form State
    const [fullname, setFullname] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [notes, setNotes] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeImage, setActiveImage] = useState<any>(null);

    // Find current event details
    const event = agendaData.find((item) => item.id === activityId);

    // Find photos matching this activity
    const activityPhotos = galleryItems.filter((item) => item.activityId === activityId);

    if (!event) {
        return (
            <>
                <Navbar dict={dict} locale={locale} />
                <main className="flex-grow pt-28 pb-20 bg-scout-beige text-center">
                    <div className="max-w-md mx-auto px-4 py-16 bg-white rounded-3xl shadow-md border border-scout-beige-dark/50">
                        <ShieldAlert className="w-16 h-16 text-scout-terracotta mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-scout-navy font-display mb-2">Activity Not Found</h1>
                        <p className="text-scout-charcoal/70 mb-6">The activity you are looking for does not exist.</p>
                        <Link href={`/${locale}/activities`} className="bg-scout-navy text-white px-6 py-2.5 rounded-xl font-bold hover:bg-scout-navy-light transition-all">
                            Back to Calendar
                        </Link>
                    </div>
                </main>
                <Footer dict={dict} locale={locale} />
            </>
        );
    }

    const title = isAr ? event.titleAr : event.titleEn;
    const date = isAr ? event.dateAr : event.date;
    const location = isAr ? event.locationAr : event.locationEn;
    const description = isAr ? event.descriptionAr : event.descriptionEn;

    // Mock mapped sections for activities
    const getInvolvedSections = () => {
        if (event.id === "1") return ["louveteaux", "jeannettes", "eclaireurs", "guides", "routiers", "caravelles"]; // Saturday meeting
        if (event.id === "2") return ["eclaireurs", "guides", "routiers", "caravelles"]; // summer camp prep
        if (event.id === "3") return ["routiers", "caravelles"]; // Jbeil cleanup
        return ["all"]; // general
    };

    const sectionsList = getInvolvedSections();

    const handleRSVPSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true);
            setFullname("");
            setContactPhone("");
            setNotes("");
        }, 800);
    };

    return (
        <>
            <Navbar dict={dict} locale={locale} />
            <main className="flex-grow pt-28 pb-20 bg-scout-beige">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Breadcrumb */}
                    <nav className="text-xs sm:text-sm text-scout-charcoal/50 mb-6 font-semibold flex items-center gap-2">
                        <Link href={`/${locale}`} className="hover:text-scout-gold transition-colors">
                            {dict.nav.home}
                        </Link>
                        <span>/</span>
                        <Link href={`/${locale}/activities`} className="hover:text-scout-gold transition-colors">
                            {dict.nav.agenda}
                        </Link>
                        <span>/</span>
                        <span className="text-scout-charcoal truncate max-w-[200px] sm:max-w-none">{title}</span>
                    </nav>

                    {/* Activity Layout Grid */}
                    <div className="grid lg:grid-cols-12 gap-8 items-start">

                        {/* Left Main details column */}
                        <div className="lg:col-span-7 space-y-6">

                            {/* Main detail card */}
                            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-scout-beige-dark/50">
                                <span className={`text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-full inline-block mb-3.5 ${event.type === "meeting" ? "bg-sec-yellow/15 text-yellow-600" :
                                    event.type === "camp" ? "bg-sec-green/15 text-green-600" :
                                        "bg-sec-red/15 text-red-600"
                                    }`}>
                                    {dict.agenda.categories[event.type as keyof typeof dict.agenda.categories]}
                                </span>

                                <h1 className="text-2xl sm:text-3xl font-extrabold text-scout-navy font-display mb-4 leading-tight">
                                    {title}
                                </h1>

                                {/* Date / Location Quick strip */}
                                <div className="flex flex-col sm:flex-row gap-4 border-t border-b border-scout-beige-dark/25 py-4 my-6 text-xs sm:text-sm text-scout-charcoal/85">
                                    <div className="flex items-center gap-2.5">
                                        <Clock className="w-5 h-5 text-scout-gold flex-shrink-0" />
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-scout-charcoal/40 mb-0.5 leading-none">{dict.activitiesPage.dateTime}</p>
                                            <p className="font-bold text-scout-navy">{date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <MapPin className="w-5 h-5 text-scout-gold flex-shrink-0" />
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-scout-charcoal/40 mb-0.5 leading-none">{dict.activitiesPage.location}</p>
                                            <p className="font-bold text-scout-navy">{location}</p>
                                        </div>
                                    </div>
                                </div>

                                <h2 className="text-lg font-bold text-scout-navy font-display mb-3">
                                    {dict.activitiesPage.detailsTitle}
                                </h2>
                                <p className="text-scout-charcoal/85 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                                    {description}
                                </p>
                            </div>

                            {/* Gear Requirements */}
                            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-scout-beige-dark/50">
                                <h2 className="text-lg sm:text-xl font-bold text-scout-navy font-display mb-4 pb-2 border-b border-scout-beige-dark/30">
                                    {dict.activitiesPage.requiredGear}
                                </h2>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    {[
                                        dict.activitiesPage.gearItem1,
                                        dict.activitiesPage.gearItem2,
                                        dict.activitiesPage.gearItem3,
                                        dict.activitiesPage.gearItem4,
                                    ].map((gear, idx) => (
                                        <div key={idx} className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-scout-beige/60">
                                            <CheckCircle className="w-5 h-5 text-scout-gold flex-shrink-0" />
                                            <span className="text-xs sm:text-sm font-semibold text-scout-navy">{gear}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Activity Photos */}
                            {activityPhotos.length > 0 && (
                                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-scout-beige-dark/50">
                                    <h2 className="text-lg sm:text-xl font-bold text-scout-navy font-display mb-4 pb-2 border-b border-scout-beige-dark/30">
                                        {isAr ? "صور من هذا النشاط" : "Photos from this Activity"}
                                    </h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {activityPhotos.map((photo) => (
                                            <div
                                                key={photo.id}
                                                onClick={() => setActiveImage(photo)}
                                                className="relative rounded-2xl overflow-hidden aspect-square bg-scout-beige cursor-pointer group shadow-sm hover:shadow-md transition-all duration-300 border border-scout-beige-dark/20"
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={photo.src}
                                                    alt={isAr ? photo.captionAr : photo.captionEn}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-scout-navy/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                    <Maximize2 className="w-5 h-5 text-scout-gold-light" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Right sidebar column: RSVP & Sections */}
                        <div className="lg:col-span-5 space-y-6">

                            {/* RSVP Form Widget */}
                            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-md border border-scout-beige-dark/50 relative overflow-hidden">
                                <h2 className="text-lg font-extrabold text-scout-navy font-display mb-4 pb-2 border-b border-scout-beige-dark/30">
                                    {dict.activitiesPage.rsvpTitle}
                                </h2>

                                {isSubmitted ? (
                                    <div className="p-4 bg-scout-green/10 border border-scout-green-light/20 rounded-2xl text-scout-green-light text-center">
                                        <CheckCircle className="w-12 h-12 mx-auto mb-3" />
                                        <p className="font-bold text-sm">{dict.activitiesPage.rsvpSuccess}</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleRSVPSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-scout-charcoal/60 uppercase mb-1.5">{dict.join.form.name}</label>
                                            <input
                                                type="text"
                                                required
                                                value={fullname}
                                                onChange={(e) => setFullname(e.target.value)}
                                                placeholder={dict.join.form.namePlaceholder}
                                                className="w-full px-4 py-3 rounded-xl border border-scout-beige-dark bg-scout-beige/25 text-sm focus:outline-none focus:border-scout-gold text-scout-navy"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-scout-charcoal/60 uppercase mb-1.5">{dict.join.form.phone}</label>
                                            <input
                                                type="text"
                                                required
                                                value={contactPhone}
                                                onChange={(e) => setContactPhone(e.target.value)}
                                                placeholder={dict.join.form.phonePlaceholder}
                                                className="w-full px-4 py-3 rounded-xl border border-scout-beige-dark bg-scout-beige/25 text-sm focus:outline-none focus:border-scout-gold text-scout-navy"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-scout-charcoal/60 uppercase mb-1.5">{dict.join.form.message}</label>
                                            <textarea
                                                rows={3}
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                placeholder={dict.join.form.messagePlaceholder}
                                                className="w-full px-4 py-3 rounded-xl border border-scout-beige-dark bg-scout-beige/25 text-sm focus:outline-none focus:border-scout-gold text-scout-navy resize-none"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-scout-navy hover:bg-scout-navy-light text-white font-extrabold py-3 px-4 rounded-xl text-xs tracking-wider uppercase shadow hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 cursor-pointer"
                                        >
                                            {isSubmitting ? dict.join.form.sending : dict.activitiesPage.rsvpSubmit}
                                        </button>
                                    </form>
                                )}
                            </div>

                            {/* Sections Involved Widget */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-scout-beige-dark/50">
                                <h2 className="text-lg font-bold text-scout-navy font-display mb-4 pb-2 border-b border-scout-beige-dark/30">
                                    {dict.activitiesPage.involvedSections}
                                </h2>

                                <div className="flex flex-wrap gap-2">
                                    {sectionsList.map((secKey) => {
                                        const matchedSec = dict.sections[secKey as keyof typeof dict.sections] as any;
                                        const name = matchedSec ? matchedSec.title : secKey;
                                        return (
                                            <span
                                                key={secKey}
                                                className="text-xs font-bold bg-scout-beige border border-scout-beige-dark/40 px-3 py-1.5 rounded-full text-scout-navy"
                                            >
                                                {name}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Back to calendar button */}
                            <Link
                                href={`/${locale}/activities`}
                                className="w-full flex items-center justify-center gap-2 border border-scout-navy/20 hover:border-scout-gold text-scout-navy font-bold py-3.5 px-4 rounded-2xl bg-white hover:bg-scout-beige/10 transition-all text-xs tracking-wider uppercase shadow-sm"
                            >
                                {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                                <span>{dict.activitiesPage.backLink}</span>
                            </Link>

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
