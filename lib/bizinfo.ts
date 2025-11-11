import axios from "axios";
import { differenceInMilliseconds, parse, parseISO } from "date-fns";
import { AUTO_TAG_KEYWORDS } from "./constants";

export interface BizinfoItem {
  seq?: string;
  pblancId?: string;
  title?: string;
  link?: string;
  pblancUrl?: string;
  jrsdInsttNm?: string;
  lclasCodeNm?: string;
  hashTag?: string;
  reqstBeginEndDe?: string;
  inqireCo?: string;
  bsnsSumryCn?: string;
  flpthNm?: string;
  pubDate?: string;
  creatPnttm?: string;
}

const BASE_URL = "https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do";

/**
 * 기업마당 API 페이지를 호출한다. 5xx/429 발생 시 지수 백오프로 재시도한다.
 * - 보안 주석: API 키는 서버 환경변수에서만 읽으며, 클라이언트에 절대 노출되지 않아야 한다.
 */
export async function fetchPage(
  params: Record<string, string | number | undefined>,
  retry = 0
): Promise<BizinfoItem[]> {
  const apiKey = process.env.BIZINFO_API_KEY ?? "21Ya48";
  const searchParams = new URLSearchParams({
    crtfcKey: apiKey,
    dataType: "json",
  });
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).length > 0) {
      searchParams.set(key, String(value));
    }
  });

  try {
    const response = await axios.get(BASE_URL, { params: searchParams });
    const json = response.data;
    const items: BizinfoItem[] = json?.jsonArray?.item ?? [];
    return Array.isArray(items) ? items : items ? [items] : [];
  } catch (error: any) {
    const status = error?.response?.status;
    if (retry < 3 && (status === 429 || (status >= 500 && status < 600))) {
      const backoff = Math.pow(2, retry) * 500; // 0.5s, 1s, 2s
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return fetchPage(params, retry + 1);
    }
    throw error;
  }
}

/**
 * 여러 페이지를 순차적으로 호출한다. API 레이트리밋을 고려해 순차 처리한다.
 */
export async function fetchAllPages({
  pages,
  pageUnit,
  searchLclasId,
  hashtags,
}: {
  pages: number;
  pageUnit: number;
  searchLclasId?: string;
  hashtags?: string;
}) {
  const all: BizinfoItem[] = [];
  for (let pageIndex = 1; pageIndex <= pages; pageIndex += 1) {
    const items = await fetchPage({
      pageIndex,
      pageUnit,
      searchLclasId,
      hashtags,
    });
    all.push(...items);
  }
  return all;
}

/**
 * 문자열 날짜를 Date 객체로 변환한다.
 * - "YYYY-MM-DD HH:mm:ss" 또는 "YYYYMMDD" 포맷을 지원한다.
 */
export function parseDate(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.includes("-")) {
    try {
      return parse(trimmed, "yyyy-MM-dd HH:mm:ss", new Date());
    } catch (error) {
      try {
        return parseISO(trimmed);
      } catch {
        return null;
      }
    }
  }
  if (/^\d{8}$/.test(trimmed)) {
    return parse(trimmed, "yyyyMMdd", new Date());
  }
  return null;
}

/**
 * 기간 문자열(YYYYMMDD ~ YYYYMMDD)을 파싱하여 시작/종료 Date를 반환한다.
 */
export function parsePeriod(value?: string | null) {
  if (!value) return { start: null, end: null };
  const [startRaw, endRaw] = value.split("~").map((v) => v.trim());
  return { start: parseDate(startRaw), end: parseDate(endRaw) };
}

/**
 * 태그 문자열을 NFC 정규화하고 공백을 제거한다.
 * - 보안/운영 주석: 한글 조합문자는 NFC로 통일하지 않으면 동일 태그가 다른 문자열로 저장되는 문제가 발생한다.
 */
export function normalizeTags(tags: (string | null | undefined)[]) {
  return Array.from(
    new Set(
      tags
        .map((tag) => tag?.trim())
        .filter((tag): tag is string => Boolean(tag))
        .map((tag) => normalizeTagName(tag))
    )
  );
}

/**
 * 태그명 정규화: NFC 및 영문 소문자화 처리.
 */
export function normalizeTagName(tag: string) {
  const nfc = tag.normalize("NFC");
  return /[A-Z]/.test(nfc) ? nfc.toLowerCase() : nfc;
}

/**
 * 제목/요약에서 특정 키워드를 추출하여 태그로 사용한다.
 */
export function extractKeywordsFromTitle(...texts: (string | null | undefined)[]) {
  const normalizedText = texts.filter(Boolean).join(" ");
  const found = new Set<string>();
  for (const keyword of AUTO_TAG_KEYWORDS) {
    if (normalizedText.includes(keyword)) {
      found.add(keyword);
    }
  }
  return Array.from(found);
}

/**
 * 마감 기한이 가까운 순으로 정렬하기 위해 기간 문자열에서 종료일 타임스탬프를 추출한다.
 */
export function computeDeadlineKey(period?: string | null) {
  const { end } = parsePeriod(period);
  return end ? end.getTime() : Number.POSITIVE_INFINITY;
}

/**
 * 조회수 기반 인기 정렬에서 동일 조회수일 때 최신순 정렬을 돕는 보조 키.
 */
export function computeStaleKey(pubDate?: Date | null, fallback?: Date | null) {
  const base = pubDate ?? fallback ?? null;
  return base ? differenceInMilliseconds(new Date(), base) : Number.MAX_SAFE_INTEGER;
}
