"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { PLANS } from "@/lib/stripe/plans";
import { useLanguage } from "@/lib/i18n/context";

export function PricingSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {t("pricing.title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {t("pricing.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {PLANS.map((plan, index) => {
            const isPopular = plan.popular;
            return (
              <div
                key={plan.plan}
                className={`relative group rounded-2xl transition-all duration-300 animate-fade-in-up opacity-0 ${
                  isPopular
                    ? "md:-mt-4 md:mb-[-16px] z-10"
                    : ""
                }`}
                style={{ animationDelay: `${0.1 + index * 0.15}s` }}
              >
                {/* Gradient border for popular */}
                {isPopular && (
                  <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-brand-400 via-brand-500 to-success opacity-70" />
                )}

                <div
                  className={`relative h-full rounded-2xl p-6 lg:p-8 flex flex-col ${
                    isPopular
                      ? "bg-card shadow-2xl shadow-brand-900/20"
                      : "glass hover-lift"
                  }`}
                >
                  {isPopular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-brand-500 text-white border-0 px-4 py-1 shadow-lg">
                      {t("pricing.mostPopular")}
                    </Badge>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold mb-3">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className={`font-bold ${isPopular ? "text-5xl" : "text-4xl"}`}>
                        ${plan.price}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-muted-foreground text-sm">/mo</span>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-border/50 my-4" />

                  <ul className="space-y-3 flex-1 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm">
                        <div className="flex-shrink-0 mt-0.5 h-5 w-5 rounded-full bg-success/10 flex items-center justify-center">
                          <Check className="h-3 w-3 text-success" />
                        </div>
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/signup" className="block">
                    <Button
                      className={`w-full py-5 transition-all duration-300 ${
                        isPopular
                          ? "bg-gradient-to-r from-brand-700 to-brand-500 hover:from-brand-600 hover:to-brand-400 text-white shadow-lg shadow-brand-900/20 hover:shadow-xl"
                          : "hover:bg-accent/80"
                      }`}
                      variant={isPopular ? "default" : "outline"}
                    >
                      {plan.price === 0 ? t("pricing.startFree") : t("pricing.getStarted")}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
