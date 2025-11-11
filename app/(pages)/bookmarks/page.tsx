import { BookmarksView } from "../components/bookmarks-view";
import { FilterDrawer } from "@/components/filter-drawer";
import { Suspense } from "react";
import { LoadingSkeleton } from "@/components/loading-skeleton";

/**
 * 북마크 페이지: 필터와 함께 저장된 공고를 보여준다.
 */
export default function BookmarksPage() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <FilterDrawer className="sticky top-28" />
      <div className="flex-1">
        <Suspense fallback={<LoadingSkeleton />}>
          <BookmarksView />
        </Suspense>
      </div>
    </div>
  );
}
