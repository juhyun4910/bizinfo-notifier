"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchTags } from "@/lib/api";
import { LCATEGORY_OPTIONS } from "@/lib/constants";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterState {
  lcategories: string[];
  organization: string;
  tags: string[];
  start: string;
  end: string;
}

const defaultState: FilterState = {
  lcategories: [],
  organization: "",
  tags: [],
  start: "",
  end: "",
};

/**
 * 필터 드로어: 모바일에서는 시트, 데스크톱에서는 고정 패널로 노출한다.
 * - 운영 주석: 필터 변경 시 URL 쿼리스트링으로 동기화하여 서버와 상태를 공유한다.
 */
export function FilterDrawer({ className }: { className?: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const { data: tags } = useQuery({ queryKey: ["tags"], queryFn: fetchTags });
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<FilterState>({ ...defaultState });

  useEffect(() => {
    const selectedTags = (params.get("tags") ?? "").split(",").filter(Boolean);
    setState({
      lcategories: params.getAll("lcategory")?.length
        ? params.getAll("lcategory")
        : params.get("lcategory")
        ? [params.get("lcategory")!]
        : [],
      organization: params.get("jrsdInsttNm") ?? "",
      tags: selectedTags,
      start: params.get("start") ?? "",
      end: params.get("end") ?? "",
    });
  }, [params]);

  const applyFilters = (next: FilterState) => {
    const query = new URLSearchParams(Array.from(params.entries()));
    query.delete("lcategory");
    next.lcategories.forEach((value) => query.append("lcategory", value));
    if (next.organization) {
      query.set("jrsdInsttNm", next.organization);
    } else {
      query.delete("jrsdInsttNm");
    }
    if (next.tags.length) {
      query.set("tags", next.tags.join(","));
    } else {
      query.delete("tags");
    }
    if (next.start) {
      query.set("start", next.start);
    } else {
      query.delete("start");
    }
    if (next.end) {
      query.set("end", next.end);
    } else {
      query.delete("end");
    }
    query.delete("page");
    router.push(`/?${query.toString()}`);
  };

  const panel = (
    <form
      className={cn("space-y-6", className)}
      onSubmit={(event) => {
        event.preventDefault();
        applyFilters(state);
        setOpen(false);
      }}
    >
      <section>
        <h3 className="mb-3 text-sm font-semibold">분야</h3>
        <div className="grid grid-cols-2 gap-2">
          {LCATEGORY_OPTIONS.map((option) => {
            const checked = state.lcategories.includes(option);
            return (
              <label key={option} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={checked}
                  onCheckedChange={(checkedValue) => {
                    setState((prev) => ({
                      ...prev,
                      lcategories: checkedValue
                        ? Array.from(new Set([...prev.lcategories, option]))
                        : prev.lcategories.filter((item) => item !== option),
                    }));
                  }}
                />
                {option}
              </label>
            );
          })}
        </div>
      </section>
      <section>
        <Label htmlFor="organization" className="mb-2 block">
          소관기관(부분 일치)
        </Label>
        <Input
          id="organization"
          placeholder="예: 중소벤처기업부"
          value={state.organization}
          onChange={(event) => setState((prev) => ({ ...prev, organization: event.target.value }))}
        />
      </section>
      <section>
        <h3 className="mb-3 text-sm font-semibold">관심 태그</h3>
        <ScrollArea className="max-h-48">
          <div className="flex flex-wrap gap-2">
            {tags?.map((tag) => {
              const checked = state.tags.includes(tag.name);
              return (
                <button
                  type="button"
                  key={tag.id}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition",
                    checked ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"
                  )}
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      tags: checked
                        ? prev.tags.filter((item) => item !== tag.name)
                        : Array.from(new Set([...prev.tags, tag.name])),
                    }))
                  }
                >
                  #{tag.name}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </section>
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">신청 기간</h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="space-y-1">
            <Label htmlFor="start">시작일</Label>
            <Input
              id="start"
              type="date"
              value={state.start}
              onChange={(event) => setState((prev) => ({ ...prev, start: event.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="end">마감일</Label>
            <Input id="end" type="date" value={state.end} onChange={(event) => setState((prev) => ({ ...prev, end: event.target.value }))} />
          </div>
        </div>
      </section>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          적용
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setState({ ...defaultState });
            applyFilters({ ...defaultState });
            setOpen(false);
          }}
        >
          초기화
        </Button>
      </div>
    </form>
  );

  return (
    <div className={cn("lg:w-64", className)}>
      <div className="hidden lg:block">
        {panel}
      </div>
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <Filter className="mr-2 h-4 w-4" aria-hidden /> 필터
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>필터</SheetTitle>
              <SheetDescription>모바일에서는 드로어로 필터를 조정한다.</SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6 overflow-y-auto pr-4">{panel}</div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
