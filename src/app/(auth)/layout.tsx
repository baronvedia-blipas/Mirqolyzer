export const dynamic = "force-dynamic";

import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left branded panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient background */}
        <div
          className="absolute inset-0 animate-gradient"
          style={{
            background: "linear-gradient(135deg, #0a1929, #1e3a5f, #2a4a7a, #132844, #0a1929)",
            backgroundSize: "400% 400%",
          }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Decorative shapes */}
        <div className="absolute top-[15%] left-[10%] w-48 h-48 rounded-full bg-brand-400/10 blur-[80px] animate-float" />
        <div className="absolute bottom-[20%] right-[15%] w-64 h-64 rounded-full bg-brand-300/8 blur-[100px] animate-float" style={{ animationDelay: "3s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-brand-400/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] rounded-full border border-brand-400/5" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
          <Link href="/" className="text-4xl font-bold tracking-tight mb-6">
            <span className="text-white">Mirqo</span>
            <span className="font-light text-brand-300">lyzer</span>
          </Link>
          <p className="text-brand-200 text-center text-lg leading-relaxed max-w-sm">
            Smart invoice analysis powered by OCR. Extract data from any document in seconds.
          </p>
          <div className="mt-12 flex items-center gap-8 text-sm text-brand-300/80">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">10K+</div>
              <div>Invoices</div>
            </div>
            <div className="h-8 w-px bg-brand-400/20" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">500+</div>
              <div>Companies</div>
            </div>
            <div className="h-8 w-px bg-brand-400/20" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div>Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right form area */}
      <div className="flex-1 flex items-center justify-center bg-background p-4 sm:p-8 lg:bg-muted/20">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
