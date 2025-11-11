import { Skeleton } from "@/components/ui/skeleton";

/**
 * 공고 카드 로딩 상태를 위한 스켈레톤 묶음.
 */
export function LoadingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-lg border p-4">
          <Skeleton className="mb-3 h-5 w-3/4" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="mb-2 h-4 w-5/6" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}
