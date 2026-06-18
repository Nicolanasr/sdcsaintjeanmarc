"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, X, Image as ImageIcon } from "lucide-react";
import { Dictionary } from "@/lib/dictionary";
import galleryItems from "@/data/gallery.json";

interface GalleryProps {
  dict: Dictionary;
  locale: string;
}

export default function Gallery({ dict, locale }: GalleryProps) {
  const [filter, setFilter] = useState("all");
  const [activeImage, setActiveImage] = useState<typeof galleryItems[0] | null>(null);
  const isAr = locale === "ar";

  const categories = [
    { key: "all", label: dict.gallery.filterAll },
    { key: "camps", label: dict.gallery.categories.camps },
    { key: "meetings", label: dict.gallery.categories.meetings },
    { key: "outings", label: dict.gallery.categories.outings },
    { key: "community", label: dict.gallery.categories.community },
  ];

  const filteredItems = galleryItems.filter(
    (item) => filter === "all" || item.category === filter
  );

  return (
    <section id="gallery" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-extrabold text-scout-navy font-display"
          >
            {dict.gallery.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-scout-charcoal/70 mt-3 text-sm sm:text-base leading-relaxed"
          >
            {dict.gallery.subtitle}
          </motion.p>
          <div className="w-20 h-1 bg-scout-gold mx-auto mt-4 rounded-full" />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
                filter === cat.key
                  ? "bg-scout-gold border-scout-gold text-scout-navy shadow-sm scale-105"
                  : "bg-scout-beige border-scout-beige-dark/50 text-scout-charcoal/80 hover:border-scout-gold/30"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => {
              const caption = isAr ? item.captionAr : item.captionEn;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  onClick={() => setActiveImage(item)}
                  className="relative group overflow-hidden rounded-2xl aspect-square bg-scout-beige cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Image Element */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.src}
                    alt={caption}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />

                  {/* Dark mask overlay & icon */}
                  <div className="absolute inset-0 bg-scout-navy/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 text-white">
                    <div className="flex justify-end">
                      <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                        <Maximize2 className="w-4 h-4 text-scout-gold-light" />
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-widest text-scout-gold-light bg-white/10 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                      <p className="text-xs font-semibold mt-2 line-clamp-2 leading-relaxed">
                        {caption}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {activeImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-sm"
              onClick={() => setActiveImage(null)}
            >
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors z-50 cursor-pointer"
                onClick={() => setActiveImage(null)}
              >
                <X className="w-6 h-6" />
              </button>

              {/* Lightbox container */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative max-w-5xl max-h-[80vh] w-full h-full flex flex-col items-center justify-center"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
              >
                {/* Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeImage.src}
                  alt={isAr ? activeImage.captionAr : activeImage.captionEn}
                  className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl"
                />

                {/* Caption Panel */}
                <div className="mt-4 text-center max-w-xl px-4">
                  <span className="inline-block text-[10px] uppercase font-bold tracking-widest text-scout-gold bg-scout-gold/10 px-3 py-1 rounded-full mb-2">
                    {activeImage.category}
                  </span>
                  <p className="text-white text-sm sm:text-base leading-relaxed">
                    {isAr ? activeImage.captionAr : activeImage.captionEn}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
