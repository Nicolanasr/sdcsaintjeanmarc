"use client";

import Link from "next/link";
import { Anchor, Mail, Phone, MapPin } from "lucide-react";
import { Dictionary } from "@/lib/dictionary";

interface FooterProps {
  dict: Dictionary;
  locale: string;
}

export default function Footer({ dict, locale }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-scout-navy-dark text-white border-t border-scout-navy-light/40">
      
      {/* Top Footer Section: Quick links, contact and Map */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          
          {/* Brand Info Column */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-scout-gold p-2 rounded-full text-scout-navy">
                <Anchor className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-wide font-display text-scout-gold-light">
                  {dict.hero.title}
                </span>
                <span className="text-[10px] text-white/50 leading-none">
                  {dict.hero.subtitle}
                </span>
              </div>
            </div>
            
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              {locale === "ar"
                ? "فوج كشفي بحري يتبع لجمعية كشافة الأرز، ينشط في كاتدرائية مار يوحنا مرقس الأثرية في مدينة جبيل، ويعمل على بناء أجيال مسؤولة ومحبة لوطنها."
                : "A maritime scout group under the Scouts des Cèdres association, active at the historic St. John Mark Cathedral in Byblos, dedicated to building responsible, active citizens."}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="p-2 bg-white/5 text-white/70 hover:text-scout-gold hover:bg-white/10 rounded-full transition-all"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H7v3h2v9h3v-9h3.6l.4-3H12V6c0-.88.39-1 1-1h2.8V2H13c-2.9 0-4 1.4-4 4z"/>
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2 bg-white/5 text-white/70 hover:text-scout-gold hover:bg-white/10 rounded-full transition-all"
              >
                <svg className="w-4 h-4 stroke-current fill-none stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="p-2 bg-white/5 text-white/70 hover:text-scout-gold hover:bg-white/10 rounded-full transition-all"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.53 3.53 12 3.53 12 3.53s-7.53 0-9.388.525a3.003 3.003 0 0 0-2.11 2.108C0 8.022 0 12 0 12s0 3.978.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.47 20.47 12 20.47 12 20.47s7.53 0 9.388-.525a3.002 3.002 0 0 0 2.11-2.108C24 15.978 24 12 24 12s0-3.978-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-scout-gold-light">
              {locale === "ar" ? "روابط سريعة" : "Quick Navigation"}
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs sm:text-sm text-white/75">
              <a href="#home" className="hover:text-scout-gold transition-colors">{dict.nav.home}</a>
              <a href="#about" className="hover:text-scout-gold transition-colors">{dict.nav.about}</a>
              <a href="#sections" className="hover:text-scout-gold transition-colors">{dict.nav.sections}</a>
              <a href="#agenda" className="hover:text-scout-gold transition-colors">{dict.nav.agenda}</a>
              <a href="#gallery" className="hover:text-scout-gold transition-colors">{dict.nav.gallery}</a>
              <a href="#faq" className="hover:text-scout-gold transition-colors">{dict.nav.faq}</a>
              <a href="#join" className="hover:text-scout-gold transition-colors">{dict.nav.join}</a>
            </div>
          </div>

          {/* Map & Direction Column */}
          <div className="md:col-span-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-scout-gold-light">
              {locale === "ar" ? "موقعنا في جبيل" : "Our Location in Byblos"}
            </h3>
            {/* Google Map Iframe */}
            <div className="w-full h-44 rounded-2xl overflow-hidden border border-white/10 shadow-inner">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.8115598132895!2d35.6171822!3d34.1204859!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151f50684f8bb64f%3A0xe54e38cc4fc47610!2sSaint%20John%20Marc%20Cathedral!5e0!3m2!1sen!2slb!4v1718037000000!5m2!1sen!2slb"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <MapPin className="w-4 h-4 text-scout-gold" />
              <span>{dict.join.info.address}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom copyright and credits */}
      <div className="border-t border-white/5 bg-black/10 py-6 text-center text-xs text-white/45">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>
            © {currentYear} {dict.hero.title} - {dict.hero.subtitle}. {dict.footer.rights}
          </p>
          <p className="text-[10px] text-white/30">
            {dict.footer.madeWith}
          </p>
        </div>
      </div>

    </footer>
  );
}
