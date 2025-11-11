import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sortNotices } from "@/lib/sorters";

/**
 * GET /api/notices/[id]
 * 단일 공고와 관련 공고 추천을 반환한다.
 */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const notice = await prisma.notice.findUnique({
    where: { id: params.id },
    include: {
      tags: { include: { tag: true } },
      bookmarks: true,
    },
  });

  if (!notice) {
    return new Response("Not found", { status: 404 });
  }

  const tagIds = notice.tags.map((t) => t.tagId);

  const orConditions = [
    tagIds.length ? { tags: { some: { tagId: { in: tagIds } } } } : undefined,
    notice.jrsdInsttNm ? { jrsdInsttNm: notice.jrsdInsttNm } : undefined,
  ].filter(Boolean) as any[];

  const relatedCandidates = await prisma.notice.findMany({
    where: {
      id: { not: notice.id },
      ...(orConditions.length ? { OR: orConditions } : {}),
    },
    include: {
      tags: { include: { tag: true } },
      bookmarks: true,
    },
    take: 20,
  });

  const relatedSorted = sortNotices(relatedCandidates, "newest").slice(0, 5);

  const toDto = (n: typeof notice) => ({
    id: n.id,
    title: n.title,
    summary: n.bsnsSumryCn,
    pubDate: n.pubDate ? n.pubDate.toISOString() : n.creatPnttm ? n.creatPnttm.toISOString() : null,
    deadline: n.reqstBeginEndDe,
    organization: n.jrsdInsttNm,
    category: n.lcategory,
    tags: n.tags.map((t) => ({ id: t.tag.id, name: t.tag.name })),
    bookmarked: n.bookmarks.length > 0,
    bookmarkId: n.bookmarks[0]?.id ?? null,
    inqireCo: n.inqireCo,
  });

  const dto = {
    ...toDto(notice),
    link: notice.link,
    pblancUrl: notice.pblancUrl,
    content: notice.bsnsSumryCn,
    attachments: notice.flpthNm,
    related: relatedSorted.map(toDto),
  };

  return Response.json(dto);
}
