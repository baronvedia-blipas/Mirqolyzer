"use client";

import { useLanguage } from "@/lib/i18n/context";

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-full border border-border text-xs font-medium overflow-hidden">
      <button
        onClick={() => setLocale("es")}
        className={`px-2.5 py-1 transition-colors ${
          locale === "es"
            ? "bg-primary text-primary-foreground"
            : "bg-transparent text-muted-foreground hover:text-foreground"
        }`}
      >
        ES
      </button>
      <button
        onClick={() => setLocale("en")}
        className={`px-2.5 py-1 transition-colors ${
          locale === "en"
            ? "bg-primary text-primary-foreground"
            : "bg-transparent text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
    </div>
  );
}
