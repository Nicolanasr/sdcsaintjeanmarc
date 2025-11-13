import { useLanguage } from "@/components/language-provider";
import type { Translations } from "@/lib/translations";
import { translations } from "@/lib/translations";

type PageKey = keyof Translations;

export function usePageContent<K extends PageKey>(key: K): Translations[K] {
	const { language } = useLanguage();
	return translations[language][key];
}

