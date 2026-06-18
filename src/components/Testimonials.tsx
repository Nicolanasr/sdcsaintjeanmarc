"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Dictionary } from "@/lib/dictionary";

interface TestimonialsProps {
  dict: Dictionary;
  locale: string;
}

export default function Testimonials({ dict, locale }: TestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = dict.testimonials.items;
  const isAr = locale === "ar";

  // Auto-scroll testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [items.length]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-scout-navy to-scout-navy-dark text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 w-48 h-48 bg-scout-gold/5 rounded-full filter blur-2xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-60 h-60 bg-scout-gold/5 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
        
        {/* Quotation Mark Icon Decor */}
        <div className="flex justify-center mb-6 text-scout-gold/30">
          <Quote className="w-12 h-12" />
        </div>

        {/* Header */}
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display mb-1 text-white">
          {dict.testimonials.title}
        </h2>
        <p className="text-xs sm:text-sm text-scout-gold-light opacity-80 uppercase tracking-widest font-semibold mb-12">
          {dict.testimonials.subtitle}
        </p>

        {/* Testimonial slider body */}
        <div className="min-h-[160px] sm:min-h-[120px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="max-w-2xl"
            >
              <p className="text-base sm:text-lg md:text-xl font-medium leading-relaxed italic text-white/90">
                “{items[currentIndex].quote}”
              </p>
              
              <div className="mt-6">
                <h4 className="text-sm sm:text-base font-bold text-scout-gold">
                  {items[currentIndex].author}
                </h4>
                <p className="text-[10px] sm:text-xs text-white/50 mt-0.5">
                  {items[currentIndex].role}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slide navigation controls */}
        <div className="flex items-center justify-center gap-6 mt-10">
          {/* Previous Arrow */}
          <button
            onClick={isAr ? handleNext : handlePrev}
            className="p-2 border border-white/10 hover:border-scout-gold rounded-full hover:bg-white/5 transition-all text-white/70 hover:text-scout-gold cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
          </button>

          {/* Dots Indicator */}
          <div className="flex gap-2">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx
                    ? "bg-scout-gold w-6"
                    : "bg-white/25 hover:bg-white/40"
                }`}
              />
            ))}
          </div>

          {/* Next Arrow */}
          <button
            onClick={isAr ? handlePrev : handleNext}
            className="p-2 border border-white/10 hover:border-scout-gold rounded-full hover:bg-white/5 transition-all text-white/70 hover:text-scout-gold cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 rtl:rotate-180" />
          </button>
        </div>

      </div>
    </section>
  );
}
