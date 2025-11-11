import { cn } from "@/lib/utils";

/**
 * 작은 강조 배지. 태그나 기간 표시 등에 사용한다.
 */
export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "secondary" | "outline" }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variant === "default" && "border-transparent bg-primary text-primary-foreground",
        variant === "secondary" && "border-transparent bg-secondary text-secondary-foreground",
        variant === "outline" && "text-foreground",
        className
      )}
      {...props}
    />
  );
}
