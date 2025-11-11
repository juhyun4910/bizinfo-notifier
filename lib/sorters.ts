import { Notice } from "@prisma/client";
import { computeDeadlineKey } from "./bizinfo";

/**
 * 최신순 정렬 키: pubDate > creatPnttm > createdAt 순으로 최신 날짜를 사용한다.
 */
export function newestKey(notice: Notice) {
  const primary = notice.pubDate ?? notice.creatPnttm ?? notice.createdAt;
  return primary instanceof Date ? primary.getTime() : new Date(primary).getTime();
}

/**
 * 인기순 정렬 키: 조회수(desc)와 최신순을 결합한다.
 */
export function popularKey(notice: Notice) {
  const hits = notice.inqireCo ?? 0;
  return hits * 1_000_000_000 - newestKey(notice);
}

/**
 * 마감 임박 정렬 키: 기간 종료일을 우선하여 오름차순 정렬한다.
 */
export function deadlineKey(notice: Notice) {
  return computeDeadlineKey(notice.reqstBeginEndDe);
}

export function sortNotices(notices: Notice[], sort: string) {
  const cloned = [...notices];
  switch (sort) {
    case "popular":
      return cloned.sort((a, b) => popularKey(b) - popularKey(a));
    case "deadline":
      return cloned.sort((a, b) => deadlineKey(a) - deadlineKey(b));
    case "newest":
    default:
      return cloned.sort((a, b) => newestKey(b) - newestKey(a));
  }
}
