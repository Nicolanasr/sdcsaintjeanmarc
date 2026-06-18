import type { Metadata } from "next";
import { Outfit, Cairo } from "next/font/google";
import "../globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  
  return {
    title: isAr
      ? "كشافة الأرز | فوج سان جان مارك - جبيل"
      : "Scouts des Cèdres | Saint Jean Marc Group - Byblos",
    description: isAr
      ? "الموقع الرسمي لفوج سان جان مارك (كشافة الأرز) في جبيل، لبنان. انضم إلينا اليوم لخوض المغامرة الكشفية وبناء قادة الغد."
      : "Official website of the Saint Jean Marc Group (Scouts des Cèdres) in Byblos, Lebanon. Join us today for outdoor adventures, community service, and character development.",
    keywords: isAr
      ? ["كشافة الأرز", "فوج سان جان مارك", "كشافة جبيل", "كشافة لبنان", "كشافة مار يوحنا مرقس", "نشاطات كشفية"]
      : ["Scouts des Cèdres", "Saint Jean Marc Group", "Scouts Byblos", "Scouts Lebanon", "St John Mark", "Scouting Jbeil"],
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={direction}
      className={`${outfit.variable} ${cairo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-scout-beige text-scout-charcoal">
        {children}
      </body>
    </html>
  );
}
