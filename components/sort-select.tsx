"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * 정렬 선택 컴포넌트: 최신/인기/마감임박 정렬을 제공한다.
 */
export function SortSelect() {
  const params = useSearchParams();
  const router = useRouter();
  const [value, setValue] = useState(params.get("sort") ?? "newest");

  useEffect(() => {
    setValue(params.get("sort") ?? "newest");
  }, [params]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    const query = new URLSearchParams(Array.from(params.entries()));
    if (newValue && newValue !== "newest") {
      query.set("sort", newValue);
    } else {
      query.delete("sort");
    }
    router.push(`/?${query.toString()}`);
  };

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger aria-label="정렬 선택" className="w-44">
        <SelectValue placeholder="정렬" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">최신순</SelectItem>
        <SelectItem value="popular">인기순</SelectItem>
        <SelectItem value="deadline">마감임박</SelectItem>
      </SelectContent>
    </Select>
  );
}
