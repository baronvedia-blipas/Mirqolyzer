import { FileSearch, Edit3, Download, Shield, Brain, Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  { icon: FileSearch, title: "Smart OCR", desc: "Extract text from PDFs and images using advanced OCR technology." },
  { icon: Edit3, title: "Editable Fields", desc: "Review and correct extracted data with confidence indicators." },
  { icon: Brain, title: "Pattern Learning", desc: "The system learns your vendors' invoice patterns over time." },
  { icon: Copy, title: "Duplicate Detection", desc: "Automatically flags duplicate invoices before they enter your system." },
  { icon: Download, title: "CSV & JSON Export", desc: "Export your invoice data in the format your accounting software needs." },
  { icon: Shield, title: "Secure by Default", desc: "Row-level security ensures your data is always private." },
];

export function Features() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need to process invoices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6"><Icon className="h-8 w-8 text-brand-400 mb-4" /><h3 className="font-semibold mb-2">{title}</h3><p className="text-sm text-muted-foreground">{desc}</p></CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
