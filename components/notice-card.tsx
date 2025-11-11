"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookmarkCheck, BookmarkPlus, ExternalLink } from "lucide-react";
import { NoticeCardDTO } from "@/lib/types";
import { createBookmark, deleteBookmark } from "@/lib/api";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TagChips } from "@/components/tag-chips";
import { PeriodBadge } from "@/components/period-badge";
import { Button } from "@/components/ui/button";

/**
 * 공고 카드를 렌더링하고 북마크 토글을 지원하는 컴포넌트.
 * - 운영 주석: 북마크는 낙관적 업데이트로 즉시 반영하되, 실패 시 롤백한다.
 */
export function NoticeCard({ notice }: { notice: NoticeCardDTO }) {
  const queryClient = useQueryClient();
  const [optimisticBookmark, setOptimisticBookmark] = useState<{ bookmarked: boolean; bookmarkId: number | null | undefined }>(
    () => ({ bookmarked: notice.bookmarked ?? false, bookmarkId: notice.bookmarkId })
  );

  const createMutation = useMutation({
    mutationFn: () => createBookmark(notice.id),
    onMutate: async () => {
      setOptimisticBookmark({ bookmarked: true, bookmarkId: optimisticBookmark.bookmarkId ?? null });
    },
    onSuccess: (data) => {
      setOptimisticBookmark({ bookmarked: true, bookmarkId: data.id });
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
    onError: () => {
      setOptimisticBookmark({ bookmarked: notice.bookmarked ?? false, bookmarkId: notice.bookmarkId });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      const id = optimisticBookmark.bookmarkId ?? notice.bookmarkId;
      if (!id) throw new Error("bookmark id missing");
      return deleteBookmark(id);
    },
    onMutate: async () => {
      setOptimisticBookmark({ bookmarked: false, bookmarkId: null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
    onError: () => {
      setOptimisticBookmark({ bookmarked: notice.bookmarked ?? false, bookmarkId: notice.bookmarkId });
    },
  });

  const isBookmarked = optimisticBookmark.bookmarked;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="line-clamp-2 text-base">
          <Link href={`/notices/${notice.id}`} className="hover:underline">
            {notice.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {notice.summary && <p className="line-clamp-3 text-sm text-muted-foreground">{notice.summary}</p>}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {notice.organization && <span>{notice.organization}</span>}
          {notice.category && <span>· {notice.category}</span>}
          {notice.pubDate && <span>· 게시: {notice.pubDate}</span>}
        </div>
        <PeriodBadge period={notice.deadline ?? undefined} />
        <TagChips tags={notice.tags} />
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/notices/${notice.id}`}>
            자세히 보기
            <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </Button>
        <Button
          type="button"
          size="sm"
          variant={isBookmarked ? "secondary" : "outline"}
          onClick={() => {
            if (isBookmarked) {
              deleteMutation.mutate();
            } else {
              createMutation.mutate();
            }
          }}
          aria-pressed={isBookmarked}
        >
          {isBookmarked ? (
            <>
              <BookmarkCheck className="mr-2 h-4 w-4" aria-hidden /> 저장됨
            </>
          ) : (
            <>
              <BookmarkPlus className="mr-2 h-4 w-4" aria-hidden /> 북마크
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
