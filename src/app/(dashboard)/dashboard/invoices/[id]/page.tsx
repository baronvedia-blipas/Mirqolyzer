import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExtractionView } from "@/components/invoices/extraction-view";
import { formatDate } from "@/lib/utils/date-helpers";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteInvoiceButton } from "@/components/invoices/delete-invoice-button";
import { ShareButton } from "@/components/invoices/share-button";
import { CategorySelector } from "@/components/invoices/category-selector";
import { EditHistory } from "@/components/invoices/edit-history";
import { TranslatedCardTitle, ConfidenceLabel } from "@/components/invoices/invoice-detail-cards";

const STATUS_BADGE: Record<string, string> = {
  completed: "bg-success/10 text-success border-success/20",
  processing: "bg-warning/10 text-warning border-warning/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
};

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: invoice, error: invoiceError } = await supabase.from("invoices").select("*").eq("id", id).eq("user_id", user.id).single();
  if (invoiceError || !invoice) notFound();

  const { data: signedUrl } = await supabase.storage.from("invoices").createSignedUrl(invoice.file_url, 3600);

  const badgeClass = STATUS_BADGE[invoice.status] ?? "bg-muted text-muted-foreground";

  return (
    <div className="space-y-6">
      {/* Breadcrumb navigation */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground transition-colors duration-150">
          Dashboard
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium truncate max-w-[200px]">
          {invoice.vendor_name || invoice.file_name}
        </span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/dashboard">
            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 rounded-lg">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              {invoice.vendor_name || invoice.file_name}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Uploaded {formatDate(invoice.created_at)}
              {invoice.invoice_number && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted font-mono">
                  #{invoice.invoice_number}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant="secondary"
            className={`${badgeClass} border px-3 py-1 text-xs font-medium capitalize`}
          >
            {invoice.status}
          </Badge>
          <ShareButton invoiceId={invoice.id} />
          <DeleteInvoiceButton invoiceId={invoice.id} />
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document preview */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-sm font-semibold tracking-tight">
              <TranslatedCardTitle translationKey="invoice.originalDocument" />
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

        {/* Extracted data */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold tracking-tight">
                <TranslatedCardTitle translationKey="invoice.extractedData" />
              </CardTitle>
              {invoice.confidence_score != null && (
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        invoice.confidence_score >= 0.7
                          ? "bg-success"
                          : invoice.confidence_score >= 0.4
                          ? "bg-warning"
                          : "bg-destructive"
                      }`}
                      style={{ width: `${Math.round(invoice.confidence_score * 100)}%` }}
                    />
                  </div>
                  <ConfidenceLabel score={invoice.confidence_score} />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <ExtractionView invoice={invoice} />
          </CardContent>
        </Card>
      </div>

      {/* Edit history */}
      <EditHistory extractedData={invoice.extracted_data} />

      {/* Category selector */}
      <CategorySelector
        invoiceId={invoice.id}
        currentCategory={invoice.category}
        vendorName={invoice.vendor_name}
      />
    </div>
  );
}
