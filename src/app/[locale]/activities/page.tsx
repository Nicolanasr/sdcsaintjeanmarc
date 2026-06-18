"use client";

import { use, useState } from "react";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionary";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import agendaData from "@/data/agenda.json";
import { Calendar as CalendarIcon, MapPin, ChevronLeft, ChevronRight, Clock, ArrowRight, ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function ActivitiesPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const locale = resolvedParams.locale;

  const dict = getDictionary(locale);
  const isAr = locale === "ar";

  // Current Calendar state (defaults to June 2026 since current system time is June 2026)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // 0-indexed, so 5 = June
  const [selectedDayEvents, setSelectedDayEvents] = useState<any[]>([]);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null);
  
  // Category Filter
  const [filterType, setFilterType] = useState("all");

  // Format events to map to specific calendar dates
  // (Translating agenda.json items to specific Dates in 2026)
  const getMappedEvents = () => {
    return agendaData.map((item) => {
      let mappedDates: Date[] = [];
      if (item.id === "1") {
        // Weekly Saturday Meeting: Every Saturday in June/July 2026
        // Saturdays in June 2026: 6, 13, 20, 27
        // Saturdays in July 2026: 4, 11, 18, 25
        mappedDates = [
          new Date(2026, 5, 6),
          new Date(2026, 5, 13),
          new Date(2026, 5, 20),
          new Date(2026, 5, 27),
          new Date(2026, 6, 4),
          new Date(2026, 6, 11),
          new Date(2026, 6, 18),
          new Date(2026, 6, 25),
        ];
      } else if (item.id === "2") {
        // Summer Camp 2026 Preparation: July 15 - July 22, 2026
        for (let d = 15; d <= 22; d++) {
          mappedDates.push(new Date(2026, 6, d));
        }
      } else if (item.id === "3") {
        // Byblos Citadelle Civic Day: September 12, 2026
        mappedDates = [new Date(2026, 8, 12)];
      } else if (item.id === "4") {
        // Opening Season Ceremony: October 3, 2026
        mappedDates = [new Date(2026, 9, 3)];
      }
      return { ...item, mappedDates };
    });
  };

  const allEvents = getMappedEvents();

  // Get days in month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sun, 1 = Mon, etc.)
  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDayEvents([]);
    setSelectedDayNumber(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDayEvents([]);
    setSelectedDayNumber(null);
  };

  // Check if a specific date has any events
  const getEventsForDate = (day: number) => {
    const checkDate = new Date(currentYear, currentMonth, day);
    return allEvents.filter((event) =>
      event.mappedDates.some(
        (d) =>
          d.getDate() === checkDate.getDate() &&
          d.getMonth() === checkDate.getMonth() &&
          d.getFullYear() === checkDate.getFullYear()
      )
    );
  };

  const handleDayClick = (day: number) => {
    const events = getEventsForDate(day);
    setSelectedDayEvents(events);
    setSelectedDayNumber(day);
  };

  // Render Calendar Grid Cells
  const renderCalendarCells = () => {
    const cells = [];
    
    // Empty cells for alignment before first day of month
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="bg-scout-beige/25 border border-scout-beige-dark/20 min-h-[50px] sm:min-h-[90px]" />);
    }

    // Days cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDate(day);
      const isSelected = selectedDayNumber === day;
      const hasEvents = dayEvents.length > 0;

      // Color indicator based on the first event type of the day
      let eventColorClass = "";
      if (hasEvents) {
        const primaryType = dayEvents[0].type;
        if (primaryType === "meeting") eventColorClass = "bg-sec-yellow";
        else if (primaryType === "camp") eventColorClass = "bg-sec-green";
        else eventColorClass = "bg-sec-red";
      }

      cells.push(
        <div
          key={`day-${day}`}
          onClick={() => handleDayClick(day)}
          className={`p-1.5 sm:p-2 border border-scout-beige-dark/30 min-h-[50px] sm:min-h-[90px] flex flex-col justify-between cursor-pointer transition-all duration-200 relative ${
            isSelected
              ? "bg-scout-gold/10 border-scout-gold shadow-inner"
              : "bg-white hover:bg-scout-beige/50"
          }`}
        >
          <span className={`text-xs sm:text-sm font-bold ${isSelected ? "text-scout-gold font-extrabold" : "text-scout-navy"}`}>
            {day}
          </span>

          {hasEvents && (
            <div className="flex flex-col gap-1 w-full mt-1">
              {/* Desktop view: small badge labels */}
              <div className="hidden sm:flex flex-col gap-0.5">
                {dayEvents.slice(0, 2).map((ev, index) => {
                  const evTitle = isAr ? ev.titleAr : ev.titleEn;
                  let badgeColor = "bg-sec-yellow text-scout-navy-dark";
                  if (ev.type === "camp") badgeColor = "bg-sec-green text-white";
                  if (ev.type === "event") badgeColor = "bg-sec-red text-white";

                  return (
                    <span
                      key={index}
                      className={`text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded truncate font-bold leading-tight ${badgeColor}`}
                    >
                      {evTitle}
                    </span>
                  );
                })}
                {dayEvents.length > 2 && (
                  <span className="text-[8px] text-scout-charcoal/50 text-center font-bold">
                    +{dayEvents.length - 2} more
                  </span>
                )}
              </div>

              {/* Mobile view: small dot indicator */}
              <div className="flex sm:hidden justify-center">
                <span className={`w-2.5 h-2.5 rounded-full ${eventColorClass}`} />
              </div>
            </div>
          )}
        </div>
      );
    }

    return cells;
  };

  const filteredEventsList = agendaData.filter(
    (item) => filterType === "all" || item.type === filterType
  );

  return (
    <>
      <Navbar dict={dict} locale={locale} />
      <main className="flex-grow pt-28 pb-20 bg-scout-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <nav className="text-xs sm:text-sm text-scout-charcoal/50 mb-6 font-semibold">
            <Link href={`/${locale}`} className="hover:text-scout-gold transition-colors">
              {dict.nav.home}
            </Link>
            <span className="mx-2 font-normal">/</span>
            <span className="text-scout-charcoal">{dict.nav.agenda}</span>
          </nav>

          {/* Page Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-scout-navy font-display">
              {dict.activitiesPage.title}
            </h1>
            <p className="text-scout-charcoal/70 mt-4 text-base sm:text-lg leading-relaxed">
              {dict.activitiesPage.subtitle}
            </p>
            <div className="w-20 h-1 bg-scout-gold mx-auto mt-6 rounded-full" />
          </div>

          <div className="space-y-8">
            
            {/* Calendar Block */}
            <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-scout-beige-dark/50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg sm:text-xl font-extrabold text-scout-navy font-display flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-scout-gold" />
                  <span>{dict.activitiesPage.calendarTitle}</span>
                </h2>
                
                {/* Month navigation switcher */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1.5 border border-scout-beige-dark hover:border-scout-gold text-scout-navy rounded-lg hover:bg-scout-beige/40 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm sm:text-base font-extrabold text-scout-navy uppercase min-w-[120px] text-center">
                    {dict.activitiesPage.calendarMonths[currentMonth]} {currentYear}
                  </span>
                  <button
                    onClick={handleNextMonth}
                    className="p-1.5 border border-scout-beige-dark hover:border-scout-gold text-scout-navy rounded-lg hover:bg-scout-beige/40 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day Labels */}
              <div className="grid grid-cols-7 text-center font-bold text-xs uppercase tracking-wider text-scout-charcoal/65 py-2 border-b border-scout-beige-dark/40 mb-1">
                {dict.activitiesPage.calendarDays.map((d: string) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              {/* Days Grid Cells */}
              <div className="grid grid-cols-7 border-t border-l border-scout-beige-dark/30 rounded-lg overflow-hidden">
                {renderCalendarCells()}
              </div>

              {/* Selected Day details popover inside the page */}
              {selectedDayNumber && (
                <div className="mt-6 p-5 bg-scout-beige/40 rounded-2xl border border-scout-gold/25 animate-fade-in">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-scout-gold mb-3">
                    {isAr ? "أنشطة يوم: " : "Activities for: "}{selectedDayNumber} {dict.activitiesPage.calendarMonths[currentMonth]}
                  </h3>
                  {selectedDayEvents.length === 0 ? (
                    <p className="text-sm text-scout-charcoal/50 italic">{dict.activitiesPage.noEvents}</p>
                  ) : (
                    <div className="space-y-4">
                      {selectedDayEvents.map((ev) => {
                        const evTitle = isAr ? ev.titleAr : ev.titleEn;
                        const evLocation = isAr ? ev.locationAr : ev.locationEn;
                        const evDesc = isAr ? ev.descriptionAr : ev.descriptionEn;

                        return (
                          <div key={ev.id} className="bg-white p-4 rounded-xl shadow-sm border border-scout-beige-dark/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <span className={`text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full inline-block mb-1.5 ${
                                ev.type === "meeting" ? "bg-sec-yellow/15 text-yellow-600" :
                                ev.type === "camp" ? "bg-sec-green/15 text-green-600" :
                                "bg-sec-red/15 text-red-600"
                              }`}>
                                {dict.agenda.categories[ev.type as keyof typeof dict.agenda.categories]}
                              </span>
                              <h4 className="text-base font-extrabold text-scout-navy">{evTitle}</h4>
                              <p className="text-xs text-scout-charcoal/70 mt-1 line-clamp-1">{evDesc}</p>
                            </div>
                            <Link
                              href={`/${locale}/activities/${ev.id}`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-scout-navy hover:text-scout-gold uppercase tracking-wider self-start sm:self-auto flex-shrink-0"
                            >
                              <span>{dict.activitiesPage.viewDetails}</span>
                              {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Filter Categories Widget */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-scout-beige-dark/50">
              <h2 className="text-lg font-bold text-scout-navy font-display mb-4 pb-2 border-b border-scout-beige-dark/30 text-center sm:text-start">
                {isAr ? "فرز الفئات" : "Filter Categories"}
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: "all", label: dict.agenda.categories.all },
                  { key: "meeting", label: dict.agenda.categories.meeting },
                  { key: "camp", label: dict.agenda.categories.camp },
                  { key: "event", label: dict.agenda.categories.event },
                ].map((btn) => (
                  <button
                    key={btn.key}
                    onClick={() => setFilterType(btn.key)}
                    className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all border cursor-pointer text-center ${
                      filterType === btn.key
                        ? "bg-scout-gold border-scout-gold text-scout-navy font-bold shadow-sm"
                        : "bg-scout-beige/60 border-scout-beige-dark/40 text-scout-charcoal hover:bg-scout-beige"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Event card grid view */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEventsList.map((item) => {
                const title = isAr ? item.titleAr : item.titleEn;
                const date = isAr ? item.dateAr : item.date;
                const location = isAr ? item.locationAr : item.locationEn;
                
                return (
                  <div
                    key={item.id}
                    className="bg-white p-5 rounded-3xl shadow-sm border border-scout-beige-dark/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group flex flex-col justify-between"
                  >
                    <div>
                      <span className={`text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full inline-block mb-3 ${
                        item.type === "meeting" ? "bg-sec-yellow/15 text-yellow-600" :
                        item.type === "camp" ? "bg-sec-green/15 text-green-600" :
                        "bg-sec-red/15 text-red-600"
                      }`}>
                        {dict.agenda.categories[item.type as keyof typeof dict.agenda.categories]}
                      </span>

                      <h3 className="text-lg font-extrabold text-scout-navy font-display group-hover:text-scout-gold transition-colors duration-300">
                        {title}
                      </h3>

                      <div className="space-y-2 mt-4 text-xs text-scout-charcoal/70 border-t border-scout-beige-dark/20 pt-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-scout-gold flex-shrink-0" />
                          <span className="font-bold">{date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-scout-gold flex-shrink-0" />
                          <span className="truncate">{location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-2 border-t border-scout-beige-dark/10">
                      <Link
                        href={`/${locale}/activities/${item.id}`}
                        className="inline-flex items-center gap-1 text-xs font-extrabold text-scout-navy hover:text-scout-gold uppercase tracking-wider border-b border-transparent hover:border-scout-gold transition-all"
                      >
                        <span>{dict.activitiesPage.viewDetails}</span>
                        {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </main>
      <Footer dict={dict} locale={locale} />
    </>
  );
}
