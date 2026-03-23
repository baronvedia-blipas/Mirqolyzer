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
    <aside className="hidden lg:flex lg:flex-col lg:w-64 h-screen sticky top-0 bg-gradient-to-b from-[hsl(var(--primary)/0.03)] to-[hsl(var(--primary)/0.08)] border-r border-border/50 backdrop-blur-sm">
      {/* Logo area */}
      <div className="p-6 pb-5">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-primary to-primary/60 transition-all duration-200 group-hover:h-9" />
          <div className="text-xl tracking-tight">
            <span className="font-bold text-foreground">Mirqo</span>
            <span className="font-light text-muted-foreground">lyzer</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ href, labelKey, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                isActive
                  ? "bg-primary/10 text-primary font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              )}
            >
              {/* Active accent bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
              )}
              <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
              <span>{t(labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 mx-3 mb-3 rounded-lg border border-border/50 bg-card/50">
        {/* Plan badge */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground">{t("common.invoicesThisMonth")}</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            {profile.plan} {t("common.plan")}
          </span>
        </div>

        {/* Usage count */}
        <div className="text-sm font-semibold text-foreground mb-2">
          {profile.invoice_count_this_month}{" "}
          <span className="text-muted-foreground font-normal">/ {limits.invoices_per_month}</span>
        </div>

        {/* Progress bar with gradient */}
        <div className="h-2 bg-muted/80 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              usagePercent >= 90
                ? "bg-gradient-to-r from-destructive/80 to-destructive"
                : usagePercent >= 70
                ? "bg-gradient-to-r from-warning/80 to-warning"
                : "bg-gradient-to-r from-primary/70 to-primary"
            )}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>
    </aside>
  );
}
