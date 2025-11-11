import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeTagName, parsePeriod } from "@/lib/bizinfo";
import { sortNotices } from "@/lib/sorters";

/**
 * POST /api/bookmarks
 * 북마크를 생성하거나 기존 북마크를 반환한다.
 */
export async function POST(req: NextRequest) {
  const { noticeId } = await req.json();
  if (!noticeId) {
    return new Response("noticeId is required", { status: 400 });
  }
  const existing = await prisma.bookmark.findFirst({ where: { noticeId } });
  if (existing) {
    return Response.json({ ok: true, id: existing.id });
  }
  const created = await prisma.bookmark.create({ data: { noticeId } });
  return Response.json({ ok: true, id: created.id });
}

/**
 * GET /api/bookmarks
 * 북마크 목록을 공고 정보와 함께 반환한다.
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

  const bookmarks = await prisma.bookmark.findMany({
    include: {
      notice: {
        include: { tags: { include: { tag: true } }, bookmarks: true },
      },
    },
  });

  const filteredNotices = bookmarks
    .map((bookmark) => bookmark.notice)
    .filter((notice) => {
      if (q && !((notice.title?.includes(q) ?? false) || (notice.bsnsSumryCn?.includes(q) ?? false))) {
        return false;
      }
      if (lcategory && notice.lcategory !== lcategory) {
        return false;
      }
      if (jrsdInsttNm && !(notice.jrsdInsttNm?.includes(jrsdInsttNm) ?? false)) {
        return false;
      }
      if (tagFilters.length) {
        const names = new Set(notice.tags.map((t) => t.tag.name));
        for (const tag of tagFilters) {
          if (!names.has(tag)) return false;
        }
      }
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

  const sorted = sortNotices(filteredNotices, sort);
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
    bookmarked: true,
    bookmarkId: notice.bookmarks[0]?.id ?? null,
    inqireCo: notice.inqireCo,
  }));

  return Response.json({ items, total, page, pageSize });
}
