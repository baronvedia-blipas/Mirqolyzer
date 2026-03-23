import { Card, CardContent } from "@/components/ui/card";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />;
}

export default function VendorsLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-40" />

      <div className="grid gap-4">
        {/* Table header skeleton */}
        <div className="hidden md:grid md:grid-cols-4 gap-4 px-6">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16 mx-auto" />
          <Skeleton className="h-3 w-20 ml-auto" />
          <Skeleton className="h-3 w-24 ml-auto" />
        </div>

        {/* Row skeletons */}
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 items-center">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-8 md:mx-auto" />
                <Skeleton className="h-4 w-20 md:ml-auto" />
                <Skeleton className="h-4 w-24 md:ml-auto" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
