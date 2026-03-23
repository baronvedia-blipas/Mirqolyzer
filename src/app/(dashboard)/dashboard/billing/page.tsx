"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Crown, Zap, Building2, ArrowRight, Sparkles } from "lucide-react";
import { PLANS, getPlanLimits } from "@/lib/stripe/plans";
import type { Plan, Profile } from "@/types/user";
import { useLanguage } from "@/lib/i18n/context";

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free: <Zap className="h-5 w-5" />,
  pro: <Crown className="h-5 w-5" />,
  business: <Building2 className="h-5 w-5" />,
};

const PLAN_GRADIENTS: Record<string, string> = {
  free: "from-slate-500 to-slate-600",
  pro: "from-brand-600 to-brand-500",
  business: "from-purple-600 to-indigo-500",
};

export default function BillingPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const supabase = createClient();
  const { t } = useLanguage();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) setProfile(data as Profile);
    }
    load();
  }, [supabase]);

  async function handleUpgrade(plan: Plan) {
    setLoading(plan);
    const res = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan }) });
    const { url } = await res.json();
    if (url) window.location.href = url;
    setLoading(null);
  }

  async function handleManage() {
    setLoading("manage");
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
    setLoading(null);
  }

  if (!profile) return null;
  const currentLimits = getPlanLimits(profile.plan);
  const usagePercent = Math.min(100, (profile.invoice_count_this_month / currentLimits.invoices_per_month) * 100);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("billing.title")}</h2>
        <p className="text-muted-foreground mt-1">Administra tu plan y suscripción</p>
      </div>

      {/* Current plan card */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className={`bg-gradient-to-r ${PLAN_GRADIENTS[profile.plan]} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                {PLAN_ICONS[profile.plan]}
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">{t("billing.currentPlan")}</p>
                <p className="text-2xl font-bold capitalize">{profile.plan}</p>
              </div>
            </div>
            {profile.stripe_customer_id && (
              <Button
                variant="outline"
                onClick={handleManage}
                disabled={loading === "manage"}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
              >
                {loading === "manage" ? t("billing.loading") : t("billing.manageSubscription")}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Uso mensual</span>
            <span className="text-sm text-muted-foreground">
              {profile.invoice_count_this_month} / {currentLimits.invoices_per_month} {t("billing.invoicesUsed")}
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usagePercent >= 90 ? "bg-red-500" : usagePercent >= 70 ? "bg-yellow-500" : "bg-gradient-to-r from-brand-600 to-success"
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          {usagePercent >= 80 && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Estás cerca del límite. Considera mejorar tu plan.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Plans grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Planes disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => {
            const isCurrent = plan.plan === profile.plan;
            const isPopular = plan.popular;

            return (
              <Card
                key={plan.plan}
                className={`relative overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                  isCurrent ? "border-brand-500 shadow-lg shadow-brand-500/10" :
                  isPopular ? "border-brand-400/50" : "border-border/50"
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-l from-brand-600 to-brand-500 text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                      Popular
                    </div>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-600 to-success" />
                )}

                <CardContent className="p-6 pt-8">
                  <div className="text-center mb-6">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${PLAN_GRADIENTS[plan.plan]} text-white mb-3`}>
                      {PLAN_ICONS[plan.plan]}
                    </div>
                    <h4 className="font-semibold text-lg">{plan.name}</h4>
                    <div className="mt-2">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      {plan.price > 0 && <span className="text-muted-foreground text-sm">/mes</span>}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <div className="mt-0.5 h-4 w-4 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                          <Check className="h-2.5 w-2.5 text-success" />
                        </div>
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <div className="w-full py-2.5 rounded-lg bg-brand-800/10 text-brand-600 dark:text-brand-400 text-sm font-medium text-center">
                      {t("pricing.currentPlan")}
                    </div>
                  ) : plan.price > 0 ? (
                    <Button
                      className={`w-full h-11 ${
                        isPopular
                          ? "bg-gradient-to-r from-brand-700 to-brand-500 hover:from-brand-600 hover:to-brand-400 text-white shadow-md"
                          : ""
                      }`}
                      variant={isPopular ? "default" : "outline"}
                      onClick={() => handleUpgrade(plan.plan)}
                      disabled={loading === plan.plan}
                    >
                      {loading === plan.plan ? t("billing.loading") : t("billing.upgrade")}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
