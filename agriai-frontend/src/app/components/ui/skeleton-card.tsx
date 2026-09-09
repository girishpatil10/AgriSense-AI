import { Skeleton } from "./skeleton";

export function SkeletonCard() {
  return (
    <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-emerald-100 space-y-3">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-8 w-2/3" />
    </div>
  );
}
