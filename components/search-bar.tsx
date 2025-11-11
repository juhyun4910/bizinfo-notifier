"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * 헤더 검색바: 쿼리 문자열을 URL 상태와 동기화한다.
 * - 운영 주석: 클라이언트에서 기업마당 API 키를 직접 호출하지 않고, 서버 라우트를 통해 검색한다.
 */
export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");

  useEffect(() => {
    setValue(params.get("q") ?? "");
  }, [params]);

  return (
    <form
      className={cn("flex-1", className)}
      onSubmit={(event) => {
        event.preventDefault();
        const query = new URLSearchParams(Array.from(params.entries()));
        if (value) {
          query.set("q", value);
        } else {
          query.delete("q");
        }
        router.push(`/?${query.toString()}`);
      }}
    >
      <Input
        placeholder="공고 제목 또는 요약 검색"
        aria-label="공고 검색"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
}
