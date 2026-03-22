import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Zap, Shield } from "lucide-react";

export function Hero() {
  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-700/30 bg-brand-900/20 text-brand-300 text-xs font-medium mb-6"><Zap className="h-3 w-3" /> No AI APIs needed</div>
        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">Analyze invoices{" "}<span className="text-brand-400">in seconds</span></h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">Upload invoices and receipts. Our OCR engine extracts vendor, amounts, dates, and tax data instantly. No AI subscription required.</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup"><Button size="lg" className="bg-brand-800 hover:bg-brand-700 text-base px-8">Start Free</Button></Link>
          <Link href="/pricing"><Button size="lg" variant="outline" className="text-base px-8">View Pricing</Button></Link>
        </div>
        <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><FileText className="h-4 w-4" /> 5 free invoices/mo</div>
          <div className="flex items-center gap-2"><Shield className="h-4 w-4" /> Bank-grade security</div>
          <div className="flex items-center gap-2"><Zap className="h-4 w-4" /> No setup required</div>
        </div>
      </div>
    </section>
  );
}
