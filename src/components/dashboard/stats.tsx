"use client";

import { FileText, CheckCircle, Clock } from "lucide-react";
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
    { label: t("dashboard.totalInvoices"), value: total, icon: FileText, color: "text-primary" },
    { label: t("dashboard.completed"), value: completed, icon: CheckCircle, color: "text-success" },
    { label: t("dashboard.processing"), value: processing, icon: Clock, color: "text-warning" },
    { label: t("dashboard.totalValue"), value: formatCurrency(totalAmount, currency), icon: FileText, color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map(({ label, value, icon: Icon, color }) => (
        <Card key={label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-muted ${color}`}><Icon className="h-4 w-4" /></div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-semibold">{value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
