"use client";

import { translations } from "@/lib/translations";

import { useLanguage } from "./language-provider";

export function SiteFooter() {
  const { language } = useLanguage();
  const layout = translations[language].layout;

  return (
    <footer className="border-t border-emerald-100/60 bg-white/90">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-semibold text-slate-900">
            SDC {layout.groupName}
          </p>
          <p className="text-sm text-slate-600">{layout.footerMission}</p>
        </div>
        <div className="text-sm text-slate-600">
          <p>{layout.footerSchedule}</p>
          <p>{layout.footerContact}</p>
        </div>
      </div>
    </footer>
  );
}
