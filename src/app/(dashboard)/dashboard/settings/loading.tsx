import { Card, CardContent, CardHeader } from "@/components/ui/card";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />;
}

export default function SettingsLoading() {
  return (
    <div className="max-w-2xl space-y-6">
      <Skeleton className="h-8 w-24" />
      <Card>
        <CardHeader><Skeleton className="h-5 w-16" /></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-9 w-full" /></div>
          <div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-9 w-full" /></div>
          <Skeleton className="h-9 w-28" />
        </CardContent>
      </Card>
    </div>
  );
}
