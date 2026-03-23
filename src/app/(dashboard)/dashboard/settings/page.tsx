"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/context";

export default function SettingsPage() {
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();
  const { t } = useLanguage();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) { setFullName(data.full_name ?? ""); setCompany(data.company ?? ""); }
    }
    load();
  }, [supabase]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) { await supabase.from("profiles").update({ full_name: fullName, company }).eq("id", user.id); }
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold">{t("settings.title")}</h2>
      <Card>
        <CardHeader><CardTitle className="text-lg">{t("settings.profile")}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="name">{t("settings.fullName")}</Label><Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="company">{t("settings.companyOptional")}</Label><Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} /></div>
            <Button type="submit" disabled={loading}>{loading ? t("settings.saving") : saved ? t("settings.saved") : t("settings.saveChanges")}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
