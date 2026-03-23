"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

const FAQ_ITEMS = [
  { qKey: "faq.q1", aKey: "faq.a1" },
  { qKey: "faq.q2", aKey: "faq.a2" },
  { qKey: "faq.q3", aKey: "faq.a3" },
  { qKey: "faq.q4", aKey: "faq.a4" },
  { qKey: "faq.q5", aKey: "faq.a5" },
  { qKey: "faq.q6", aKey: "faq.a6" },
] as const;

export function FAQ() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {t("faq.title" as any)}
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-brand-500 to-success mx-auto rounded-full" />
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map(({ qKey, aKey }, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={qKey}
                className="glass rounded-xl border border-border/40 overflow-hidden animate-fade-in-up opacity-0"
                style={{ animationDelay: `${0.05 + index * 0.07}s` }}
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="flex items-center justify-between w-full px-6 py-5 text-left gap-4 cursor-pointer"
                >
                  <span className="font-medium text-sm sm:text-base">
                    {t(qKey as any)}
                  </span>
                  {isOpen ? (
                    <Minus className="h-5 w-5 shrink-0 text-brand-500" />
                  ) : (
                    <Plus className="h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                </button>
                <div
                  className="grid transition-all duration-300 ease-in-out"
                  style={{
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                  }}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">
                      {t(aKey as any)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
