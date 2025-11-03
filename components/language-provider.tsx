"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Language = "en" | "ar";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

const STORAGE_KEY = "sdcsaintjeanmarc-language";

const applyLanguage = (language: Language) => {
  if (typeof document === "undefined") {
    return;
  }
  const root = document.documentElement;
  root.lang = language === "ar" ? "ar" : "en";
  root.dir = language === "ar" ? "rtl" : "ltr";
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const getStoredLanguage = () => {
    if (typeof window === "undefined") {
      return null;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "ar" || stored === "en" ? (stored as Language) : null;
  };

  const [language, setLanguageState] = useState<Language>(() => {
    return getStoredLanguage() ?? "en";
  });

  useEffect(() => {
    applyLanguage(language);
  }, [language]);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, nextLanguage);
    }
  }, []);

  const toggleLanguage = useCallback(
    () => setLanguage(language === "ar" ? "en" : "ar"),
    [language, setLanguage],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
    }),
    [language, setLanguage, toggleLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
