import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "bizinfo-alert | 최소 데모",
  description: "DB 없이 기업마당 API를 직접 호출해 표로 표시",
};

/**
 * 공통 레이아웃: 헤더/푸터를 구성하고 React Query Provider를 감싼다.
 * - 보안 주석: 헤더 검색은 클라이언트 컴포넌트지만, 기업마당 API 키는 서버 라우트에서만 사용해야 한다.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="bg-white text-gray-900 dark:bg-neutral-950 dark:text-gray-100">
        <div className="min-h-screen">
          <header className="border-b bg-white/95 dark:bg-neutral-950/80 backdrop-blur">
            <div className="mx-auto w-full max-w-6xl px-4 py-4">
              <h1 className="text-xl font-bold">bizinfo-alert (DB 없이 데모)</h1>
              <p className="text-sm text-gray-500">브라우저에서 기업마당 API를 직접 호출합니다.</p>
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
          <footer className="border-t bg-white dark:bg-neutral-950 py-4 text-center text-sm text-gray-500">
            데이터 출처: 기업마당
          </footer>
        </div>
      </body>
    </html>
  );
}
