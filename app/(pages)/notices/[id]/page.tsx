import { notFound } from "next/navigation";
import Link from "next/link";
import { NoticeCard } from "@/components/notice-card";
import { PeriodBadge } from "@/components/period-badge";
import { TagChips } from "@/components/tag-chips";
import { Button } from "@/components/ui/button";
import { NoticeDetailDTO } from "@/lib/types";

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

async function getNotice(id: string): Promise<NoticeDetailDTO | null> {
  const res = await fetch(`${baseUrl}/api/notices/${id}`, {
    cache: "no-store",
  }).catch(() => null);
  if (!res || !res.ok) return null;
  return res.json();
}

/**
 * 공고 상세 페이지.
 */
export default async function NoticeDetailPage({ params }: { params: { id: string } }) {
  const notice = await getNotice(params.id);
  if (!notice) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">{notice.title}</h1>
          <div className="flex gap-2">
            {notice.link && (
              <Button asChild variant="outline">
                <Link href={notice.link} target="_blank" rel="noopener noreferrer">
                  원문 보기
                </Link>
              </Button>
            )}
            {notice.pblancUrl && (
              <Button asChild variant="outline">
                <Link href={notice.pblancUrl} target="_blank" rel="noopener noreferrer">
                  상세 공고
                </Link>
              </Button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {notice.organization && <span>{notice.organization}</span>}
          {notice.category && <span>· {notice.category}</span>}
          {notice.pubDate && <span>· 게시일 {new Date(notice.pubDate).toLocaleDateString()}</span>}
        </div>
        <PeriodBadge period={notice.deadline ?? undefined} />
        <TagChips tags={notice.tags} />
      </header>
      <section className="prose max-w-none dark:prose-invert">
        <h2>사업 개요</h2>
        <p>{notice.content ?? "상세 요약이 제공되지 않았습니다."}</p>
        {notice.attachments && (
          <p className="text-sm text-muted-foreground">첨부: {notice.attachments}</p>
        )}
      </section>
      {notice.related.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">관련 공고</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notice.related.map((related) => (
              <NoticeCard key={related.id} notice={related} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
