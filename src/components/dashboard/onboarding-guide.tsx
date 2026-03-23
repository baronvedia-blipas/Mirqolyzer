"use client";

import { Upload, ScanSearch, CheckCircle, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

interface OnboardingGuideProps {
  show: boolean;
}

export function OnboardingGuide({ show }: OnboardingGuideProps) {
  const { t } = useLanguage();

  if (!show) return null;

  const steps = [
    {
      icon: Upload,
      label: t("onboarding.step1" as any),
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: ScanSearch,
      label: t("onboarding.step2" as any),
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      icon: CheckCircle,
      label: t("onboarding.step3" as any),
      color: "text-success",
      bg: "bg-success/10",
    },
  ];

  function handleScrollToUpload() {
    const uploadSection = document.querySelector("[data-upload-tabs]");
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/15 animate-fade-in-up">
      {/* Decorative gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

      {/* Glassmorphism card */}
      <div className="glass relative p-8 md:p-10">
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
            {t("onboarding.title" as any)}
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            {t("onboarding.subtitle" as any)}
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center space-y-3 hover-lift transition-transform duration-200"
            >
              <div className="relative">
                <div className={`p-4 rounded-2xl ${step.bg}`}>
                  <step.icon className={`h-7 w-7 ${step.color}`} />
                </div>
                <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground leading-snug max-w-[200px]">
                {step.label}
              </p>
              {index < steps.length - 1 && (
                <ArrowRight className="hidden md:block absolute text-muted-foreground/30 h-5 w-5" />
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={handleScrollToUpload}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors duration-200 shadow-lg shadow-primary/20"
          >
            <Upload className="h-4 w-4" />
            {t("onboarding.cta" as any)}
          </button>
        </div>
      </div>
    </div>
  );
}
