"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchNotices } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { NoticeCard } from "@/components/notice-card";
import { InfiniteLoader } from "@/components/infinite-loader";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { EmptyState } from "@/components/empty-state";
import { ErrorBanner } from "@/components/error-banner";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 30;

/**
 * 공고 리스트를 무한 스크롤로 보여주는 클라이언트 컴포넌트.
 * - 운영 주석: 무한스크롤은 사용자에게 빠른 탐색을 제공하지만, 페이지 쿼리로 SSR/SEO도 유지한다.
 */
export function NoticesView() {
  const params = useSearchParams();
  const queryKey = useMemo(() => ["notices", Object.fromEntries(params.entries())], [params]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const query = new URLSearchParams(Array.from(params.entries()));
      query.set("page", String(pageParam));
      query.set("pageSize", String(PAGE_SIZE));
      const response = await fetchNotices(Object.fromEntries(query.entries()));
      return response;
    },
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((acc, page) => acc + page.items.length, 0);
      if (loaded >= lastPage.total) return undefined;
      return allPages.length + 1;
    },
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return <ErrorBanner message={(error as Error).message || "데이터를 불러오지 못했습니다."} />;
  }

  const items = data?.pages.flatMap((page) => page.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  if (!items.length) {
    return <EmptyState title="검색 결과가 없습니다" description="필터를 조정하거나 다른 키워드를 시도하세요." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          총 {total.toLocaleString()}건 중 {items.length.toLocaleString()}건 표시 중
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const element = document.getElementById("notice-grid-top");
            element?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          맨 위로
        </Button>
      </div>
      <div id="notice-grid-top" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((notice) => (
          <NoticeCard key={notice.id} notice={notice} />
        ))}
      </div>
      <InfiniteLoader hasMore={Boolean(hasNextPage)} isFetching={isFetchingNextPage} onLoadMore={() => fetchNextPage()} />
      {isFetchingNextPage && <LoadingSkeleton count={3} />}
    </div>
  );
}
