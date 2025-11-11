"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTags } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * 관심 태그 빠른 필터: 헤더에서 자주 사용하는 태그를 바로 적용한다.
 * - 운영 주석: 태그를 눌러 URL 파라미터에 tags= 값을 교체한다.
 */
export function TagQuickFilters() {
  const { data } = useQuery({ queryKey: ["tags"], queryFn: fetchTags });
  const router = useRouter();
  const params = useSearchParams();
  const active = new Set((params.get("tags") ?? "").split(",").filter(Boolean));

  if (!data?.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {data.slice(0, 5).map((tag) => {
        const isActive = active.has(tag.name);
        return (
          <button
            type="button"
            key={tag.id}
            onClick={() => {
              const next = new URLSearchParams(Array.from(params.entries()));
              const current = new Set((next.get("tags") ?? "").split(",").filter(Boolean));
              if (isActive) {
                current.delete(tag.name);
              } else {
                current.add(tag.name);
              }
              if (current.size) {
                next.set("tags", Array.from(current).join(","));
              } else {
                next.delete("tags");
              }
              router.push(`/?${next.toString()}`);
            }}
            className="focus:outline-none"
          >
            <Badge
              variant={isActive ? "default" : "outline"}
              className={cn("cursor-pointer", isActive ? "" : "hover:bg-accent")}
            >
              #{tag.name}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
