"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Zap, Shield } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-700/30 bg-brand-900/20 text-brand-300 text-xs font-medium mb-6"><Zap className="h-3 w-3" /> {t("hero.badge")}</div>
        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">{t("hero.title")}{" "}<span className="text-brand-400">{t("hero.titleAccent")}</span></h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">{t("hero.subtitle")}</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup"><Button size="lg" className="bg-brand-800 hover:bg-brand-700 text-base px-8">{t("hero.startFree")}</Button></Link>
          <Link href="/pricing"><Button size="lg" variant="outline" className="text-base px-8">{t("hero.viewPricing")}</Button></Link>
        </div>
        <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><FileText className="h-4 w-4" /> {t("hero.freeInvoices")}</div>
          <div className="flex items-center gap-2"><Shield className="h-4 w-4" /> {t("hero.security")}</div>
          <div className="flex items-center gap-2"><Zap className="h-4 w-4" /> {t("hero.noSetup")}</div>
        </div>
      </div>
    </section>
  );
}
