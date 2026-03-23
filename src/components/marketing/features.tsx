"use client";

import { FileSearch, Edit3, Download, Shield, Brain, Copy } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import type { LucideIcon } from "lucide-react";

const FEATURES: { icon: LucideIcon; titleKey: string; descKey: string; gradient: string }[] = [
  { icon: FileSearch, titleKey: "features.smartOcr", descKey: "features.smartOcrDesc", gradient: "from-brand-500 to-brand-300" },
  { icon: Edit3, titleKey: "features.editableFields", descKey: "features.editableFieldsDesc", gradient: "from-emerald-500 to-emerald-300" },
  { icon: Brain, titleKey: "features.patternLearning", descKey: "features.patternLearningDesc", gradient: "from-violet-500 to-violet-300" },
  { icon: Copy, titleKey: "features.duplicateDetection", descKey: "features.duplicateDetectionDesc", gradient: "from-amber-500 to-amber-300" },
  { icon: Download, titleKey: "features.export", descKey: "features.exportDesc", gradient: "from-sky-500 to-sky-300" },
  { icon: Shield, titleKey: "features.secure", descKey: "features.secureDesc", gradient: "from-rose-500 to-rose-300" },
];

export function Features() {
  const { t } = useLanguage();

  return (
    <section className="py-20 lg:py-28 relative">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-muted/30" />
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {t("features.title")}
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-brand-500 to-success mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {FEATURES.map(({ icon: Icon, titleKey, descKey, gradient }, index) => (
            <div
              key={titleKey}
              className="group glass rounded-xl p-6 hover-lift cursor-default animate-fade-in-up opacity-0"
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} text-white mb-5 shadow-lg shadow-brand-900/10 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2 group-hover:text-brand-500 transition-colors">
                {t(titleKey as any)}
              </h3>
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
