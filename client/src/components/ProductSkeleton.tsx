import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function ProductCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-3 flex flex-col items-center gap-2">
        <Skeleton className="w-full aspect-square rounded-md" />
        <Skeleton className="h-3 w-3/4 rounded" />
        <Skeleton className="h-4 w-1/2 rounded" />
        <Skeleton className="h-8 w-full rounded" />
      </CardContent>
    </Card>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 w-full py-6">
      <div className="flex flex-col gap-6">
        <Skeleton className="w-full aspect-square rounded-lg" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-3/4 rounded" />
          <Skeleton className="h-4 w-1/2 rounded" />
          <Skeleton className="h-8 w-1/3 rounded" />
          <div className="flex gap-2 mt-4">
            <Skeleton className="h-10 w-24 rounded" />
            <Skeleton className="h-10 flex-1 rounded" />
          </div>
          <Skeleton className="h-20 w-full rounded mt-4" />
        </div>
      </div>
    </div>
  );
}

export function BrandListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 px-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-xl" />
      ))}
    </div>
  );
}
