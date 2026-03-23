"use client";

import { FileText, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format-currency";
import { useLanguage } from "@/lib/i18n/context";

interface StatsProps {
  total: number;
  completed: number;
  processing: number;
  failed: number;
  totalAmount: number;
  currency: string;
}

export function Stats({ total, completed, processing, totalAmount, currency }: StatsProps) {
  const { t } = useLanguage();

  const items = [
    {
      label: t("dashboard.totalInvoices"),
      value: total,
      icon: FileText,
      accentColor: "bg-primary",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      trend: "+12%",
      trendUp: true,
    },
    {
      label: t("dashboard.completed"),
      value: completed,
      icon: CheckCircle,
      accentColor: "bg-success",
      iconBg: "bg-success/10",
      iconColor: "text-success",
      trend: "+8%",
      trendUp: true,
    },
    {
      label: t("dashboard.processing"),
      value: processing,
      icon: Clock,
      accentColor: "bg-warning",
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
      trend: "-3%",
      trendUp: false,
    },
    {
      label: t("dashboard.totalValue"),
      value: formatCurrency(totalAmount, currency),
      icon: FileText,
      accentColor: "bg-primary",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      trend: "+15%",
      trendUp: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map(({ label, value, icon: Icon, accentColor, iconBg, iconColor, trend, trendUp }) => (
        <Card
          key={label}
          className="relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group"
        >
          {/* Left accent bar */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor}`} />
          <CardContent className="p-4 pl-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground tracking-wide">{label}</p>
                <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
                {/* Trend indicator */}
                <div className="flex items-center gap-1 pt-0.5">
                  <TrendingUp className={`h-3 w-3 ${trendUp ? "text-success" : "text-destructive rotate-180"}`} />
                  <span className={`text-[11px] font-medium ${trendUp ? "text-success" : "text-destructive"}`}>
                    {trend}
                  </span>
                  <span className="text-[11px] text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className={`p-2.5 rounded-xl ${iconBg} transition-transform duration-200 group-hover:scale-110`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
