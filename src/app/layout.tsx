import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { LanguageProvider } from "@/lib/i18n/context";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Mirqolyzer — Analiza facturas en segundos",
    template: "%s | Mirqolyzer",
  },
  description:
    "Sube facturas y recibos. Nuestro motor OCR extrae datos de proveedores, montos, fechas e impuestos al instante. Sin APIs de IA.",
  keywords: [
    "factura",
    "OCR",
    "analizar facturas",
    "Bolivia",
    "contabilidad",
    "SaaS",
    "invoice analyzer",
  ],
  authors: [{ name: "Mirqolyzer" }],
  openGraph: {
    type: "website",
    locale: "es_BO",
    url: "https://mirqolyzer.com",
    siteName: "Mirqolyzer",
    title: "Mirqolyzer — Analiza facturas en segundos",
    description:
      "Motor OCR para extraer datos de facturas y recibos automáticamente.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mirqolyzer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mirqolyzer — Analiza facturas en segundos",
    description:
      "Motor OCR para extraer datos de facturas y recibos automáticamente.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
