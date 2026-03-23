"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-destructive/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-destructive/5 blur-3xl" />
      </div>

      <div className="relative text-center space-y-8 px-4 max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-primary to-primary/60" />
          <div className="text-xl tracking-tight">
            <span className="font-bold text-foreground">Mirqo</span>
            <span className="font-light text-muted-foreground">lyzer</span>
          </div>
        </div>

        {/* Error icon */}
        <div className="flex items-center justify-center">
          <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Algo salio mal
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/">
            <Button variant="outline" className="rounded-lg">
              Volver al inicio
            </Button>
          </Link>
          <Button
            onClick={reset}
            className="rounded-lg bg-primary hover:bg-primary/90"
          >
            Intentar de nuevo
          </Button>
        </div>
      </div>
    </div>
  );
}
