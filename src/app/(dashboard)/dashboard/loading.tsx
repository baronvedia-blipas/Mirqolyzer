import { Card, CardContent } from "@/components/ui/card";

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-md bg-muted/60 ${className ?? ""}`}
      style={{
        animation: "skeleton-pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        backgroundImage: "linear-gradient(90deg, transparent, hsl(var(--muted-foreground) / 0.05), transparent)",
        backgroundSize: "200% 100%",
      }}
    />
  );
}

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Welcome banner skeleton */}
      <div className="rounded-xl border border-border/50 bg-gradient-to-br from-muted/30 to-transparent p-6">
        <Skeleton className="h-7 w-56 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-muted" />
            <CardContent className="p-4 pl-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-7 w-16" />
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload zone skeleton */}
      <div className="rounded-lg border-2 border-dashed border-border/30 p-8">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="flex flex-col items-center gap-1.5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      </div>

      {/* Filters skeleton */}
      <div className="flex gap-3">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Recent invoices skeleton */}
      <Card className="overflow-hidden">
        <div className="p-6 pb-3">
          <Skeleton className="h-5 w-36" />
        </div>
        <div className="px-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-3.5 border-t border-border/30">
              <div className="space-y-2">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-28" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-5 w-36 mb-6" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-5 w-36 mb-6" />
            <Skeleton className="h-48 w-48 rounded-full mx-auto" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
