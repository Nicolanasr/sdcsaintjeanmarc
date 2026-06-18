"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Dictionary } from "@/lib/dictionary";
import faqData from "@/data/faqs.json";

interface FAQsProps {
  dict: Dictionary;
  locale: string;
}

export default function FAQs({ dict, locale }: FAQsProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const isAr = locale === "ar";

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-20 bg-white relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-extrabold text-scout-navy font-display"
          >
            {dict.faqs.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-scout-charcoal/70 mt-3 text-sm sm:text-base leading-relaxed"
          >
            {dict.faqs.subtitle}
          </motion.p>
          <div className="w-20 h-1 bg-scout-gold mx-auto mt-4 rounded-full" />
        </div>

        {/* FAQ List Accordions */}
        <div className="space-y-4">
          {faqData.map((faq) => {
            const question = isAr ? faq.questionAr : faq.questionEn;
            const answer = isAr ? faq.answerAr : faq.answerEn;
            const isOpen = openId === faq.id;

            return (
              <div
                key={faq.id}
                className="border border-scout-beige-dark/50 rounded-2xl overflow-hidden bg-scout-beige/25 hover:border-scout-gold/20 transition-colors"
              >
                {/* Accordion Trigger Header */}
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full flex items-center justify-between p-5 text-start cursor-pointer focus:outline-none"
                >
                  <div className="flex items-start gap-3.5 pr-4 rtl:pr-0 rtl:pl-4">
                    <HelpCircle className="w-5 h-5 text-scout-gold mt-0.5 shrink-0" />
                    <span className="font-semibold text-sm sm:text-base text-scout-navy font-display">
                      {question}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-scout-charcoal/40"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </button>

                {/* Accordion Content Drawer */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-5 pb-5 pl-12 rtl:pl-5 rtl:pr-12 border-t border-scout-beige-dark/20 pt-4">
                        <p className="text-xs sm:text-sm text-scout-charcoal/80 leading-relaxed">
                          {answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
