import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeTagName, parsePeriod } from "@/lib/bizinfo";
import { sortNotices } from "@/lib/sorters";

/**
 * GET /api/notices
 * 공고 리스트 조회 + 검색/필터/정렬.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? undefined;
  const lcategory = searchParams.get("lcategory") ?? undefined;
  const jrsdInsttNm = searchParams.get("jrsdInsttNm") ?? undefined;
  const tagsParam = searchParams.get("tags") ?? "";
  const sort = searchParams.get("sort") ?? "newest";
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "30");
  const startFilter = searchParams.get("start");
  const endFilter = searchParams.get("end");

  const tagFilters = tagsParam
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => normalizeTagName(tag));

  const where: any = {};
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { bsnsSumryCn: { contains: q } },
    ];
  }
  if (lcategory) {
    where.lcategory = lcategory;
  }
  if (jrsdInsttNm) {
    where.jrsdInsttNm = { contains: jrsdInsttNm };
  }
  if (tagFilters.length) {
    where.AND = tagFilters.map((tag) => ({
      tags: { some: { tag: { name: tag } } },
    }));
  }

  const notices = await prisma.notice.findMany({
    where,
    include: {
      tags: { include: { tag: true } },
      bookmarks: true,
    },
  });

  const filtered = notices.filter((notice) => {
    if (startFilter || endFilter) {
      const { start, end } = parsePeriod(notice.reqstBeginEndDe ?? undefined);
      if (startFilter) {
        const startDate = new Date(startFilter);
        if (!start || start < startDate) return false;
      }
      if (endFilter) {
        const endDate = new Date(endFilter);
        if (!end || end > endDate) return false;
      }
    }
    return true;
  });

  const sorted = sortNotices(filtered, sort);
  const total = sorted.length;
  const offset = (page - 1) * pageSize;
  const paged = sorted.slice(offset, offset + pageSize);

  const items = paged.map((notice) => ({
    id: notice.id,
    title: notice.title,
    summary: notice.bsnsSumryCn,
    pubDate: notice.pubDate ? notice.pubDate.toISOString() : notice.creatPnttm ? notice.creatPnttm.toISOString() : null,
    deadline: notice.reqstBeginEndDe,
    organization: notice.jrsdInsttNm,
    category: notice.lcategory,
    tags: notice.tags.map((t) => ({ id: t.tag.id, name: t.tag.name })),
    bookmarked: notice.bookmarks.length > 0,
    bookmarkId: notice.bookmarks[0]?.id ?? null,
    inqireCo: notice.inqireCo,
  }));

  return Response.json({ items, total, page, pageSize });
}
