"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Zap, Shield } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 animate-gradient opacity-30 dark:opacity-20"
        style={{
          background: "linear-gradient(135deg, #0a1929, #1e3a5f, #2a4a7a, #132844, #0a1929)",
          backgroundSize: "400% 400%",
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Floating blobs */}
      <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-brand-500/10 blur-[100px] animate-float" />
      <div className="absolute bottom-20 right-[10%] w-96 h-96 rounded-full bg-brand-400/8 blur-[120px] animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-600/5 blur-[150px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center py-20 lg:py-32">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/30 bg-brand-900/20 text-brand-300 text-xs font-medium mb-8 animate-fade-in-up opacity-0"
          style={{ animationDelay: "0.1s" }}
        >
          <Zap className="h-3 w-3" />
          {t("hero.badge")}
        </div>

        {/* Heading */}
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up opacity-0"
          style={{ animationDelay: "0.2s" }}
        >
          {t("hero.title")}{" "}
          <span className="gradient-text">{t("hero.titleAccent")}</span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up opacity-0"
          style={{ animationDelay: "0.35s" }}
        >
          {t("hero.subtitle")}
        </p>

        {/* CTA buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up opacity-0"
          style={{ animationDelay: "0.5s" }}
        >
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-gradient-to-r from-brand-700 to-brand-500 hover:from-brand-600 hover:to-brand-400 text-white text-base px-10 py-6 shadow-lg shadow-brand-900/30 transition-all duration-300 hover:shadow-xl hover:shadow-brand-800/30 hover:-translate-y-0.5"
            >
              {t("hero.startFree")}
            </Button>
          </Link>
          <Link href="/pricing">
            <Button
              size="lg"
              variant="outline"
              className="text-base px-10 py-6 border-border/60 hover:bg-accent/50 transition-all duration-300"
            >
              {t("hero.viewPricing")}
            </Button>
          </Link>
        </div>

        {/* Social proof */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 animate-fade-in-up opacity-0"
          style={{ animationDelay: "0.65s" }}
        >
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center justify-center h-9 w-9 rounded-full bg-brand-500/10 text-brand-400">
              <FileText className="h-4 w-4" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-foreground">10,000+</div>
              <div className="text-xs text-muted-foreground">{t("hero.freeInvoices")}</div>
            </div>
          </div>
          <div className="hidden sm:block h-8 w-px bg-border/50" />
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center justify-center h-9 w-9 rounded-full bg-success/10 text-success">
              <Shield className="h-4 w-4" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-foreground">99.9%</div>
              <div className="text-xs text-muted-foreground">{t("hero.security")}</div>
            </div>
          </div>
          <div className="hidden sm:block h-8 w-px bg-border/50" />
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center justify-center h-9 w-9 rounded-full bg-brand-400/10 text-brand-400">
              <Zap className="h-4 w-4" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-foreground">500+</div>
              <div className="text-xs text-muted-foreground">{t("hero.noSetup")}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
