import { FileText, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format-currency";

interface StatsProps {
  total: number;
  completed: number;
  processing: number;
  failed: number;
  totalAmount: number;
  currency: string;
}

export function Stats({ total, completed, processing, totalAmount, currency }: StatsProps) {
  const items = [
    { label: "Total Invoices", value: total, icon: FileText, color: "text-primary" },
    { label: "Completed", value: completed, icon: CheckCircle, color: "text-success" },
    { label: "Processing", value: processing, icon: Clock, color: "text-warning" },
    { label: "Total Value", value: formatCurrency(totalAmount, currency), icon: FileText, color: "text-primary" },
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
