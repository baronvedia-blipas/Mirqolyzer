import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
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

        {/* 404 with gradient */}
        <div className="relative">
          <h1 className="text-[8rem] sm:text-[10rem] font-extrabold leading-none bg-gradient-to-br from-primary via-primary/70 to-primary/40 bg-clip-text text-transparent select-none">
            404
          </h1>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Página no encontrada
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            La página que buscas no existe o fue movida
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/">
            <Button variant="outline" className="rounded-lg">
              Volver al inicio
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="rounded-lg bg-primary hover:bg-primary/90">
              Ir al panel
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
