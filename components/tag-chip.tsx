"use client";

import { memo } from "react";

interface TagChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}

// 단순 태그 칩 컴포넌트: 선택/해제 상태와 제거 버튼을 지원
export const TagChip = memo(function TagChip({ label, selected, onClick, onRemove }: TagChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs",
        selected
          ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-600/15 dark:text-blue-300"
          : "border-gray-300 bg-white text-gray-700 dark:bg-neutral-900 dark:text-gray-300",
      ].join(" ")}
      title={label}
    >
      <span className="truncate max-w-[10rem]">{label}</span>
      {typeof onRemove === "function" && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="rounded-full bg-gray-200 px-1 text-[10px] leading-4 text-gray-600 hover:bg-gray-300 dark:bg-neutral-700 dark:text-gray-200"
        >
          ×
        </span>
      )}
    </button>
  );
});

