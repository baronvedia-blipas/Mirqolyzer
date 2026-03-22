import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-16">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to streamline your invoices?</h2>
        <p className="text-muted-foreground mb-8">Start analyzing invoices in under a minute. No credit card required.</p>
        <Link href="/signup"><Button size="lg" className="bg-brand-800 hover:bg-brand-700 text-base px-8">Get Started Free</Button></Link>
      </div>
    </section>
  );
}
