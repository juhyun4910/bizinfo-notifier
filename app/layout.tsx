import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "./providers";
import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { SortSelect } from "@/components/sort-select";
import { TagQuickFilters } from "@/components/tag-quick-filters";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "bizinfo-alert | 기업마당 공고 브라우저",
  description: "기업마당 공고를 빠르게 탐색하고 알림톡 확장까지 고려한 대시보드",
};

/**
 * 공통 레이아웃: 헤더/푸터를 구성하고 React Query Provider를 감싼다.
 * - 보안 주석: 헤더 검색은 클라이언트 컴포넌트지만, 기업마당 API 키는 서버 라우트에서만 사용해야 한다.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <AppProviders>
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
              <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-4 px-4 py-4 sm:flex-nowrap">
                <Link href="/" className="text-xl font-bold">bizinfo-alert</Link>
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                  <SearchBar />
                  <SortSelect />
                </div>
                <TagQuickFilters />
              </div>
            </header>
            <main className="flex-1 bg-muted/10">
              <div className="mx-auto w-full max-w-6xl px-4 py-8">{children}</div>
            </main>
            <footer className="border-t bg-background py-4 text-center text-sm text-muted-foreground">
              데이터 출처: 기업마당
            </footer>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
