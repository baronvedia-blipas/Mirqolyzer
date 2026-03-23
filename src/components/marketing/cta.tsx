import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      {/* Gradient background */}
      <div
        className="absolute inset-0 animate-gradient"
        style={{
          background: "linear-gradient(135deg, #0a1929, #1e3a5f, #2a4a7a, #132844)",
          backgroundSize: "400% 400%",
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Glow blobs */}
      <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-brand-400/15 blur-[100px]" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-brand-300/10 blur-[120px]" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white tracking-tight">
          Ready to streamline your invoices?
        </h2>
        <p className="text-brand-200 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          Start analyzing invoices in under a minute. No credit card required.
        </p>
        <Link href="/signup">
          <Button
            size="lg"
            className="relative bg-white text-brand-900 hover:bg-brand-50 text-base px-10 py-6 font-semibold shadow-2xl shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-3xl overflow-hidden group"
          >
            <span className="relative z-10">Get Started Free</span>
            <div className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
