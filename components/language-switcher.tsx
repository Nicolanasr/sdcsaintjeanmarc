"use client";

import { translations } from "@/lib/translations";

import { useLanguage, type Language } from "./language-provider";

const choices: Language[] = ["en", "ar"];

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();
    const labels = translations[language].layout.languageToggle;

    return (
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-2 py-1 shadow-sm backdrop-blur">
            <div className="flex rounded-full bg-emerald-500/10 p-1">
                {choices.map((choice) => {
                    const isActive = language === choice;
                    const text = choice === "en" ? labels.english : labels.arabic;
                    return (
                        <button
                            key={choice}
                            type="button"
                            onClick={() => setLanguage(choice)}
                            aria-pressed={isActive}
                            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${isActive
                                    ? "bg-emerald-500 text-white shadow-sm"
                                    : "text-emerald-200 hover:text-emerald-100"
                                }`}
                        >
                            {text}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
