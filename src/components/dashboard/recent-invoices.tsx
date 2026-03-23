import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatRelativeDate } from "@/lib/utils/date-helpers";
import type { Invoice } from "@/types/invoice";

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  completed: { bg: "bg-success/10", text: "text-success", dot: "bg-success" },
  processing: { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning" },
  failed: { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive" },
  uploading: { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" },
};

export function RecentInvoices({ invoices }: { invoices: Invoice[] }) {
  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 flex flex-col items-center justify-center text-center">
          {/* Simple invoice illustration */}
          <div className="h-16 w-16 rounded-2xl bg-muted/80 flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/60">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No invoices yet</p>
          <p className="text-xs text-muted-foreground max-w-[240px]">
            Upload your first invoice to start extracting data automatically.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold tracking-tight">Recent Invoices</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/50">
          {invoices.map((invoice) => {
            const statusCfg = STATUS_CONFIG[invoice.status] ?? STATUS_CONFIG.uploading;
            return (
              <Link
                key={invoice.id}
                href={`/dashboard/invoices/${invoice.id}`}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-muted/40 transition-colors duration-150 group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground group-hover:text-primary transition-colors duration-150">
                    {invoice.vendor_name || invoice.file_name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {invoice.invoice_number && `#${invoice.invoice_number} · `}
                    {formatRelativeDate(invoice.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  {invoice.total_amount != null && (
                    <span className="text-sm font-semibold tabular-nums text-foreground">
                      {formatCurrency(invoice.total_amount, invoice.currency ?? "USD")}
                    </span>
                  )}
                  <Badge
                    variant="secondary"
                    className={`${statusCfg.bg} ${statusCfg.text} border-0 gap-1.5 px-2.5 py-0.5 text-[11px] font-medium`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                    {invoice.status}
                  </Badge>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
