"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, BookOpen, Compass, Award, Star, Heart, Anchor, Play, X } from "lucide-react";
import { Dictionary } from "@/lib/dictionary";

interface AboutProps {
    dict: Dictionary;
    locale: string;
}

export default function About({ dict, locale }: AboutProps) {
    const isAr = locale === "ar";
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    // Define icons mapping for the 6 core values matching the logo's shields
    const valueCards = [
        {
            title: dict.about.values.god,
            icon: <Compass className="w-8 h-8 text-scout-gold" />,
            descEn: "Fostering spiritual growth, moral strength, and a respectful connection with the Creator and all faiths.",
            descAr: "تعزيز النمو الروحي، والقوة الأخلاقية، والارتباط المبني على الاحترام مع الخالق ومع كافة الأديان."
        },
        {
            title: dict.about.values.honor,
            icon: <Shield className="w-8 h-8 text-scout-navy" />,
            descEn: "Living with integrity, upholding our scout promise, and ensuring our actions match our values.",
            descAr: "العيش بنزاهة، والتمسك بالوعد الكشفي، والحرص على أن تتطابق أفعالنا مع قيمنا الكشفية."
        },
        {
            title: dict.about.values.homeland,
            icon: <Award className="w-8 h-8 text-scout-terracotta" />,
            descEn: "Active citizenship, caring for Lebanese heritage, and serving the historical community of Byblos.",
            descAr: "المواطنة الفاعلة، والاهتمام بالتراث اللبناني العريق، وخدمة المجتمع المحلي في مدينة جبيل التاريخية."
        },
        {
            title: dict.about.values.truth,
            icon: <Star className="w-8 h-8 text-yellow-600" />,
            descEn: "Always being honest and trustworthy in our thoughts, speech, and relationships with others.",
            descAr: "أن نكون دائماً صادقين وجديرين بالثقة في أفكارنا، كلامنا، وعلاقاتنا مع الآخرين."
        },
        {
            title: dict.about.values.loyalty,
            icon: <Heart className="w-8 h-8 text-red-600" />,
            descEn: "Faithful devotion to our families, our scout group, our leaders, and our country, Lebanon.",
            descAr: "الإخلاص والوفاء لعائلاتنا، ومجموعتنا الكشفية، وقادتنا، ووطننا الحبيب لبنان."
        },
        {
            title: dict.about.values.purity,
            icon: <BookOpen className="w-8 h-8 text-green-700" />,
            descEn: "Maintaining clean thoughts, words, and habits, creating a healthy environment for youth to grow.",
            descAr: "المحافظة على نقاء الأفكار والكلمات والعادات، وخلق بيئة صحية ينمو فيها الشباب."
        }
    ];

    return (
        <section id="about" className="py-20 bg-scout-beige relative overflow-hidden">
            {/* Soft circular highlights */}
            <div className="absolute top-1/3 right-0 w-96 h-96 bg-scout-gold/5 rounded-full filter blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-scout-green/5 rounded-full filter blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-scout-gold font-bold tracking-widest text-xs uppercase"
                    >
                        {dict.about.tagline}
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl sm:text-4xl font-extrabold text-scout-navy mt-2 font-display"
                    >
                        {dict.about.title}
                    </motion.h2>
                    <div className="w-20 h-1 bg-scout-gold mx-auto mt-4 rounded-full" />
                </div>

                {/* Narrative Grid */}
                <div className="grid md:grid-cols-2 gap-8 items-stretch mb-20">

                    {/* General Scouting */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-white p-8 rounded-3xl shadow-md shadow-scout-navy/5 border border-scout-beige-dark/50 flex flex-col justify-between hover:border-scout-gold/30 hover:shadow-lg transition-all duration-300 group"
                    >
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-scout-green/10 rounded-2xl text-scout-green-light group-hover:scale-110 transition-transform duration-300">
                                    <Compass className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-extrabold text-scout-navy font-display">
                                    {dict.about.general.title}
                                </h3>
                            </div>
                            <p className="text-scout-charcoal/80 leading-relaxed mb-4 text-sm sm:text-base">
                                {dict.about.general.text1}
                            </p>
                            <p className="text-scout-charcoal/80 leading-relaxed text-sm sm:text-base">
                                {dict.about.general.text2}
                            </p>
                        </div>
                        <div className="mt-8 border-t border-scout-beige-dark/40 pt-4 text-xs text-scout-gold font-bold uppercase tracking-widest">
                            Scouts des Cèdres Association
                        </div>
                    </motion.div>

                    {/* Group History */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="bg-white p-8 rounded-3xl shadow-md shadow-scout-navy/5 border border-scout-beige-dark/50 flex flex-col justify-between hover:border-scout-gold/30 hover:shadow-lg transition-all duration-300 group"
                    >
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-scout-navy/10 rounded-2xl text-scout-navy group-hover:scale-110 transition-transform duration-300">
                                    <Anchor className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-extrabold text-scout-navy font-display">
                                    {dict.about.history.title}
                                </h3>
                            </div>
                            <p className="text-scout-charcoal/80 leading-relaxed mb-4 text-sm sm:text-base">
                                {dict.about.history.text1}
                            </p>
                            <p className="text-scout-charcoal/80 leading-relaxed text-sm sm:text-base">
                                {dict.about.history.text2}
                            </p>
                        </div>
                        <div className="mt-8 border-t border-scout-beige-dark/40 pt-4 text-xs text-scout-navy-light font-bold uppercase tracking-widest">
                            Byblos (Jbeil) - Lebanon
                        </div>
                    </motion.div>
                </div>

                {/* History Video & Milestones Section */}
                <div className="bg-gradient-to-br from-scout-navy to-scout-navy-light p-6 md:p-10 rounded-3xl shadow-xl border border-scout-navy-light/40 mb-20 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(198,147,58,0.1),transparent_60%)] pointer-events-none" />
                    <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">

                        {/* Video Thumbnail block */}
                        <div className="lg:col-span-7 flex flex-col gap-4">
                            <h3 className="text-2xl font-extrabold text-scout-gold font-display">
                                {dict.aboutPage.historyVideoTitle}
                            </h3>
                            <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-2">
                                {dict.aboutPage.historyVideoSubtitle}
                            </p>

                            <div
                                onClick={() => setIsVideoOpen(true)}
                                className="relative aspect-video rounded-2xl overflow-hidden cursor-pointer group shadow-2xl border border-white/10"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/video-thumbnail.png"
                                    alt="Scouts Video Poster"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/45 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-scout-gold hover:bg-scout-gold-light text-scout-navy flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 active:scale-95">
                                        <Play className="w-8 h-8 fill-current ml-1 rtl:mr-1 rtl:ml-0" />
                                    </div>
                                </div>
                                <div className="absolute bottom-4 left-4 right-4 bg-scout-navy/80 backdrop-blur-md px-4 py-2 rounded-xl text-xs flex justify-between items-center text-white/90">
                                    <span className="font-semibold">{dict.aboutPage.playVideo}</span>
                                    <span className="opacity-75">5:05</span>
                                </div>
                            </div>
                        </div>

                        {/* Milestones timeline block */}
                        <div className="lg:col-span-5 flex flex-col gap-6 self-start mt-4 lg:mt-0">
                            <h4 className="text-lg font-bold text-scout-gold-light uppercase tracking-widest border-b border-white/10 pb-2">
                                {dict.aboutPage.milestonesTitle}
                            </h4>

                            <div className="relative border-l-2 border-scout-gold/20 ml-2 pl-6 space-y-6 rtl:border-l-0 rtl:border-r-2 rtl:ml-0 rtl:mr-2 rtl:pl-0 rtl:pr-6">

                                {/* Milestone 1 */}
                                <div className="relative">
                                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-scout-gold border-4 border-scout-navy rtl:-left-auto rtl:-right-[31px]" />
                                    <span className="text-xs font-bold text-scout-gold-light">
                                        {dict.aboutPage.milestone1Year}
                                    </span>
                                    <p className="text-sm font-semibold text-white mt-0.5">
                                        {dict.aboutPage.milestone1Title}
                                    </p>
                                </div>

                                {/* Milestone 2 */}
                                <div className="relative">
                                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-scout-gold border-4 border-scout-navy rtl:-left-auto rtl:-right-[31px]" />
                                    <span className="text-xs font-bold text-scout-gold-light">
                                        {dict.aboutPage.milestone2Year}
                                    </span>
                                    <p className="text-sm font-semibold text-white mt-0.5">
                                        {dict.aboutPage.milestone2Title}
                                    </p>
                                </div>

                                {/* Milestone 3 */}
                                <div className="relative">
                                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-scout-gold border-4 border-scout-navy rtl:-left-auto rtl:-right-[31px]" />
                                    <span className="text-xs font-bold text-scout-gold-light">
                                        {dict.aboutPage.milestone3Year}
                                    </span>
                                    <p className="text-sm font-semibold text-white mt-0.5">
                                        {dict.aboutPage.milestone3Title}
                                    </p>
                                </div>

                                {/* Milestone 4 */}
                                <div className="relative">
                                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-scout-gold border-4 border-scout-navy rtl:-left-auto rtl:-right-[31px] animate-pulse" />
                                    <span className="text-xs font-bold text-scout-gold-light">
                                        {dict.aboutPage.milestone4Year}
                                    </span>
                                    <p className="text-sm font-semibold text-white mt-0.5">
                                        {dict.aboutPage.milestone4Title}
                                    </p>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>

                {/* Core Values / Logo Shields Section */}
                <div className="mt-16">
                    <div className="text-center mb-12">
                        <h3 className="text-2xl font-bold text-scout-navy font-display">
                            {dict.about.values.title}
                        </h3>
                        <p className="text-sm text-scout-charcoal/60 mt-1 max-w-xl mx-auto">
                            {isAr
                                ? "هذه القيم الست ممثلة بالدروع المستديرة على سفينتنا الفينيقية في الشعار الكشفي"
                                : "These six values are represented by the round shields on our Phoenician galley logo"}
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {valueCards.map((value, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: idx * 0.05 }}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-scout-beige-dark/40 hover:shadow-md hover:border-scout-gold/30 hover:-translate-y-0.5 transition-all group duration-300"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-scout-beige rounded-xl group-hover:bg-scout-gold/10 transition-colors">
                                        {value.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-scout-navy font-display group-hover:text-scout-gold transition-colors">
                                            {value.title}
                                        </h4>
                                        <p className="text-xs sm:text-sm text-scout-charcoal/75 mt-2 leading-relaxed">
                                            {isAr ? value.descAr : value.descEn}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Video Lightbox Modal */}
            <AnimatePresence>
                {isVideoOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-8 backdrop-blur-md"
                        onClick={() => setIsVideoOpen(false)}
                    >
                        <button
                            onClick={() => setIsVideoOpen(false)}
                            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative max-w-4xl w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <iframe
                                src="/whoweare.mp4"
                                title="SDC Saint Jean Marc Legacy Video"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full border-0"
                            ></iframe>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
