import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 px-4">
        <FileQuestion className="h-16 w-16 text-muted-foreground mx-auto" />
        <div>
          <h1 className="text-4xl font-bold mb-2">404</h1>
          <p className="text-lg text-muted-foreground">
            This page doesn&apos;t exist. Maybe the invoice got lost?
          </p>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-brand-800 hover:bg-brand-700">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
