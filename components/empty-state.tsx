import { ReactNode } from "react";

/**
 * 검색 결과가 없을 때 노출하는 비어있음 상태 컴포넌트.
 */
export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}
