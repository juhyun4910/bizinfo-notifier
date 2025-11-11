"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

/**
 * 전역 React Query 클라이언트를 초기화하여 앱 전반에서 데이터를 캐싱/동기화한다.
 * - 서버에서만 호출해야 할 API 키가 클라이언트에 노출되지 않도록 주석으로 강조한다.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  // React Query 클라이언트는 컴포넌트 생명주기 동안 1회 생성해야 캐시가 보존된다.
  const [client] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  );
}
