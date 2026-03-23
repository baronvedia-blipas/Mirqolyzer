import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils/format-currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, TrendingUp, Calendar, Upload } from "lucide-react";
import Link from "next/link";

interface VendorSummary {
  name: string;
  invoiceCount: number;
  totalAmount: number;
  currency: string;
  lastInvoiceDate: string | null;
}

export default async function VendorsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  const all = invoices ?? [];

  // Group by vendor
  const vendorMap = new Map<string, VendorSummary>();

  for (const inv of all) {
    const name = inv.vendor_name || "Sin nombre";
    const existing = vendorMap.get(name);

    if (existing) {
      existing.invoiceCount += 1;
      existing.totalAmount += inv.total_amount ?? 0;
      // Track most common currency
      const c = inv.currency ?? "USD";
      if (c !== existing.currency) {
        // Keep whichever appears more (simple: keep existing)
      }
      // Track most recent date
      const date = inv.invoice_date ?? inv.created_at;
      if (date && (!existing.lastInvoiceDate || date > existing.lastInvoiceDate)) {
        existing.lastInvoiceDate = date;
      }
    } else {
      vendorMap.set(name, {
        name,
        invoiceCount: 1,
        totalAmount: inv.total_amount ?? 0,
        currency: inv.currency ?? "USD",
        lastInvoiceDate: inv.invoice_date ?? inv.created_at ?? null,
      });
    }
  }

  // Sort by total spend descending
  const vendors = Array.from(vendorMap.values()).sort(
    (a, b) => b.totalAmount - a.totalAmount
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Proveedores</h1>
      </div>

      {vendors.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">
              Sube facturas para ver tus proveedores
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {/* Table header */}
          <div className="hidden md:grid md:grid-cols-4 gap-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <span>Proveedor</span>
            <span className="text-center">Facturas</span>
            <span className="text-right">Gasto total</span>
            <span className="text-right">Última factura</span>
          </div>

          {vendors.map((vendor) => (
            <Link
              key={vendor.name}
              href={`/dashboard?q=${encodeURIComponent(vendor.name === "Sin nombre" ? "" : vendor.name)}`}
            >
              <Card className="transition-all duration-150 hover:shadow-md hover:border-primary/30 hover:bg-primary/[0.02] cursor-pointer group">
                <CardContent className="p-4 md:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 items-center">
                    {/* Vendor name */}
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium text-sm truncate">
                        {vendor.name}
                      </span>
                    </div>

                    {/* Invoice count */}
                    <div className="flex items-center gap-2 md:justify-center">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground md:hidden" />
                      <span className="text-sm text-muted-foreground">
                        {vendor.invoiceCount}{" "}
                        <span className="md:hidden">facturas</span>
                      </span>
                    </div>

                    {/* Total spend */}
                    <div className="text-sm font-semibold md:text-right">
                      {formatCurrency(vendor.totalAmount, vendor.currency)}
                    </div>

                    {/* Last invoice date */}
                    <div className="flex items-center gap-2 md:justify-end text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 md:hidden" />
                      {vendor.lastInvoiceDate
                        ? new Date(vendor.lastInvoiceDate).toLocaleDateString(
                            "es-ES",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )
                        : "—"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
