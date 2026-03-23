"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/context";
import { User, Building2, Mail, Shield, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();
  const { t } = useLanguage();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");
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
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h2>
        <p className="text-muted-foreground mt-1">Administra tu perfil y preferencias</p>
      </div>

      {/* Profile section */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="h-24 bg-gradient-to-r from-brand-800 via-brand-700 to-brand-600 relative">
          <div className="absolute -bottom-10 left-8">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-2xl font-bold shadow-xl border-4 border-background">
              {fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "U"}
            </div>
          </div>
        </div>
        <CardContent className="pt-14 pb-8 px-8">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  {t("settings.fullName")}
                </Label>
                <Input
                  id="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-11 bg-muted/50 border-border/50 focus:bg-background transition-colors"
                  placeholder="Tu nombre completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  {t("settings.companyOptional")}
                </Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="h-11 bg-muted/50 border-border/50 focus:bg-background transition-colors"
                  placeholder="Nombre de tu empresa"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Correo electrónico
              </Label>
              <Input
                value={email}
                disabled
                className="h-11 bg-muted/30 text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">El correo no se puede cambiar</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-brand-700 to-brand-600 hover:from-brand-600 hover:to-brand-500 text-white px-8 h-11 shadow-md"
              >
                {saved && <CheckCircle2 className="h-4 w-4 mr-2" />}
                {loading ? t("settings.saving") : saved ? t("settings.saved") : t("settings.saveChanges")}
              </Button>
              {saved && <span className="text-sm text-success animate-fade-in-up">Cambios guardados</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security section */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-brand-800/10">
              <Shield className="h-6 w-6 text-brand-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Seguridad</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tu cuenta está protegida con autenticación segura via Supabase Auth.
                {email && ` Sesión activa como ${email}.`}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="h-2 w-2 rounded-full bg-success" />
                <span className="text-xs text-success font-medium">Sesión activa y segura</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
