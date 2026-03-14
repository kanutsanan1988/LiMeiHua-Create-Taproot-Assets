/**
 * ชุดซอฟต์แวร์ชุดนี้ มีไว้เพื่อเป็นโครงสร้างพื้นฐานทางการเงินยุคใหม่
 * เพื่อรองรับการไหลของเงินจำนวนมหาศาลของท่านผู้เฒ่าหลี่เหมยฮัว หรือ LiMeiHua Grand Mother
 * และ source code นี้สร้างโดย Mr.Kanutsanan Pongpanna (นายคณัสนันท์ พงษ์พันนา)
 * URL: https://chatgpt.com/g/g-68d289535dec81919445deb9830f2d8e-kanutsanan-pongpanna
 *
 * Language Context Provider - manages i18n state across the application
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import {
  type LangCode,
  type TranslationKeys,
  detectLanguage,
  setLanguage as setStoredLanguage,
  t as translate,
  SUPPORTED_LANGUAGES,
} from "@/lib/i18n";

interface LanguageContextType {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: (key: keyof TranslationKeys) => string;
  languages: typeof SUPPORTED_LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(detectLanguage);

  const setLang = useCallback((newLang: LangCode) => {
    setStoredLanguage(newLang);
    setLangState(newLang);
    document.documentElement.lang = newLang;
    // Set RTL for Arabic and Hebrew
    if (newLang === "ar" || newLang === "he") {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
    }
  }, []);

  const t = useCallback(
    (key: keyof TranslationKeys) => translate(key, lang),
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, languages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
