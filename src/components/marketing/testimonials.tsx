"use client";

import { Star } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

const TESTIMONIALS = [
  {
    quoteKey: "testimonials.quote1" as const,
    name: "María Elena Quispe",
    titleKey: "testimonials.role1" as const,
    company: "Grupo Empresarial Andino",
    initials: "MQ",
    gradientFrom: "from-brand-500",
    gradientTo: "to-brand-300",
  },
  {
    quoteKey: "testimonials.quote2" as const,
    name: "Carlos Mendoza",
    titleKey: "testimonials.role2" as const,
    company: "Importadora del Sur",
    initials: "CM",
    gradientFrom: "from-emerald-500",
    gradientTo: "to-emerald-300",
  },
  {
    quoteKey: "testimonials.quote3" as const,
    name: "Ana Lucía Vargas",
    titleKey: "testimonials.role3" as const,
    company: "TechBol Solutions",
    initials: "AV",
    gradientFrom: "from-violet-500",
    gradientTo: "to-violet-300",
  },
];

export function Testimonials() {
  const { t } = useLanguage();

  return (
    <section className="py-20 lg:py-28 relative">
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            {t("testimonials.title" as any)}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t("testimonials.subtitle" as any)}
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-brand-500 to-success mx-auto rounded-full mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(
            ({ quoteKey, name, titleKey, company, initials, gradientFrom, gradientTo }, index) => (
              <div
                key={name}
                className="glass rounded-xl p-7 border border-border/40 hover:-translate-y-1 transition-transform duration-300 animate-fade-in-up opacity-0"
                style={{ animationDelay: `${0.1 + index * 0.12}s` }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm leading-relaxed text-foreground/90 mb-6 italic">
                  &ldquo;{t(quoteKey as any)}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br ${gradientFrom} ${gradientTo} text-white text-xs font-bold select-none`}
                  >
                    {initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{name}</div>
                    <div className="text-xs text-muted-foreground">
                      {t(titleKey as any)}, {company}
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
