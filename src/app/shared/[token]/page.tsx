import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const STATUS_BADGE: Record<string, string> = {
  completed: "bg-success/10 text-success border-success/20",
  processing: "bg-warning/10 text-warning border-warning/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
};

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function SharedInvoicePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = getAdminClient();

  // Query invoices where extracted_data contains the share token
  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("*")
    .filter("extracted_data->>_share", "not.is", null);

  if (error || !invoices) {
    return <ExpiredOrInvalidPage />;
  }

  // Find the invoice with the matching share token
  const invoice = invoices.find((inv) => {
    const share = inv.extracted_data?._share;
    return share && share.token === token;
  });

  if (!invoice) {
    return <ExpiredOrInvalidPage />;
  }

  // Check expiration
  const share = invoice.extracted_data?._share;
  if (!share || new Date(share.expires_at) < new Date()) {
    return <ExpiredOrInvalidPage expired />;
  }

  // Generate signed URL for file preview
  const { data: signedUrl } = await supabase.storage
    .from("invoices")
    .createSignedUrl(invoice.file_url, 3600);

  const badgeClass = STATUS_BADGE[invoice.status] ?? "bg-muted text-muted-foreground";

  // Get extracted fields, excluding the internal _share key
  const extractedData = invoice.extracted_data ?? {};
  const fields = Object.entries(extractedData).filter(
    ([key]) => key !== "_share"
  ) as [string, { value: string | number; confidence: number }][];

  const FIELD_LABELS: Record<string, string> = {
    vendor_name: "Proveedor / Vendor",
    invoice_number: "N. Factura / Invoice #",
    date: "Fecha / Date",
    total: "Total",
    subtotal: "Subtotal",
    tax: "Impuesto / Tax",
    currency: "Moneda / Currency",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="gradient-text">Mirqo</span>
            <span className="font-light text-muted-foreground">lyzer</span>
          </Link>
          <Badge variant="secondary" className="text-xs">
            Shared Invoice
          </Badge>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Invoice header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              {invoice.vendor_name || invoice.file_name}
            </h1>
            {invoice.invoice_number && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted font-mono mt-1">
                #{invoice.invoice_number}
              </span>
            )}
          </div>
          <Badge
            variant="secondary"
            className={`${badgeClass} border px-3 py-1 text-xs font-medium capitalize`}
          >
            {invoice.status}
          </Badge>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Document preview */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-sm font-semibold tracking-tight">
                Original Document
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {signedUrl?.signedUrl ? (
                <div className="rounded-lg overflow-hidden border border-border/50 shadow-sm bg-muted/30">
                  {invoice.file_name.toLowerCase().endsWith(".pdf") ? (
                    <iframe
                      src={signedUrl.signedUrl}
                      className="w-full h-[600px]"
                      title="Invoice PDF"
                    />
                  ) : (
                    <img
                      src={signedUrl.signedUrl}
                      alt="Invoice"
                      className="w-full object-contain max-h-[600px]"
                    />
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 rounded-lg border-2 border-dashed border-border/50 bg-muted/20">
                  <p className="text-muted-foreground text-sm">Document preview not available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Extracted data (read-only) */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-sm font-semibold tracking-tight">
                Extracted Data
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {fields.length > 0 ? (
                <div className="space-y-3">
                  {fields.map(([key, field]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 border border-border/30"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {FIELD_LABELS[key] || key}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {field.value != null ? String(field.value) : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No extraction data available.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by{" "}
            <Link href="/" className="font-semibold text-foreground hover:underline">
              Mirqolyzer
            </Link>
          </p>
          <Link
            href="/signup"
            className="text-sm font-medium text-brand-500 hover:text-brand-400 transition-colors"
          >
            Create your free account &rarr;
          </Link>
        </div>
      </footer>
    </div>
  );
}

function ExpiredOrInvalidPage({ expired = false }: { expired?: boolean }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-card">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="gradient-text">Mirqo</span>
            <span className="font-light text-muted-foreground">lyzer</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-destructive"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-foreground">
            {expired
              ? "Este enlace ha expirado"
              : "Enlace no válido"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {expired
              ? "This share link has expired. Please request a new one from the invoice owner."
              : "This share link is invalid or does not exist."}
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-6 py-2 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-400 transition-colors"
          >
            Go to Mirqolyzer
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by{" "}
            <Link href="/" className="font-semibold text-foreground hover:underline">
              Mirqolyzer
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
