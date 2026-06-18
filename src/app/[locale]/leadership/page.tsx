"use client";

import { use, useState } from "react";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionary";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import leadershipData from "@/data/leadership.json";
import sectionsData from "@/data/sections.json";
import { Mail, Phone, Calendar, ArrowRight, ArrowLeft, X, Award, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function LeadershipPage({ params }: PageProps) {
  const { locale } = use(params);
  const dict = getDictionary(locale);
  const isAr = locale === "ar";

  const [selectedLeader, setSelectedLeader] = useState<any>(null);

  // Group leaders
  const groupScoutLeader = leadershipData.find((l) => l.id === "ghinwa");
  const managerialTeam = leadershipData.filter((l) => l.level === 2);
  const sectionLeaders = leadershipData.filter((l) => l.level === 3);

  const getSectionColor = (key?: string) => {
    if (!key) return "border-scout-navy";
    if (key === "louveteaux" || key === "jeannettes") return "border-sec-yellow";
    if (key === "eclaireurs" || key === "guides") return "border-sec-green";
    return "border-sec-red";
  };

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
            <span className="text-scout-charcoal">{isAr ? "القيادة" : "Our Leadership"}</span>
          </nav>

          {/* Page Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-scout-navy font-display">
              {isAr ? "فريق القيادة والمسؤولين" : "Our Leaders & Officers"}
            </h1>
            <p className="text-scout-charcoal/70 mt-4 text-sm sm:text-base leading-relaxed">
              {isAr
                ? "تعرّف على القادة والمسؤولين الإداريين والفنيين الذين يشرفون على مسيرة الفوج ويقودون طلائعه."
                : "Meet the dedicated group leaders, staff officers, and section chiefs guiding SDC Saint Jean Marc."}
            </p>
            <div className="w-20 h-1 bg-scout-gold mx-auto mt-6 rounded-full" />
          </div>

          <div className="space-y-16">
            
            {/* GROUP COMMAND (Ghinwa & Nicolas) */}
            <div className="flex flex-col items-center">
              <div className="w-full max-w-md bg-white p-6 rounded-3xl border border-scout-gold/30 shadow-md flex flex-col items-center text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-scout-gold/10 rounded-full filter blur-xl" />
                
                {/* Chef de Groupe */}
                {groupScoutLeader && (
                  <div 
                    className="cursor-pointer flex flex-col items-center w-full"
                    onClick={() => setSelectedLeader(groupScoutLeader)}
                  >
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-scout-gold shadow-sm mb-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={groupScoutLeader.image} 
                        alt={isAr ? groupScoutLeader.nameAr : groupScoutLeader.nameEn}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <p className="text-[10px] font-extrabold text-scout-gold uppercase tracking-widest mb-1">
                      {isAr ? groupScoutLeader.roleAr : groupScoutLeader.roleEn}
                    </p>
                    <h3 className="font-extrabold text-scout-navy text-xl mb-1 flex items-center gap-1.5 justify-center">
                      {isAr ? groupScoutLeader.nameAr : groupScoutLeader.nameEn}
                      <Info className="w-4 h-4 text-scout-gold-light" />
                    </h3>
                    <p className="text-xs text-scout-charcoal/70 max-w-sm">
                      {isAr ? groupScoutLeader.bioAr : groupScoutLeader.bioEn}
                    </p>
                  </div>
                )}

                {/* Assistant Chef de Groupe (Nicolas) listed directly under Ghinwa */}
                {groupScoutLeader?.assistants?.[0] && (
                  <div className="w-full mt-6 pt-6 border-t border-scout-beige-dark/30 flex flex-col items-center">
                    <div 
                      className="cursor-pointer flex flex-col items-center w-full"
                      onClick={() => setSelectedLeader(groupScoutLeader.assistants[0])}
                    >
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border border-scout-gold/50 shadow-sm mb-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={groupScoutLeader.assistants[0].image} 
                          alt={isAr ? groupScoutLeader.assistants[0].nameAr : groupScoutLeader.assistants[0].nameEn}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-[9px] font-extrabold text-scout-charcoal/50 uppercase tracking-wider mb-0.5">
                        {isAr ? groupScoutLeader.assistants[0].roleAr : groupScoutLeader.assistants[0].roleEn}
                      </p>
                      <h4 className="font-bold text-scout-navy text-sm flex items-center gap-1">
                        {isAr ? groupScoutLeader.assistants[0].nameAr : groupScoutLeader.assistants[0].nameEn}
                        <Info className="w-3.5 h-3.5 text-scout-gold-light" />
                      </h4>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* MANAGERIAL TEAM */}
            <div className="flex flex-col items-center">
              <h2 className="text-lg font-bold text-scout-navy font-display mb-8">
                {isAr ? "مجلس القيادة الإداري والمالي" : "Administrative & Management Council"}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full">
                {managerialTeam.map((leader) => {
                  const name = isAr ? leader.nameAr : leader.nameEn;
                  const role = isAr ? leader.roleAr : leader.roleEn;
                  return (
                    <motion.div
                      key={leader.id}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="bg-white p-5 rounded-3xl border border-scout-beige-dark/50 shadow-sm flex items-center gap-4 cursor-pointer hover:border-scout-gold/60 hover:shadow-md transition-all group"
                      onClick={() => setSelectedLeader(leader)}
                    >
                      <div className="w-14 h-14 rounded-full overflow-hidden border border-scout-beige-dark/40 flex-shrink-0 shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={leader.image} 
                          alt={name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex-grow">
                        <p className="text-[9px] font-extrabold text-scout-charcoal/40 uppercase tracking-wider mb-0.5 leading-none">
                          {role}
                        </p>
                        <p className="font-bold text-scout-navy text-sm leading-tight">
                          {name}
                        </p>
                      </div>
                      <Info className="w-4 h-4 text-scout-gold-light" />
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* SECTION LEADERS & ASSISTANTS */}
            <div className="flex flex-col items-center">
              <h2 className="text-lg font-bold text-scout-navy font-display mb-8">
                {isAr ? "قادة الأقسام ومساعدوهم" : "Section Leaders & Assistants"}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
                {sectionLeaders.map((leader) => {
                  const name = isAr ? leader.nameAr : leader.nameEn;
                  const role = isAr ? leader.roleAr : leader.roleEn;
                  const matchedSection = sectionsData.find((s) => s.key === leader.sectionKey);
                  const secTitle = matchedSection ? (isAr ? matchedSection.titleAr : matchedSection.titleEn) : "";

                  return (
                    <div 
                      key={leader.id} 
                      className={`bg-white rounded-3xl p-6 shadow-sm border-t-4 border-l border-r border-b border-scout-beige-dark/40 flex flex-col justify-between ${getSectionColor(leader.sectionKey)}`}
                    >
                      {/* Main Chef Card */}
                      <div 
                        className="cursor-pointer flex items-center gap-4 group"
                        onClick={() => setSelectedLeader(leader)}
                      >
                        <div className="w-16 h-16 rounded-full overflow-hidden border border-scout-beige-dark/30 shadow-sm flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={leader.image} 
                            alt={name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="flex-grow">
                          <p className="text-[9px] font-extrabold text-scout-charcoal/40 uppercase tracking-wider mb-0.5 leading-none">
                            {role}
                          </p>
                          <h4 className="font-extrabold text-scout-navy text-sm leading-tight flex items-center gap-1">
                            {name}
                            <Info className="w-3.5 h-3.5 text-scout-gold-light" />
                          </h4>
                          {secTitle && (
                            <span className="text-[9px] font-bold text-scout-gold uppercase tracking-wider mt-0.5 inline-block">
                              {secTitle}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Assistants listed directly under the chief */}
                      {leader.assistants && leader.assistants.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-scout-beige-dark/30 space-y-3">
                          {leader.assistants.map((assistant: any) => {
                            const aName = isAr ? assistant.nameAr : assistant.nameEn;
                            const aRole = isAr ? assistant.roleAr : assistant.roleEn;
                            return (
                              <div 
                                key={assistant.id}
                                className="cursor-pointer flex items-center gap-3 p-2 rounded-2xl bg-scout-beige/40 hover:bg-scout-beige/80 transition-colors group"
                                onClick={() => setSelectedLeader(assistant)}
                              >
                                <div className="w-9 h-9 rounded-full overflow-hidden border border-scout-beige-dark/40 flex-shrink-0">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img 
                                    src={assistant.image} 
                                    alt={aName}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-grow">
                                  <p className="text-[8px] font-extrabold text-scout-charcoal/50 uppercase tracking-wider leading-none mb-0.5">
                                    {aRole}
                                  </p>
                                  <p className="font-bold text-scout-navy text-xs leading-none">
                                    {aName}
                                  </p>
                                </div>
                                <Info className="w-3 h-3 text-scout-gold-light flex-shrink-0" />
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

          </div>

        </div>
      </main>

      {/* Leader Detail Modal */}
      <AnimatePresence>
        {selectedLeader && (() => {
          const name = isAr ? selectedLeader.nameAr : selectedLeader.nameEn;
          const role = isAr ? selectedLeader.roleAr : selectedLeader.roleEn;
          const bio = isAr ? selectedLeader.bioAr : selectedLeader.bioEn;
          const career = isAr ? selectedLeader.careerAr : selectedLeader.careerEn;
          
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
              onClick={() => setSelectedLeader(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl border border-scout-beige-dark/60 text-scout-navy"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  className="absolute top-4 right-4 sm:top-5 sm:right-5 p-1.5 bg-scout-beige hover:bg-scout-beige-dark text-scout-navy rounded-full transition-colors cursor-pointer"
                  onClick={() => setSelectedLeader(null)}
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Profile Header */}
                <div className="flex items-center gap-4 border-b border-scout-beige-dark/30 pb-4 mb-5">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-scout-gold shadow">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={selectedLeader.image} 
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-scout-gold bg-scout-navy/5 px-2.5 py-0.5 rounded border border-scout-gold/10 leading-none inline-block mb-1">
                      {isAr ? `عضو منذ ${selectedLeader.activeSince}` : `Joined Scouts in ${selectedLeader.activeSince}`}
                    </span>
                    <h3 className="text-lg font-extrabold leading-tight">{name}</h3>
                    <p className="text-xs text-scout-charcoal/60 font-semibold">{role}</p>
                  </div>
                </div>

                {/* Bio text */}
                <div className="space-y-4 mb-6 text-xs sm:text-sm text-scout-charcoal/80 leading-relaxed max-h-[40vh] overflow-y-auto pr-2">
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-scout-gold mb-1 tracking-wider">{isAr ? "نبذة شخصية" : "About"}</h4>
                    <p className="whitespace-pre-line">{bio}</p>
                  </div>
                  {career && (
                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-scout-gold mb-1 tracking-wider">{isAr ? "المسيرة الكشفية" : "Scouting Career"}</h4>
                      <p className="whitespace-pre-line">{career}</p>
                    </div>
                  )}
                </div>

                {/* Contact details */}
                <div className="space-y-3 pt-4 border-t border-scout-beige-dark/30 text-xs text-scout-charcoal">
                  <h4 className="text-[10px] uppercase font-bold text-scout-gold tracking-wider mb-2">
                    {isAr ? "معلومات الاتصال" : "Contact Details"}
                  </h4>

                  {/* Email Row */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-scout-beige/40 border border-scout-beige-dark/20 text-xs gap-3">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Mail className="w-4 h-4 text-scout-gold flex-shrink-0" />
                      <span className="truncate font-semibold text-scout-navy select-all">{selectedLeader.email}</span>
                    </div>
                    <a
                      href={`mailto:${selectedLeader.email}`}
                      className="bg-scout-navy hover:bg-scout-navy-light text-white font-extrabold py-1.5 px-3 rounded-xl text-[10px] tracking-wider uppercase transition-colors flex-shrink-0"
                    >
                      {isAr ? "إرسال" : "Send"}
                    </a>
                  </div>

                  {/* Phone / WhatsApp Row */}
                  <div className="flex flex-col gap-2.5 p-3 rounded-2xl bg-scout-beige/40 border border-scout-beige-dark/20 text-xs">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-scout-gold flex-shrink-0" />
                      <span className="font-semibold text-scout-navy select-all">{selectedLeader.phone}</span>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`tel:${selectedLeader.phone}`}
                        className="flex-grow flex items-center justify-center gap-1.5 bg-scout-navy hover:bg-scout-navy-light text-white font-extrabold py-2 px-3 rounded-xl text-[10px] tracking-wider uppercase transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{isAr ? "اتصال" : "Call"}</span>
                      </a>
                      <a
                        href={`https://wa.me/${selectedLeader.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-grow flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold py-2 px-3 rounded-xl text-[10px] tracking-wider uppercase transition-colors"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.623-1.023-5.086-2.885-6.948C16.59 2.012 14.125.99 11.699.99c-5.434 0-9.858 4.37-9.862 9.8-.001 1.761.47 3.48 1.362 5.011L2.185 20.91l5.228-1.371z"/>
                          <path d="M16.968 13.922c-.292-.145-1.727-.847-1.993-.943-.266-.097-.46-.145-.654.145-.193.291-.747.943-.915 1.137-.168.193-.336.218-.628.072-2.946-1.47-3.987-2.623-4.71-3.87-.193-.332-.019-.512.128-.658.132-.132.292-.34.438-.51.145-.169.193-.291.291-.485.097-.194.049-.364-.025-.51-.072-.145-.654-1.577-.896-2.158-.236-.569-.475-.491-.654-.5H6.89c-.193 0-.51.072-.776.364-.266.291-1.019.995-1.019 2.428 0 1.432 1.043 2.814 1.188 3.008.145.194 2.052 3.133 4.972 4.39 2.43.101 3.287-.223 3.876-.279.59-.056 1.727-.703 1.972-1.382.245-.679.245-1.26.17-1.382-.072-.12-.266-.193-.558-.338z"/>
                        </svg>
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {selectedLeader.sectionKey && (
                    <Link
                      href={`/${locale}/sections/${selectedLeader.sectionKey}`}
                      onClick={() => setSelectedLeader(null)}
                      className="w-full flex items-center justify-center gap-2 bg-scout-navy hover:bg-scout-navy-light text-white font-extrabold py-3 px-4 rounded-xl text-xs tracking-wider uppercase shadow hover:scale-[1.02] active:scale-95 transition-all mt-2"
                    >
                      <span>{isAr ? "عرض تفاصيل القسم" : "View Section Details"}</span>
                      {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    </Link>
                  )}
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      <Footer dict={dict} locale={locale} />
    </>
  );
}
