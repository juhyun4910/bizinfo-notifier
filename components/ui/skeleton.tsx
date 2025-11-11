import { cn } from "@/lib/utils";

/**
 * 로딩 스켈레톤. 네트워크 지연 시 빈 공간을 채워 UX를 향상한다.
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}
