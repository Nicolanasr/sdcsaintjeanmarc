export type Locale = "en" | "ar";

export type LocalizedString = Record<Locale, string>;

export const locales: Locale[] = ["en", "ar"];

export const pickLocalized = <T>(localized: Record<Locale, T>, locale: Locale): T => localized[locale];
