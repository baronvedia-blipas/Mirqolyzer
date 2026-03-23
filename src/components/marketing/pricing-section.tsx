"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { PLANS } from "@/lib/stripe/plans";
import { useLanguage } from "@/lib/i18n/context";

export function PricingSection() {
  const { t } = useLanguage();

  return (
    <section className="py-16">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">{t("pricing.title")}</h2>
        <p className="text-muted-foreground text-center mb-12">{t("pricing.subtitle")}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <Card key={plan.plan} className={plan.popular ? "border-brand-400 shadow-lg shadow-brand-400/10 relative" : ""}>
              {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-800">{t("pricing.mostPopular")}</Badge>}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="mt-2"><span className="text-4xl font-bold">${plan.price}</span>{plan.price > 0 && <span className="text-muted-foreground">/mo</span>}</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (<li key={feature} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-success flex-shrink-0" />{feature}</li>))}
                </ul>
                <Link href="/signup" className="block"><Button className="w-full" variant={plan.popular ? "default" : "outline"}>{plan.price === 0 ? t("pricing.startFree") : t("pricing.getStarted")}</Button></Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
