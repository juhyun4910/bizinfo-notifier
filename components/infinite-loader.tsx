"use client";

import { useEffect, useRef } from "react";

/**
 * 무한 스크롤 sentinel. 뷰포트에 진입하면 다음 페이지를 요청한다.
 * - 운영 주석: 무한스크롤은 UX는 좋지만 SEO와 키보드 접근성이 떨어져, 페이지네이션과 병행 제공한다.
 */
export function InfiniteLoader({ hasMore, isFetching, onLoadMore }: { hasMore: boolean; isFetching: boolean; onLoadMore: () => void }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore) return;
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && hasMore && !isFetching) {
          onLoadMore();
        }
      });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isFetching, onLoadMore]);

  return <div ref={ref} aria-hidden className="h-10 w-full" />;
}
