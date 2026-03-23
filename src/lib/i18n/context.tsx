"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import es from "./translations/es";
import en from "./translations/en";

type TranslationKey = keyof typeof es;
type Locale = "es" | "en";

const translations: Record<Locale, Record<string, string>> = { es, en };

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "mirqolyzer-locale";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && (stored === "es" || stored === "en")) {
      setLocaleState(stored);
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[locale][key] ?? key;
    },
    [locale]
  );

  // Avoid hydration mismatch: render with default locale until mounted
  const value: LanguageContextValue = {
    locale: mounted ? locale : "es",
    setLocale,
    t: mounted ? t : (key: TranslationKey) => translations["es"][key] ?? key,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// Fallback for when component renders outside provider (e.g., during SSR/error boundaries)
const fallbackValue: LanguageContextValue = {
  locale: "es",
  setLocale: () => {},
  t: (key: TranslationKey) => translations["es"][key] ?? key,
};

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  return ctx ?? fallbackValue;
}
