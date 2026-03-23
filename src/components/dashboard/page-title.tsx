"use client";

import { useLanguage } from "@/lib/i18n/context";

export function DashboardTitle() {
  const { t } = useLanguage();
  return <h2 className="text-2xl font-bold">{t("dashboard.title")}</h2>;
}
