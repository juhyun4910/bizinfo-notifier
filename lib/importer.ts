import { prisma } from "@/lib/prisma";
import { extractKeywordsFromTitle, fetchAllPages, normalizeTagName, normalizeTags, parseDate } from "@/lib/bizinfo";

interface ImportOptions {
  searchLclasId?: string;
  hashtags?: string;
  pages?: number;
  pageUnit?: number;
}

/**
 * 기업마당 데이터를 불러와 Notice/Tag 테이블에 업서트한다.
 */
export async function importNotices({ searchLclasId, hashtags, pages = 3, pageUnit = 100 }: ImportOptions) {
  const items = await fetchAllPages({ pages, pageUnit, searchLclasId, hashtags });
  let saved = 0;
  let updated = 0;
  let skipped = 0;

  for (const item of items) {
    const id = item.seq ?? item.pblancId;
    if (!id) {
      skipped += 1;
      continue;
    }

    const existing = await prisma.notice.findUnique({ where: { id } });
    const tagsFromApi = normalizeTags((item.hashTag ?? "").split(","));
    const autoKeywords = extractKeywordsFromTitle(item.title, item.bsnsSumryCn);
    const mergedTags = normalizeTags([...tagsFromApi, ...autoKeywords]);

    const data = {
      title: item.title ?? "제목 미상",
      link: item.link,
      pblancUrl: item.pblancUrl,
      jrsdInsttNm: item.jrsdInsttNm,
      lcategory: item.lclasCodeNm,
      hashTagsRaw: item.hashTag,
      reqstBeginEndDe: item.reqstBeginEndDe,
      pubDate: parseDate(item.pubDate) ?? parseDate(item.creatPnttm ?? undefined),
      creatPnttm: parseDate(item.creatPnttm ?? undefined),
      inqireCo: item.inqireCo ? Number(item.inqireCo) : null,
      bsnsSumryCn: item.bsnsSumryCn,
      flpthNm: item.flpthNm,
    };

    if (existing) {
      await prisma.notice.update({ where: { id }, data });
      updated += 1;
      await prisma.noticeTag.deleteMany({ where: { noticeId: id } });
    } else {
      await prisma.notice.create({ data: { id, ...data } });
      saved += 1;
    }

    for (const rawName of mergedTags) {
      const normalized = normalizeTagName(rawName);
      const tag = await prisma.tag.upsert({
        where: { name: normalized },
        update: {},
        create: { name: normalized },
      });
      await prisma.noticeTag.upsert({
        where: { noticeId_tagId: { noticeId: id, tagId: tag.id } },
        update: {},
        create: { noticeId: id, tagId: tag.id },
      });
    }
  }

  return { saved, updated, skipped };
}
