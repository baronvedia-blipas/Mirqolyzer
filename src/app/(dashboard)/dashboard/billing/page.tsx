"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { PLANS, getPlanLimits } from "@/lib/stripe/plans";
import type { Plan, Profile } from "@/types/user";

export default function BillingPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const supabase = createClient();

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

  return (
    <div className="max-w-4xl space-y-6">
      <h2 className="text-2xl font-bold">Billing</h2>
      <Card>
        <CardHeader><CardTitle className="text-lg">Current Plan</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold capitalize">{profile.plan}</p>
            <p className="text-sm text-muted-foreground">{profile.invoice_count_this_month} / {currentLimits.invoices_per_month} invoices used this month</p>
          </div>
          {profile.stripe_customer_id && <Button variant="outline" onClick={handleManage} disabled={loading === "manage"}>{loading === "manage" ? "Loading..." : "Manage Subscription"}</Button>}
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => (
          <Card key={plan.plan} className={plan.plan === profile.plan ? "border-primary" : ""}>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-base">{plan.name}</CardTitle>
              <div><span className="text-3xl font-bold">${plan.price}</span>{plan.price > 0 && <span className="text-muted-foreground text-sm">/mo</span>}</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-1.5 text-sm">{plan.features.map((f) => (<li key={f} className="flex items-center gap-2"><Check className="h-3 w-3 text-success" />{f}</li>))}</ul>
              {plan.plan === profile.plan ? (
                <Badge className="w-full justify-center">Current Plan</Badge>
              ) : plan.price > 0 ? (
                <Button className="w-full" onClick={() => handleUpgrade(plan.plan)} disabled={loading === plan.plan}>{loading === plan.plan ? "Loading..." : "Upgrade"}</Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
