import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * tailwind 클래스 문자열을 병합하는 유틸.
 * - 운영 주석: UI 일관성을 위해 중복 클래스를 제거한다.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
