import en from "@/messages/en.json";
import ar from "@/messages/ar.json";

export type Dictionary = typeof en;

export function getDictionary(locale: string): Dictionary {
  return locale === "ar" ? (ar as Dictionary) : en;
}
