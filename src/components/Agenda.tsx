"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Clock, Flag, Tent } from "lucide-react";
import { Dictionary } from "@/lib/dictionary";
import agendaEvents from "@/data/agenda.json";

interface AgendaProps {
  dict: Dictionary;
  locale: string;
}

export default function Agenda({ dict, locale }: AgendaProps) {
  const [filter, setFilter] = useState("all");
  const isAr = locale === "ar";

  const getEventIcon = (type: string) => {
    switch (type) {
      case "meeting":
        return <Clock className="w-5 h-5 text-sec-green" />;
      case "camp":
        return <Tent className="w-5 h-5 text-sec-red" />;
      case "event":
      default:
        return <Flag className="w-5 h-5 text-scout-gold" />;
    }
  };

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-sec-green/10 text-sec-green border-sec-green/20";
      case "camp":
        return "bg-sec-red/10 text-sec-red border-sec-red/20";
      case "event":
      default:
        return "bg-scout-gold/10 text-scout-gold border-scout-gold/20";
    }
  };

  const filteredEvents = agendaEvents.filter(
    (event) => filter === "all" || event.type === filter
  );

  return (
    <section id="agenda" className="py-20 bg-scout-beige relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-extrabold text-scout-navy font-display"
          >
            {dict.agenda.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-scout-charcoal/70 mt-3 text-sm sm:text-base leading-relaxed"
          >
            {dict.agenda.subtitle}
          </motion.p>
          <div className="w-20 h-1 bg-scout-gold mx-auto mt-4 rounded-full" />
        </div>

        {/* Filters Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {["all", "meeting", "camp", "event"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
                filter === type
                  ? "bg-scout-navy border-scout-navy text-white shadow-md scale-105"
                  : "bg-white border-scout-beige-dark/50 text-scout-charcoal/85 hover:border-scout-navy/30"
              }`}
            >
              {type === "all"
                ? dict.agenda.categories.all
                : type === "meeting"
                ? dict.agenda.categories.meeting
                : type === "camp"
                ? dict.agenda.categories.camp
                : dict.agenda.categories.event}
            </button>
          ))}
        </div>

        {/* Timeline Events List */}
        <div className="relative border-l-2 border-scout-beige-dark/80 ml-4 mr-4 rtl:border-l-0 rtl:border-r-2 rtl:mr-4 rtl:ml-4 pl-6 pr-6 rtl:pl-0 rtl:pr-6 space-y-12">
          <AnimatePresence mode="popLayout">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event, idx) => {
                const title = isAr ? event.titleAr : event.titleEn;
                const date = isAr ? event.dateAr : event.date;
                const location = isAr ? event.locationAr : event.locationEn;
                const desc = isAr ? event.descriptionAr : event.descriptionEn;

                return (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, x: isAr ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="relative flex flex-col sm:flex-row sm:items-start gap-4 bg-white p-6 rounded-2xl shadow-sm border border-scout-beige-dark/30 hover:shadow-md transition-shadow group"
                  >
                    {/* Timeline Dot Indicator */}
                    <div className="absolute top-6 -left-[37px] rtl:-left-auto rtl:-right-[37px] w-8 h-8 rounded-full bg-white border-2 border-scout-beige-dark flex items-center justify-center shadow-sm group-hover:border-scout-gold transition-colors z-10">
                      {getEventIcon(event.type)}
                    </div>

                    {/* Left/Right content split */}
                    <div className="flex-1">
                      {/* Top metadata tags */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="flex items-center gap-1.5 text-xs text-scout-charcoal/60 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-scout-gold" />
                          {date}
                        </span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getEventBadgeColor(event.type)}`}>
                          {event.type}
                        </span>
                      </div>

                      {/* Event Title */}
                      <h3 className="text-lg sm:text-xl font-bold text-scout-navy font-display group-hover:text-scout-gold transition-colors">
                        {title}
                      </h3>

                      {/* Location details */}
                      <div className="flex items-center gap-1.5 mt-2 text-xs sm:text-sm text-scout-charcoal/70 font-medium">
                        <MapPin className="w-4 h-4 text-scout-terracotta" />
                        <span>{location}</span>
                      </div>

                      {/* Description */}
                      <p className="text-scout-charcoal/75 text-xs sm:text-sm mt-3 leading-relaxed border-t border-scout-beige-dark/20 pt-3">
                        {desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-scout-charcoal/50 py-8 italic"
              >
                {dict.agenda.noEvents}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
