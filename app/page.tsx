"use client";

import { useCallback, useMemo, useState } from "react";
import { TagChip } from "@/components/tag-chip";

type BizinfoItem = {
  seq?: string;
  pblancId?: string;
  pblancNm?: string;
  title?: string;
  link?: string;
  pblancUrl?: string;
  jrsdInsttNm?: string;
  lclasCodeNm?: string;
  lcategory?: string;
  pldirSportRealmLclasCodeNm?: string;
  hashTag?: string;
  hashTags?: string;
  hashtags?: string;
  reqstBeginEndDe?: string;
  inqireCo?: string;
  bsnsSumryCn?: string;
  flpthNm?: string;
  printFlpthNm?: string;
  pubDate?: string;
  creatPnttm?: string;
};

function toArray<T>(maybeArray: T | T[] | undefined | null): T[] {
  if (!maybeArray) return [];
  return Array.isArray(maybeArray) ? maybeArray : [maybeArray];
}

export default function HomePage() {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageUnit, setPageUnit] = useState(50);
  const [searchLclasId, setSearchLclasId] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<BizinfoItem[]>([]);
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("pageIndex", String(pageIndex));
      params.set("pageUnit", String(pageUnit));
      if (searchLclasId.trim()) params.set("searchLclasId", searchLclasId.trim());
      if (hashtags.trim()) params.set("hashtags", hashtags.trim());

      const url = `/api/proxy?${params.toString()}`; // 로컬 프록시 호출로 CORS 회피
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: any = await res.json();
      // 다양한 응답 케이스를 모두 처리
      // 1) { jsonArray: { item: [...] } }
      // 2) { jsonArray: [...] }
      // 3) { item: [...] }
      let arr: BizinfoItem[] = [];
      const ja = (json as any)?.jsonArray;
      if (Array.isArray(ja?.item)) {
        arr = ja.item as BizinfoItem[];
      } else if (ja?.item) {
        arr = [ja.item as BizinfoItem];
      } else if (Array.isArray(ja)) {
        arr = ja as BizinfoItem[];
      } else if (Array.isArray((json as any)?.item)) {
        arr = (json as any).item as BizinfoItem[];
      } else if ((json as any)?.item) {
        arr = [((json as any).item as BizinfoItem)];
      } else {
        arr = [];
      }
      setItems(arr);
    } catch (e: any) {
      setError(e?.message ?? "알 수 없는 오류");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageUnit, searchLclasId, hashtags]);

  // 기간 종료일 파싱 및 D-Day 계산
  function parsePeriodEnd(value?: string) {
    if (!value) return null;
    const parts = value.split("~");
    if (parts.length < 2) return null;
    const end = parts[1].trim();
    if (/^\d{8}$/.test(end)) {
      const yyyy = end.slice(0, 4);
      const mm = end.slice(4, 6);
      const dd = end.slice(6, 8);
      return new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
    }
    return null;
  }

  function dDay(end: Date | null) {
    if (!end) return "-";
    const today = new Date();
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff > 0) return `D-${diff}`;
    if (diff === 0) return "D-Day";
    return `D+${Math.abs(diff)}`;
  }

  const rows = useMemo(() => {
    const base = items.map((it) => {
      const endDate = parsePeriodEnd(it.reqstBeginEndDe);
      // 태그 수집: hashtags/hashTags/hashTag + 카테고리 필드를 칩으로 함께 제공
      const tokenSources = [it.hashTags, it.hashtags, it.hashTag]
        .filter(Boolean)
        .map((s) => String(s));
      const categoryCandidates = [
        it.lclasCodeNm,
        it.lcategory,
        it.pldirSportRealmLclasCodeNm,
      ].filter(Boolean) as string[];
      const tagSet = new Set<string>();
      for (const src of tokenSources) {
        for (const t of src.split(",")) {
          const v = t.trim();
          if (v) tagSet.add(v.normalize("NFC"));
        }
      }
      for (const c of categoryCandidates) {
        const v = c.trim();
        if (v) tagSet.add(v.normalize("NFC"));
      }
      const tagList = Array.from(tagSet);
      const link = (() => {
        const raw = it.link || it.pblancUrl || "";
        if (!raw) return it.flpthNm || "";
        if (raw.startsWith("http")) return raw;
        if (raw.startsWith("/")) return `https://www.bizinfo.go.kr${raw}`;
        return raw;
      })();

      return {
        id: it.seq ?? it.pblancId ?? "",
        title: it.title || it.pblancNm || "제목 없음",
        org: it.jrsdInsttNm ?? "-",
        category: it.lclasCodeNm || it.lcategory || it.pldirSportRealmLclasCodeNm || "-",
        period: it.reqstBeginEndDe ?? "-",
        endDate,
        dday: dDay(endDate),
        views: it.inqireCo ?? "-",
        link,
        tags: tagList,
        thumb: it.printFlpthNm || it.flpthNm || "",
        summary: it.bsnsSumryCn || "",
      };
    });

    const q = query.trim().toLowerCase();
    const byQuery = q
      ? base.filter((r) =>
          [r.title, r.org, r.category, r.period, r.summary]
            .join(" ")
            .toLowerCase()
            .includes(q)
        )
      : base;

    const sel = selectedTags;
    const byTags = sel.length
      ? byQuery.filter((r) => sel.every((t) => r.tags.includes(t)))
      : byQuery;

    return byTags;
  }, [items, query, selectedTags]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) {
      const sources = [it.hashTags, it.hashtags, it.hashTag]
        .filter(Boolean)
        .map((s) => String(s));
      const categories = [
        it.lclasCodeNm,
        it.lcategory,
        it.pldirSportRealmLclasCodeNm,
      ].filter(Boolean) as string[];
      for (const src of sources) {
        for (const t of src.split(",")) {
          const v = t.trim();
          if (v) set.add(v.normalize("NFC"));
        }
      }
      for (const c of categories) {
        const v = c.trim();
        if (v) set.add(v.normalize("NFC"));
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ko"));
  }, [items]);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border p-4 shadow-sm bg-white dark:bg-neutral-950">
        <h2 className="mb-3 text-lg font-semibold">검색 파라미터</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-500">pageIndex</span>
            <input
              type="number"
              className="rounded border bg-white dark:bg-neutral-950 px-3 py-2"
              value={pageIndex}
              min={1}
              onChange={(e) => setPageIndex(parseInt(e.target.value || "1", 10))}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-500">pageUnit</span>
            <input
              type="number"
              className="rounded border bg-white dark:bg-neutral-950 px-3 py-2"
              value={pageUnit}
              min={1}
              max={200}
              onChange={(e) => setPageUnit(parseInt(e.target.value || "10", 10))}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-500">searchLclasId (대분류 코드)</span>
            <input
              className="rounded border bg-white dark:bg-neutral-950 px-3 py-2"
              value={searchLclasId}
              onChange={(e) => setSearchLclasId(e.target.value)}
              placeholder="예: 01, 02"
            />
          </label>
          <label className="flex flex-col gap-1 sm:col-span-2 lg:col-span-1">
            <span className="text-sm text-gray-500">hashtags (쉼표 구분)</span>
            <input
              className="rounded border bg-white dark:bg-neutral-950 px-3 py-2"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="예: 창업, 수출"
            />
          </label>
          <label className="flex flex-col gap-1 sm:col-span-2 lg:col-span-3">
            <span className="text-sm text-gray-500">빠른 검색(제목/기관/요약)</span>
            <input
              className="rounded border bg-white dark:bg-neutral-950 px-3 py-2"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="예: 반도체, 제주, 수출 전시회, 창업"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            onClick={fetchData}
            disabled={loading}
          >
            {loading ? "불러오는 중..." : "불러오기"}
          </button>
          {error && <span className="text-sm text-red-600">오류: {error}</span>}
          <button
            className="rounded border px-3 py-2 text-sm"
            onClick={() => {
              setQuery("");
              setSelectedTags([]);
            }}
          >
            검색 초기화
          </button>
        </div>
      </section>

      <section className="rounded-xl border bg-white dark:bg-neutral-950">
        <div className="border-b p-3">
          <h2 className="text-lg font-semibold">해시태그 전체</h2>
        </div>
        <div className="p-3 flex flex-wrap gap-2 max-h-56 overflow-auto">
          {allTags.map((t) => (
            <TagChip
              key={t}
              label={t}
              selected={selectedTags.includes(t)}
              onClick={() =>
                setSelectedTags((prev) =>
                  prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
                )
              }
            />
          ))}
          {allTags.length === 0 && (
            <span className="text-sm text-gray-500">불러온 데이터에서 태그를 찾을 수 없습니다.</span>
          )}
        </div>
      </section>

      <section className="rounded-xl border bg-white dark:bg-neutral-950">
        <div className="border-b p-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">검색 결과 ({rows.length}건)</h2>
          <div className="text-xs text-gray-500">카드 클릭 시 새 창으로 상세 이동</div>
        </div>
        <ul className="divide-y">
          {rows.map((r) => (
            <li key={r.id} className="p-4 transition hover:bg-gray-50/70 dark:hover:bg-neutral-900/60">
              <div className="flex gap-4">
                {r.thumb ? (
                  <img
                    src={String(r.thumb).split("@")[0]}
                    alt="thumb"
                    className="h-16 w-16 flex-none rounded-md object-cover ring-1 ring-gray-200 dark:ring-neutral-800"
                    onError={(e) => ((e.currentTarget.style.visibility = "hidden"))}
                  />
                ) : (
                  <div className="h-16 w-16 flex-none rounded-md bg-gray-100 dark:bg-neutral-800" />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={r.link || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-base font-semibold text-blue-700 hover:underline dark:text-blue-400"
                      title={r.title}
                    >
                      {r.title}
                    </a>
                    <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-700 ring-1 ring-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:ring-purple-800">
                      {r.category}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-800">
                      {r.org}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600 sm:grid-cols-4 dark:text-gray-300">
                    <div>
                      <span className="text-gray-400">신청기간</span>
                      <div>{r.period}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">마감</span>
                      <div className="inline-flex items-center gap-1">
                        <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[11px] text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
                          {r.dday}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">조회수</span>
                      <div>{r.views}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">태그</span>
                      <div className="line-clamp-1 break-words text-xs">
                        {r.tags.slice(0, 6).join(", ") || "-"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
          {rows.length === 0 && !loading && (
            <li className="p-6 text-center text-gray-500">조건에 맞는 결과가 없습니다. 필터를 조정해 보세요.</li>
          )}
        </ul>
      </section>

      {null}
    </div>
  );
}
