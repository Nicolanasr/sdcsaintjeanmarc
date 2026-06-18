import { getDictionary } from "@/lib/dictionary";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import sectionsData from "@/data/sections.json";
import Link from "next/link";
import { Users, Shield, Calendar, ArrowRight, ArrowLeft } from "lucide-react";

interface SectionsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SectionsPage({ params }: SectionsPageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const isAr = locale === "ar";

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
            <span className="text-scout-charcoal">{dict.nav.sections}</span>
          </nav>

          {/* Page Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-scout-navy font-display">
              {dict.sectionsPage.title}
            </h1>
            <p className="text-scout-charcoal/70 mt-4 text-base sm:text-lg leading-relaxed">
              {dict.sectionsPage.subtitle}
            </p>
            <div className="w-20 h-1 bg-scout-gold mx-auto mt-6 rounded-full" />
          </div>

          {/* Sections Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {sectionsData.filter((sec) => sec.key !== "chefs").map((sec) => {
              const title = isAr ? sec.titleAr : sec.titleEn;
              const motto = isAr ? sec.mottoAr : sec.mottoEn;
              const colorName = isAr ? sec.colorNameAr : sec.colorNameEn;
              const schedule = isAr ? sec.meetingScheduleAr : sec.meetingScheduleEn;
              const description = isAr ? sec.descriptionAr : sec.descriptionEn;

              return (
                <div
                  key={sec.key}
                  className={`bg-white rounded-3xl shadow-md shadow-scout-navy/5 border border-scout-beige-dark/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group overflow-hidden ${sec.colorClass}`}
                >
                  {/* Cover Image */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-scout-beige border-b border-scout-beige-dark/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={sec.coverImage}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
                  </div>

                  <div className="p-6 md:p-8 flex-grow flex flex-col justify-between">
                    <div>
                      {/* Badge and Age Header */}
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-xs font-bold uppercase tracking-widest bg-scout-beige px-4 py-1.5 rounded-full text-scout-charcoal/70 border border-scout-beige-dark/40">
                          {sec.ages}
                        </span>
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-scout-gold px-3 py-1 rounded-full bg-scout-navy/5">
                          {colorName}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-2xl font-extrabold text-scout-navy font-display mb-1 group-hover:text-scout-gold transition-colors duration-300">
                        {title}
                      </h2>
                      <p className="text-xs text-scout-charcoal/40 font-bold mb-4 uppercase">
                        {isAr ? sec.titleEn : sec.titleAr}
                      </p>

                      <p className="text-scout-charcoal/80 text-sm sm:text-base leading-relaxed mb-6">
                        {description}
                      </p>

                      <div className="grid sm:grid-cols-2 gap-4 border-t border-b border-scout-beige-dark/30 py-4 mb-6 text-xs sm:text-sm">
                        <div className="flex items-center gap-2.5 text-scout-charcoal/70">
                          <Users className="w-5 h-5 text-scout-gold" />
                          <div>
                            <p className="text-[10px] uppercase font-bold text-scout-charcoal/40 leading-none mb-0.5">
                              {dict.sectionsPage.membersCount}
                            </p>
                            <p className="font-bold text-scout-navy leading-tight">
                              {sec.membersCount}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 text-scout-charcoal/70">
                          <Calendar className="w-5 h-5 text-scout-gold" />
                          <div>
                            <p className="text-[10px] uppercase font-bold text-scout-charcoal/40 leading-none mb-0.5">
                              {dict.sectionsPage.schedule}
                            </p>
                            <p className="font-bold text-scout-navy leading-tight truncate max-w-[150px]">
                              {schedule}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CTA Details Button */}
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs font-bold italic text-scout-gold">
                        {isAr ? "شعار: " : "Motto: "}{motto}
                      </span>
                      <Link
                        href={`/${locale}/sections/${sec.key}`}
                        className="inline-flex items-center gap-2 bg-scout-navy text-white font-bold px-5 py-2.5 rounded-xl shadow hover:bg-scout-navy-light transition-all text-xs tracking-wider uppercase border border-scout-navy"
                      >
                        <span>{dict.agenda.viewMore}</span>
                        {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer dict={dict} locale={locale} />
    </>
  );
}
