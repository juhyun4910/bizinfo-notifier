import { Badge } from "@/components/ui/badge";
import { parsePeriod } from "@/lib/bizinfo";
import { format } from "date-fns";

/**
 * 신청 기간을 사람이 읽기 좋은 배지로 표시한다.
 */
export function PeriodBadge({ period }: { period?: string | null }) {
  if (!period) return null;
  const { start, end } = parsePeriod(period);
  if (!start && !end) return null;
  const formatter = (date: Date | null) => (date ? format(date, "yyyy.MM.dd") : "미정");
  return (
    <Badge variant="outline">
      {formatter(start)} ~ {formatter(end)}
    </Badge>
  );
}
