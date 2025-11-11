import { TagDTO } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

/**
 * 태그 칩 컴포넌트: 공고에 연결된 태그를 배지로 표현한다.
 */
export function TagChips({ tags }: { tags: TagDTO[] }) {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge key={tag.id} variant="secondary">
          #{tag.name}
        </Badge>
      ))}
    </div>
  );
}
