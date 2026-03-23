import type { Metadata } from "next";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Features } from "@/components/marketing/features";
import { Testimonials } from "@/components/marketing/testimonials";
import { PricingSection } from "@/components/marketing/pricing-section";
import { FAQ } from "@/components/marketing/faq";
import { CTA } from "@/components/marketing/cta";

export const metadata: Metadata = {
  title: "Mirqolyzer — Analiza facturas en segundos",
  description:
    "Sube facturas y recibos. Nuestro motor OCR extrae datos de proveedores, montos, fechas e impuestos al instante. Sin APIs de IA.",
};

export default function LandingPage() {
  return (<><Hero /><HowItWorks /><Features /><Testimonials /><PricingSection /><FAQ /><CTA /></>);
}
