import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatRelativeDate } from "@/lib/utils/date-helpers";
import type { Invoice } from "@/types/invoice";

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-success/10 text-success",
  processing: "bg-warning/10 text-warning",
  failed: "bg-destructive/10 text-destructive",
  uploading: "bg-muted text-muted-foreground",
};

export function RecentInvoices({ invoices }: { invoices: Invoice[] }) {
  if (invoices.length === 0) {
    return <Card><CardContent className="p-8 text-center text-muted-foreground">No invoices yet. Upload one to get started.</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">Recent Invoices</CardTitle></CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {invoices.map((invoice) => (
            <Link key={invoice.id} href={`/dashboard/invoices/${invoice.id}`} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{invoice.vendor_name || invoice.file_name}</p>
                <p className="text-xs text-muted-foreground">{invoice.invoice_number && `#${invoice.invoice_number} · `}{formatRelativeDate(invoice.created_at)}</p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                {invoice.total_amount != null && <span className="text-sm font-medium">{formatCurrency(invoice.total_amount, invoice.currency ?? "USD")}</span>}
                <Badge variant="secondary" className={STATUS_COLORS[invoice.status]}>{invoice.status}</Badge>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
