import { parsePeriod } from "./bizinfo";

export function sortNotices<T extends { pubDate?: Date | string | null; creatPnttm?: Date | string | null; inqireCo?: number | null; reqstBeginEndDe?: string | null }>(
  items: T[],
  sort: string
): T[] {
  const toDate = (v: unknown): number => {
    if (!v) return 0;
    const d = v instanceof Date ? v : new Date(String(v));
    const t = d.getTime();
    return Number.isNaN(t) ? 0 : t;
  };

  const copy = [...items];
  switch (sort) {
    case "deadline":
      return copy.sort((a, b) => {
        const ae = parsePeriod(a.reqstBeginEndDe ?? undefined).end?.getTime() ?? Infinity;
        const be = parsePeriod(b.reqstBeginEndDe ?? undefined).end?.getTime() ?? Infinity;
        return ae - be;
      });
    case "popular":
      return copy.sort((a, b) => (b.inqireCo ?? 0) - (a.inqireCo ?? 0));
    case "newest":
    default:
      return copy.sort((a, b) => {
        const at = Math.max(toDate(a.pubDate ?? null), toDate(a.creatPnttm ?? null));
        const bt = Math.max(toDate(b.pubDate ?? null), toDate(b.creatPnttm ?? null));
        return bt - at;
      });
  }
}

