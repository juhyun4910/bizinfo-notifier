"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchBookmarks } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { NoticeCard } from "@/components/notice-card";
import { InfiniteLoader } from "@/components/infinite-loader";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { EmptyState } from "@/components/empty-state";
import { ErrorBanner } from "@/components/error-banner";

const PAGE_SIZE = 30;

/**
 * 북마크 페이지 전용 무한 스크롤 리스트.
 */
export function BookmarksView() {
  const params = useSearchParams();
  const queryKey = useMemo(() => ["bookmarks", Object.fromEntries(params.entries())], [params]);

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
      const response = await fetchBookmarks(Object.fromEntries(query.entries()));
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
    return <ErrorBanner message={(error as Error).message || "북마크를 불러오는 중 오류가 발생했습니다."} />;
  }

  const items = data?.pages.flatMap((page) => page.items) ?? [];

  if (!items.length) {
    return <EmptyState title="저장된 공고가 없습니다" description="관심 있는 공고를 북마크에 추가해보세요." />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((notice) => (
          <NoticeCard key={notice.id} notice={notice} />
        ))}
      </div>
      <InfiniteLoader hasMore={Boolean(hasNextPage)} isFetching={isFetchingNextPage} onLoadMore={() => fetchNextPage()} />
      {isFetchingNextPage && <LoadingSkeleton count={3} />}
    </div>
  );
}
