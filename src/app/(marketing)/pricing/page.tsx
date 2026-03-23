import type { Metadata } from "next";
import { PricingSection } from "@/components/marketing/pricing-section";

export const metadata: Metadata = {
  title: "Precios",
  description:
    "Planes y precios de Mirqolyzer. Desde gratis hasta Business, elige el plan que mejor se adapte a tu negocio.",
};

export default function PricingPage() {
  return <div className="py-8"><PricingSection /></div>;
}
