"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/user";
import { getPlanLimits } from "@/lib/stripe/plans";
import { useLanguage } from "@/lib/i18n/context";

const NAV_ITEMS = [
  { href: "/dashboard", labelKey: "nav.dashboard" as const, icon: LayoutDashboard },
  { href: "/dashboard/settings", labelKey: "nav.settings" as const, icon: Settings },
  { href: "/dashboard/billing", labelKey: "nav.billing" as const, icon: CreditCard },
];

export function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const limits = getPlanLimits(profile.plan);
  const usagePercent = Math.min(100, (profile.invoice_count_this_month / limits.invoices_per_month) * 100);
  const { t } = useLanguage();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r border-border bg-card h-screen sticky top-0">
      <div className="p-6 border-b border-border">
        <Link href="/dashboard" className="text-xl">
          <span className="font-bold text-foreground">Mirqo</span>
          <span className="font-light text-muted-foreground">lyzer</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ href, labelKey, icon: Icon }) => (
          <Link key={href} href={href} className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
            pathname === href ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}>
            <Icon className="h-4 w-4" />{t(labelKey)}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground mb-2">{profile.invoice_count_this_month} / {limits.invoices_per_month} {t("common.invoicesThisMonth")}</div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full transition-all", usagePercent >= 90 ? "bg-destructive" : usagePercent >= 70 ? "bg-warning" : "bg-success")} style={{ width: `${usagePercent}%` }} />
        </div>
        <div className="mt-2 text-xs text-muted-foreground capitalize">{profile.plan} {t("common.plan")}</div>
      </div>
    </aside>
  );
}
