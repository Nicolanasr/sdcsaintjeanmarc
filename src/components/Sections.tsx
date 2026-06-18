"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Compass, Footprints, ShieldCheck, Milestone } from "lucide-react";
import { Dictionary } from "@/lib/dictionary";

interface SectionsProps {
    dict: Dictionary;
    locale: string;
}

export default function Sections({ dict, locale }: SectionsProps) {
    const isAr = locale === "ar";

    const sectionsData = [
        {
            key: "louveteaux",
            dictData: dict.sections.louveteaux,
            colorClass: "border-sec-yellow text-sec-yellow bg-sec-yellow/[0.03] hover:border-sec-yellow/60 hover:shadow-sec-yellow/5",
            accentColor: "bg-sec-yellow",
            icon: <Footprints className="w-8 h-8" />,
            coverImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80"
        },
        {
            key: "jeannettes",
            dictData: dict.sections.jeannettes,
            colorClass: "border-sec-yellow text-sec-yellow bg-sec-yellow/[0.03] hover:border-sec-yellow/60 hover:shadow-sec-yellow/5",
            accentColor: "bg-sec-yellow",
            icon: <Footprints className="w-8 h-8" />,
            coverImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"
        },
        {
            key: "eclaireurs",
            dictData: (dict.sections as any).eclaireurs || dict.sections.louveteaux,
            colorClass: "border-sec-green text-sec-green bg-sec-green/[0.03] hover:border-sec-green/60 hover:shadow-sec-green/5",
            accentColor: "bg-sec-green",
            icon: <Compass className="w-8 h-8" />,
            coverImage: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80"
        },
        {
            key: "guides",
            dictData: (dict.sections as any).guides || dict.sections.louveteaux,
            colorClass: "border-sec-green text-sec-green bg-sec-green/[0.03] hover:border-sec-green/60 hover:shadow-sec-green/5",
            accentColor: "bg-sec-green",
            icon: <Compass className="w-8 h-8" />,
            coverImage: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80"
        },
        {
            key: "routiers",
            dictData: (dict.sections as any).routiers || dict.sections.louveteaux,
            colorClass: "border-sec-red text-sec-red bg-sec-red/[0.03] hover:border-sec-red/60 hover:shadow-sec-red/5",
            accentColor: "bg-sec-red",
            icon: <Milestone className="w-8 h-8" />,
            coverImage: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80"
        },
        {
            key: "caravelles",
            dictData: (dict.sections as any).caravelles || dict.sections.louveteaux,
            colorClass: "border-sec-red text-sec-red bg-sec-red/[0.03] hover:border-sec-red/60 hover:shadow-sec-red/5",
            accentColor: "bg-sec-red",
            icon: <Milestone className="w-8 h-8" />,
            coverImage: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80"
        }
    ];

    return (
        <section id="sections" className="py-20 bg-white relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl sm:text-4xl font-extrabold text-scout-navy font-display"
                    >
                        {dict.sections.title}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-scout-charcoal/70 mt-3 text-sm sm:text-base leading-relaxed"
                    >
                        {dict.sections.subtitle}
                    </motion.p>
                    <div className="w-20 h-1 bg-scout-gold mx-auto mt-4 rounded-full" />
                </div>

                {/* Section Cards Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-16">
                    {sectionsData.map((sec, idx) => {
                        const data = sec.dictData;
                        return (
                            <motion.div
                                key={sec.key}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className={`flex flex-col justify-between border-t-4 bg-white rounded-2xl shadow-sm border-x border-b border-scout-beige-dark/40 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group overflow-hidden ${sec.colorClass}`}
                            >
                                {/* Card Top Cover Image */}
                                <div className="relative aspect-[16/10] w-full overflow-hidden bg-scout-beige border-b border-scout-beige-dark/30">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={sec.coverImage}
                                        alt={data.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
                                </div>

                                <div className="p-5 flex-grow flex flex-col justify-between">
                                    <div>
                                        {/* Top section header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-[10px] font-bold uppercase tracking-widest bg-scout-beige px-2.5 py-1 rounded-full text-scout-charcoal/75">
                                                {data.ages}
                                            </span>
                                            <div className={`p-1.5 rounded-lg text-white ${sec.accentColor} shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                                                {sec.icon}
                                            </div>
                                        </div>

                                        {/* Section Title */}
                                        <h3 className="text-lg font-extrabold text-scout-navy font-display leading-snug">
                                            {data.title}
                                        </h3>

                                        {/* Arabic subtitle */}
                                        <p className="text-[11px] text-scout-charcoal/50 font-bold mt-0.5">
                                            {data.arabicName}
                                        </p>

                                        <div className="w-8 h-0.5 bg-scout-beige-dark my-3.5" />

                                        {/* Description */}
                                        <p className="text-scout-charcoal/85 text-xs leading-relaxed mb-6">
                                            {data.description}
                                        </p>
                                    </div>

                                    <div>
                                        {/* Link Details */}
                                        <Link
                                            href={`/${locale}/sections/${sec.key}`}
                                            className="flex items-center gap-1.5 text-[11px] font-extrabold tracking-wider uppercase text-scout-navy hover:text-scout-gold transition-colors duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 mb-5"
                                        >
                                            <span>{dict.agenda.viewMore}</span>
                                            {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                                        </Link>

                                        {/* Motto of the Section */}
                                        <div className="pt-3.5 border-t border-scout-beige-dark/30 flex items-center justify-between">
                                            <span className="text-[10px] font-bold italic text-scout-gold">
                                                {data.motto}
                                            </span>
                                            <span className="text-[8px] font-bold uppercase tracking-wide opacity-50">
                                                {data.colorName}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* View All Sections Button */}
                <div className="text-center">
                    <Link
                        href={`/${locale}/sections`}
                        className="inline-flex items-center gap-2 bg-scout-navy text-white font-bold px-8 py-4 rounded-xl shadow-md hover:bg-scout-navy-light hover:scale-105 active:scale-95 transition-all text-sm tracking-wider uppercase border-2 border-scout-navy"
                    >
                        <span>{dict.sectionsPage.allSections}</span>
                        {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    </Link>
                </div>

            </div>
        </section>
    );
}
