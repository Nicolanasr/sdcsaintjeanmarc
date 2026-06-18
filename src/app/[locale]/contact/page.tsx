import { getDictionary } from "@/lib/dictionary";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JoinForm from "@/components/JoinForm";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ContactPage({ params }: ContactPageProps) {
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
            <span className="text-scout-charcoal">{dict.nav.contact}</span>
          </nav>

          {/* Page Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-scout-navy font-display">
              {dict.contactPage.title}
            </h1>
            <p className="text-scout-charcoal/70 mt-4 text-base sm:text-lg leading-relaxed">
              {dict.contactPage.subtitle}
            </p>
            <div className="w-20 h-1 bg-scout-gold mx-auto mt-6 rounded-full" />
          </div>

          {/* Form & Map Grid */}
          <div className="grid lg:grid-cols-12 gap-8 items-start mb-16">
            
            {/* Form Section */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-scout-beige-dark/50">
              <h2 className="text-xl sm:text-2xl font-bold text-scout-navy font-display mb-6 border-b border-scout-beige-dark/30 pb-3">
                {isAr ? "أرسل لنا رسالة أو طلب انتساب" : "Send Us a Message or Join"}
              </h2>
              {/* Reuse JoinForm logic inside the page wrapper */}
              <JoinForm dict={dict} locale={locale} embedMode={true} />
            </div>

            {/* Sidebar Details and Map */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Info Widget */}
              <div className="bg-gradient-to-br from-scout-navy to-scout-navy-dark text-white p-6 sm:p-8 rounded-3xl shadow-md border border-scout-navy-light/40">
                <h3 className="text-xl font-bold font-display text-scout-gold-light mb-4 pb-2 border-b border-white/10">
                  {dict.join.info.title}
                </h3>
                
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-scout-gold flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="opacity-50 font-bold uppercase text-[9px] mb-0.5">{isAr ? "العنوان" : "Address"}</p>
                      <p className="leading-relaxed">{dict.join.info.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-scout-gold flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="opacity-50 font-bold uppercase text-[9px] mb-0.5">{isAr ? "الهاتف" : "Phone"}</p>
                      <p className="dir-ltr text-start">{dict.join.info.phone1} / {dict.join.info.phone2}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-scout-gold flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="opacity-50 font-bold uppercase text-[9px] mb-0.5">{isAr ? "البريد الإلكتروني" : "Email"}</p>
                      <p>{dict.join.info.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-scout-gold flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="opacity-50 font-bold uppercase text-[9px] mb-0.5">{dict.contactPage.hoursTitle}</p>
                      <p className="leading-relaxed">{dict.contactPage.hoursDetails}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Widget */}
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-scout-beige-dark/50 overflow-hidden">
                <h3 className="text-sm font-bold uppercase tracking-wider text-scout-navy mb-3 px-2">
                  {dict.contactPage.mapTitle}
                </h3>
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-inner border border-scout-beige-dark/30">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.2750954005886!2d35.6465451!3d34.1205621!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151f435017c603a1%3A0xe03fe7f7fef403!2sSt.%20John%20Mark%20Cathedral!5e0!3m2!1sen!2slb!4v1781120000000!5m2!1sen!2slb"
                    width="100%"
                    height="100%"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="border-0 w-full h-full"
                  ></iframe>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>
      <Footer dict={dict} locale={locale} />
    </>
  );
}
