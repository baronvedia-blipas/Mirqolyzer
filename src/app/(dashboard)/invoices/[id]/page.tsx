import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExtractionView } from "@/components/invoices/extraction-view";
import { formatDate } from "@/lib/utils/date-helpers";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteInvoiceButton } from "@/components/invoices/delete-invoice-button";
import { CategorySelector } from "@/components/invoices/category-selector";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: invoice } = await supabase.from("invoices").select("*").eq("id", id).eq("user_id", user.id).single();
  if (!invoice) notFound();

  const { data: signedUrl } = await supabase.storage.from("invoices").createSignedUrl(invoice.file_url, 3600);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div>
            <h2 className="text-xl font-bold">{invoice.vendor_name || invoice.file_name}</h2>
            <p className="text-sm text-muted-foreground">Uploaded {formatDate(invoice.created_at)}{invoice.invoice_number && ` · #${invoice.invoice_number}`}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={invoice.status === "completed" ? "default" : "secondary"}>{invoice.status}</Badge>
          <DeleteInvoiceButton invoiceId={invoice.id} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Original Document</CardTitle></CardHeader>
          <CardContent>
            {signedUrl?.signedUrl ? (
              invoice.file_name.toLowerCase().endsWith(".pdf") ? (
                <iframe src={signedUrl.signedUrl} className="w-full h-[600px] rounded border" title="Invoice PDF" />
              ) : (
                <img src={signedUrl.signedUrl} alt="Invoice" className="w-full rounded border object-contain max-h-[600px]" />
              )
            ) : (
              <p className="text-muted-foreground text-sm">Document preview not available</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Extracted Data</CardTitle>
            {invoice.confidence_score != null && <p className="text-xs text-muted-foreground">Overall confidence: {Math.round(invoice.confidence_score * 100)}%</p>}
          </CardHeader>
          <CardContent><ExtractionView invoice={invoice} /></CardContent>
        </Card>
      </div>
      <CategorySelector
        invoiceId={invoice.id}
        currentCategory={invoice.category}
        vendorName={invoice.vendor_name}
      />
    </div>
  );
}
