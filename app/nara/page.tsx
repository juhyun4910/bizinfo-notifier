"use client";

import { useCallback, useMemo, useState } from "react";
import { TagChip } from "@/components/tag-chip";
import type { NaraBidItem } from "@/lib/nara";

const currency = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} ${String(
    date.getHours(),
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatPeriod(start: string | null, end: string | null) {
  const startText = formatDate(start);
  const endText = formatDate(end);
  if (startText !== "-" && endText !== "-") return `${startText} ~ ${endText}`;
  return startText !== "-" ? startText : endText;
}

function dDay(target: string | null) {
  if (!target) return "-";
  const date = new Date(target);
  if (Number.isNaN(date.getTime())) return "-";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff > 0) return `D-${diff}`;
  if (diff === 0) return "D-Day";
  return `D+${Math.abs(diff)}`;
}

export default function NaraPage() {
  const now = new Date();
  const defaultEnd = new Date(now);
  defaultEnd.setMinutes(0, 0, 0);
  const defaultStart = new Date(defaultEnd);
  defaultStart.setDate(defaultStart.getDate() - 7);

  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [inqryDiv, setInqryDiv] = useState<"1" | "2">("1");
  const [start, setStart] = useState(toLocalInputValue(defaultStart));
  const [end, setEnd] = useState(toLocalInputValue(defaultEnd));
  const [bidName, setBidName] = useState("");
  const [noticeOrg, setNoticeOrg] = useState("");
  const [demandOrg, setDemandOrg] = useState("");
  const [refNo, setRefNo] = useState("");
  const [items, setItems] = useState<NaraBidItem[]>([]);
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(pageNo));
      params.set("pageSize", String(pageSize));
      params.set("inqryDiv", inqryDiv);
      if (start) params.set("start", start);
      if (end) params.set("end", end);
      if (bidName.trim()) params.set("bidNtceNm", bidName.trim());
      if (noticeOrg.trim()) params.set("ntceInsttNm", noticeOrg.trim());
      if (demandOrg.trim()) params.set("dminsttNm", demandOrg.trim());
      if (refNo.trim()) params.set("refNo", refNo.trim());

      const url = `/api/nara?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail?.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
      setTotal(Number(data.total ?? 0));
    } catch (err: any) {
      setError(err?.message ?? "목록을 불러오지 못했습니다.");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [pageNo, pageSize, inqryDiv, start, end, bidName, noticeOrg, demandOrg, refNo]);

  const rows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items
      .map((item) => {
        const tagSet = new Set<string>(item.tags ?? []);
        if (item.noticeType) tagSet.add(item.noticeType);
        if (item.method) tagSet.add(item.method);
        if (item.contract) tagSet.add(item.contract);
        if (item.regionLimit) tagSet.add(item.regionLimit);
        if (item.isInternational) tagSet.add("국제입찰");
        const tags = Array.from(tagSet).sort((a, b) => a.localeCompare(b, "ko"));
        const searchTarget = [
          item.title,
          item.organization,
          item.client,
          item.bidNo,
          item.referenceNo,
          tags.join(" "),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return {
          id: item.id,
          title: item.title,
          link: item.detailUrl ?? item.noticeUrl ?? "#",
          bidNo: item.bidNo,
          organization: item.organization ?? "-",
          client: item.client ?? "-",
          period: formatPeriod(item.bidBeginDate, item.bidEndDate),
          openDate: formatDate(item.openingDate),
          noticeDate: formatDate(item.noticeDate),
          dday: dDay(item.bidEndDate),
          budget: item.budget ?? item.estimate ?? null,
          tags,
          tagSet,
          searchTarget,
        };
      })
      .filter((row) => {
        if (normalizedQuery && !row.searchTarget.includes(normalizedQuery)) return false;
        if (selectedTags.length && !selectedTags.every((tag) => row.tagSet.has(tag))) return false;
        return true;
      });
  }, [items, query, selectedTags]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      for (const tag of item.tags ?? []) set.add(tag);
      if (item.noticeType) set.add(item.noticeType);
      if (item.method) set.add(item.method);
      if (item.contract) set.add(item.contract);
      if (item.regionLimit) set.add(item.regionLimit);
      if (item.isInternational) set.add("국제입찰");
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ko"));
  }, [items]);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-white p-4 shadow-sm dark:bg-neutral-950">
        <h2 className="mb-3 text-lg font-semibold">나라장터 검색 조건</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-500">페이지 번호</span>
            <input
              type="number"
              min={1}
              className="rounded border bg-white px-3 py-2 dark:bg-neutral-950"
              value={pageNo}
              onChange={(e) => setPageNo(parseInt(e.target.value || "1", 10))}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-500">페이지 크기 (1~100)</span>
            <input
              type="number"
              min={1}
              max={100}
              className="rounded border bg-white px-3 py-2 dark:bg-neutral-950"
              value={pageSize}
              onChange={(e) => setPageSize(parseInt(e.target.value || "10", 10))}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-500">조회 구분</span>
            <select
              className="rounded border bg-white px-3 py-2 dark:bg-neutral-950"
              value={inqryDiv}
              onChange={(e) => setInqryDiv(e.target.value === "2" ? "2" : "1")}
            >
              <option value="1">공고게시일시</option>
              <option value="2">개찰일시</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-500">조회 시작 (YYYY-MM-DDTHH:mm)</span>
            <input
              type="datetime-local"
              className="rounded border bg-white px-3 py-2 dark:bg-neutral-950"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-500">조회 종료 (YYYY-MM-DDTHH:mm)</span>
            <input
              type="datetime-local"
              className="rounded border bg-white px-3 py-2 dark:bg-neutral-950"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-500">공고명</span>
            <input
              className="rounded border bg-white px-3 py-2 dark:bg-neutral-950"
              value={bidName}
              onChange={(e) => setBidName(e.target.value)}
              placeholder="예: 학교 시설 공사"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-500">공고기관명</span>
            <input
              className="rounded border bg-white px-3 py-2 dark:bg-neutral-950"
              value={noticeOrg}
              onChange={(e) => setNoticeOrg(e.target.value)}
              placeholder="예: 조달청"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-500">수요기관명</span>
            <input
              className="rounded border bg-white px-3 py-2 dark:bg-neutral-950"
              value={demandOrg}
              onChange={(e) => setDemandOrg(e.target.value)}
              placeholder="예: 광주광역시교육청"
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2 lg:col-span-3">
            <span className="text-sm text-gray-500">참조번호 또는 식별 키워드</span>
            <input
              className="rounded border bg-white px-3 py-2 dark:bg-neutral-950"
              value={refNo}
              onChange={(e) => setRefNo(e.target.value)}
              placeholder="예: 기관 내부 참조 번호"
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2 lg:col-span-3">
            <span className="text-sm text-gray-500">결과 내 검색</span>
            <input
              className="rounded border bg-white px-3 py-2 dark:bg-neutral-950"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="제목, 기관, 태그 등"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            onClick={fetchData}
            disabled={loading}
          >
            {loading ? "불러오는 중..." : "공고 불러오기"}
          </button>
          <button
            className="rounded border px-3 py-2 text-sm"
            onClick={() => {
              setQuery("");
              setSelectedTags([]);
            }}
          >
            검색/태그 초기화
          </button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </section>

      <section className="rounded-xl border bg-white dark:bg-neutral-950">
        <div className="border-b p-3">
          <h2 className="text-lg font-semibold">태그 필터</h2>
        </div>
        <div className="flex max-h-56 flex-wrap gap-2 overflow-auto p-3">
          {allTags.map((tag) => (
            <TagChip
              key={tag}
              label={tag}
              selected={selectedTags.includes(tag)}
              onClick={() =>
                setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
              }
            />
          ))}
          {!allTags.length && <span className="text-sm text-gray-500">불러온 공고가 없으면 태그도 비어 있습니다.</span>}
        </div>
      </section>

      <section className="rounded-xl border bg-white dark:bg-neutral-950">
        <div className="flex items-center justify-between border-b p-4 text-sm text-gray-500">
          <div>
            총 {total.toLocaleString()}건 중 {rows.length.toLocaleString()}건 표시
          </div>
        </div>
        <ul className="divide-y">
          {rows.map((row) => (
            <li key={row.id} className="p-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={row.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-base font-semibold text-blue-600 hover:underline dark:text-blue-300"
                  >
                    {row.title}
                  </a>
                  {row.bidNo && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-neutral-800 dark:text-gray-300">
                      #{row.bidNo}
                    </span>
                  )}
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-700">
                    {row.organization}
                  </span>
                  <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-700 ring-1 ring-purple-200 dark:bg-purple-500/10 dark:text-purple-200 dark:ring-purple-800">
                    {row.client}
                  </span>
                </div>
                <div className="grid gap-3 text-sm text-gray-600 md:grid-cols-2 lg:grid-cols-4 dark:text-gray-300">
                  <div>
                    <span className="text-gray-400">입찰 기간</span>
                    <div className="mt-1">{row.period}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">개찰 일시</span>
                    <div className="mt-1">{row.openDate}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">공고 등록</span>
                    <div className="mt-1">{row.noticeDate}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">마감 D-Day</span>
                    <div className="mt-1 inline-flex items-center gap-1">
                      <span className="rounded bg-orange-100 px-2 py-0.5 text-xs text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
                        {row.dday}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">예산/추정가격</span>
                    <div className="mt-1">{row.budget ? currency.format(row.budget) : "-"}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {row.tags.map((tag) => (
                    <TagChip key={`${row.id}-${tag}`} label={tag} />
                  ))}
                  {!row.tags.length && <span className="text-xs text-gray-400">태그 없음</span>}
                </div>
              </div>
            </li>
          ))}
          {!rows.length && !loading && (
            <li className="p-6 text-center text-sm text-gray-500">조건에 맞는 공고가 없습니다. 검색 조건을 조정해보세요.</li>
          )}
          {loading && <li className="p-6 text-center text-sm text-gray-500">불러오는 중...</li>}
        </ul>
      </section>
    </div>
  );
}
