import { Suspense } from "react";
import { FilterDrawer } from "@/components/filter-drawer";
import { NoticesView } from "./components/notices-view";
import { LoadingSkeleton } from "@/components/loading-skeleton";

/**
 * 홈 페이지: 좌측 필터와 우측 공고 목록을 구성한다.
 */
export default function HomePage() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <FilterDrawer className="sticky top-28" />
      <div className="flex-1">
        <Suspense fallback={<LoadingSkeleton />}>
          <NoticesView />
        </Suspense>
      </div>
    </div>
  );
}
