"use client";

import { Upload, Search, CheckCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

const STEPS = [
  {
    number: "01",
    icon: Upload,
    titleKey: "howItWorks.step1Title" as const,
    descKey: "howItWorks.step1Desc" as const,
    gradient: "from-brand-500 to-brand-300",
  },
  {
    number: "02",
    icon: Search,
    titleKey: "howItWorks.step2Title" as const,
    descKey: "howItWorks.step2Desc" as const,
    gradient: "from-emerald-500 to-emerald-300",
  },
  {
    number: "03",
    icon: CheckCircle,
    titleKey: "howItWorks.step3Title" as const,
    descKey: "howItWorks.step3Desc" as const,
    gradient: "from-violet-500 to-violet-300",
  },
];

export function HowItWorks() {
  const { t } = useLanguage();

  return (
    <section className="py-20 lg:py-28 relative">
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {t("howItWorks.title" as any)}
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-brand-500 to-success mx-auto rounded-full" />
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Dotted connector line (desktop only) */}
          <div
            className="hidden md:block absolute top-28 left-[20%] right-[20%] h-px border-t-2 border-dashed border-brand-500/25"
            aria-hidden="true"
          />

          {STEPS.map(({ number, icon: Icon, titleKey, descKey, gradient }, index) => (
            <div
              key={titleKey}
              className="relative glass rounded-xl p-8 text-center hover-lift animate-fade-in-up opacity-0"
              style={{ animationDelay: `${0.15 + index * 0.15}s` }}
            >
              {/* Large gradient number */}
              <span
                className="block text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-br from-brand-500 to-brand-300 select-none"
              >
                {number}
              </span>

              {/* Icon */}
              <div
                className={`inline-flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br ${gradient} text-white mb-5 shadow-lg shadow-brand-900/10`}
              >
                <Icon className="h-7 w-7" />
              </div>

              {/* Title */}
              <h3 className="font-semibold text-lg mb-2">
                {t(titleKey as any)}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(descKey as any)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
