"use client";

import Image from "next/image";
import Link from "next/link";

import { CTAButton } from "@/components/cta-button";
import { useLanguage } from "@/components/language-provider";
import { translations } from "@/lib/translations";

type LeaderContent = (typeof translations)["en"]["about"]["leadership"]["items"][number];

type LeaderDetailProps = {
  leader: Record<"en" | "ar", LeaderContent>;
};

export function LeaderDetail({ leader }: LeaderDetailProps) {
  const { language } = useLanguage();
  const content = leader[language];

  return (
    <div className="space-y-10 pb-16">
      <Link
        href="/about"
        className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
      >
        {language === "ar" ? "← العودة إلى من نحن" : "← Back to About"}
      </Link>
      <section className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-emerald-100">
            <Image
              src={content.photo}
              alt={content.name}
              fill
              sizes="160px"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-3xl font-semibold text-slate-900">{content.name}</p>
            <p className="text-sm uppercase tracking-[0.4em] text-emerald-600">{content.role}</p>
          </div>
          <p className="text-base leading-relaxed text-slate-600">{content.bio}</p>
        </div>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <CTAButton href="/contact" variant="solid">
            {language === "ar" ? "تواصلوا معه" : "Contact leader"}
          </CTAButton>
          <CTAButton href="/join" variant="ghost">
            {language === "ar" ? "اكتشفوا الفروع" : "Explore sections"}
          </CTAButton>
        </div>
      </section>
    </div>
  );
}
