"use client";

import { useLanguage } from "@/lib/i18n/context";

export function WelcomeBanner({ name }: { name: string }) {
  const { t } = useLanguage();

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-6">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-primary/5 rounded-full translate-y-1/2 blur-2xl pointer-events-none" />

      <div className="relative">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          {t("dashboard.welcome" as any)}, {name}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("dashboard.welcomeSubtitle" as any)}
        </p>
      </div>
    </div>
  );
}
