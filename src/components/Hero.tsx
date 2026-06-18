"use client";

import { motion } from "framer-motion";
import { Anchor, ArrowDown, ChevronDown } from "lucide-react";
import { Dictionary } from "@/lib/dictionary";
import Image from "next/image";

interface HeroProps {
    dict: Dictionary;
    locale: string;
}

export default function Hero({ dict, locale }: HeroProps) {
    const isAr = locale === "ar";

    return (
        <section
            id="home"
            className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-scout-navy-dark via-scout-navy to-scout-navy-light overflow-hidden pt-20"
        >
            {/* Dynamic Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(198,147,58,0.15),transparent_60%)] pointer-events-none" />

            {/* Animated Floating Particles */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute w-2 h-2 bg-scout-gold rounded-full top-1/4 left-1/3 animate-ping duration-1000" />
                <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-1/2 left-2/3 animate-pulse duration-700" />
                <div className="absolute w-2.5 h-2.5 bg-scout-gold-light rounded-full top-2/3 left-1/5 animate-pulse duration-1000" />
            </div>

            {/* Decorative Arch overlay representing St. John Mark Cathedral */}
            <div className="absolute inset-0 opacity-5 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px]" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 flex flex-col items-center">
                {/* Animated Phoenician Ship Vector */}
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: [0, -10, 0], opacity: 1 }}
                    transition={{
                        y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
                        opacity: { duration: 1 }
                    }}
                    className="w-48 h-48 md:w-60 md:h-60  text-scout-gold relative flex items-center justify-center"
                >
                    {/* Custom Phoenician Galley SVG */}
                    <Image src="/sdc-logo-removebg-preview.png" height={150} width={400} alt="" className="filter invert-100" />
                </motion.div>

                {/* Dynamic Titles */}
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white tracking-tight uppercase font-display leading-tight"
                >
                    {dict.hero.title}
                </motion.h1>

                <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-lg sm:text-xl md:text-3xl font-semibold text-scout-gold-light mt-2 tracking-wide font-display"
                >
                    {dict.hero.subtitle}
                </motion.h2>

                {/* The Phoenician/Scout Motto */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="max-w-2xl text-base sm:text-lg md:text-xl text-white/80 italic mt-6 px-4 leading-relaxed font-serif"
                >
                    {dict.hero.motto}
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 mt-8 justify-center w-full max-w-md"
                >
                    <a
                        href={`/${locale}/contact`}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-scout-gold to-scout-gold-light text-scout-navy-dark font-extrabold px-8 py-4 rounded-xl shadow-lg shadow-scout-gold/10 hover:shadow-scout-gold/30 hover:scale-[1.03] active:scale-95 transition-all duration-300 text-sm sm:text-base tracking-wider uppercase border-2 border-scout-gold whitespace-nowrap"
                    >
                        <Anchor className="w-5 h-5 rtl-flip" />
                        <span>{dict.hero.cta}</span>
                    </a>
                    <a
                        href="#about"
                        className="flex items-center justify-center gap-2 bg-scout-navy-dark/40 backdrop-blur-md text-white font-bold border-2 border-white/20 px-8 py-4 rounded-xl hover:bg-white/10 hover:border-scout-gold/50 hover:scale-[1.03] active:scale-95 transition-all duration-300 text-sm sm:text-base tracking-wider uppercase whitespace-nowrap"
                    >
                        <span>{dict.hero.explore}</span>
                        <ArrowDown className="w-4 h-4 animate-bounce" />
                    </a>
                </motion.div>
            </div>

            {/* Scroll Indicator - positioned relative to the section viewport */}
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1 opacity-60 text-white hover:opacity-100 hover:scale-105 transition-all z-20 cursor-pointer">
                <span className="text-[10px] uppercase tracking-widest hidden sm:inline font-bold">
                    Scroll
                </span>
                <ChevronDown className="w-5 h-5 animate-bounce" />
            </div>

            {/* Decorative Wave Divider transitions into the About section */}
            <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0] z-10 pointer-events-none">
                <svg
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                    className="relative block w-full h-[40px] md:h-[70px]"
                >
                    <path
                        d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35C120.33,12.43,212.24,67.23,321.39,56.44Z"
                        className="fill-scout-beige"
                    ></path>
                </svg>
            </div>
        </section>
    );
}
