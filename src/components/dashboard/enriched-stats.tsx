"use client";

import { Clock, Building2, Coins, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeDate } from "@/lib/utils/date-helpers";
import { useLanguage } from "@/lib/i18n/context";

interface Invoice {
  created_at?: string;
  vendor_name?: string | null;
  currency?: string | null;
  confidence_score?: number | null;
}

interface EnrichedStatsProps {
  invoices: Invoice[];
}

export function EnrichedStats({ invoices }: EnrichedStatsProps) {
  const { t } = useLanguage();

  // Last invoice relative time
  const sortedByDate = [...invoices].sort(
    (a, b) =>
      new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
  );
  const lastInvoiceDate = sortedByDate[0]?.created_at;
  const lastInvoiceLabel = lastInvoiceDate
    ? formatRelativeDate(lastInvoiceDate)
    : t("dashboard.noInvoices" as any);

  // Most frequent vendor
  const vendorCounts: Record<string, number> = {};
  for (const inv of invoices) {
    const vendor = inv.vendor_name;
    if (vendor) {
      vendorCounts[vendor] = (vendorCounts[vendor] ?? 0) + 1;
    }
  }
  const frequentVendor =
    Object.entries(vendorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "\u2014";

  // Main currency
  const currencyCounts: Record<string, number> = {};
  for (const inv of invoices) {
    const c = inv.currency ?? "USD";
    currencyCounts[c] = (currencyCounts[c] ?? 0) + 1;
  }
  const mainCurrency =
    Object.entries(currencyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "\u2014";

  // Average confidence
  const withConfidence = invoices.filter(
    (i) => i.confidence_score != null && i.confidence_score > 0
  );
  const avgConfidence =
    withConfidence.length > 0
      ? withConfidence.reduce((sum, i) => sum + (i.confidence_score ?? 0), 0) /
        withConfidence.length
      : 0;
  const avgConfidencePercent = Math.round(avgConfidence * 100);

  function getConfidenceColor(score: number) {
    if (score >= 70) return "text-success";
    if (score >= 40) return "text-warning";
    return "text-destructive";
  }

  const items = [
    {
      label: t("dashboard.lastInvoice" as any),
      value: lastInvoiceLabel,
      icon: Clock,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: t("dashboard.frequentVendor" as any),
      value: frequentVendor,
      icon: Building2,
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
    },
    {
      label: t("dashboard.mainCurrency" as any),
      value: invoices.length > 0 ? mainCurrency : "\u2014",
      icon: Coins,
      iconBg: "bg-success/10",
      iconColor: "text-success",
    },
    {
      label: t("dashboard.avgConfidence" as any),
      value:
        withConfidence.length > 0
          ? `${avgConfidencePercent}%`
          : "\u2014",
      icon: ShieldCheck,
      iconBg: "bg-primary/10",
      iconColor:
        withConfidence.length > 0
          ? getConfidenceColor(avgConfidencePercent)
          : "text-muted-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
        <Card
          key={label}
          className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${iconBg} shrink-0`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-muted-foreground tracking-wide truncate">
                  {label}
                </p>
                <p className="text-sm font-semibold text-foreground truncate" title={String(value)}>
                  {value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
