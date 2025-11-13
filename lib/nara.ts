const KST_OFFSET = "+09:00";

function injectDelimiters(value: string, withSeconds = true): string {
  if (value.length === 8) {
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T00:00:00`;
  }
  if (value.length === 12) {
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(8, 10)}:${value.slice(10, 12)}:${withSeconds ? "00" : ""}`;
  }
  if (value.length === 14) {
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(8, 10)}:${value.slice(10, 12)}:${value.slice(12, 14)}`;
  }
  return value;
}

function toIsoString(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;

  let normalized = trimmed.replace(/\./g, "-").replace(" ", "T");

  if (/^\d{8}$/.test(trimmed) || /^\d{12}$/.test(trimmed) || /^\d{14}$/.test(trimmed)) {
    normalized = injectDelimiters(trimmed);
  }

  const hasTime = normalized.includes("T");
  const needsOffset = !/[zZ]|[+-]\d{2}:?\d{2}$/.test(normalized);
  const withOffset = needsOffset ? `${normalized}${hasTime ? "" : "T00:00:00"}${KST_OFFSET}` : normalized;
  const date = new Date(withOffset);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function toNumber(value?: string | number | null): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const normalized = value.replace(/,/g, "").trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function safeString(value?: string | null): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : null;
}

export interface NaraBidItem {
  id: string;
  bidNo: string | null;
  bidOrder: string | null;
  title: string;
  noticeDate: string | null;
  bidBeginDate: string | null;
  bidEndDate: string | null;
  openingDate: string | null;
  organization: string | null;
  client: string | null;
  method: string | null;
  contract: string | null;
  noticeType: string | null;
  registerType: string | null;
  detailUrl: string | null;
  noticeUrl: string | null;
  isInternational: boolean;
  budget: number | null;
  estimate: number | null;
  regionLimit: string | null;
  referenceNo: string | null;
  telephone: string | null;
  tags: string[];
}

export function normalizeNaraBid(raw: Record<string, any>): NaraBidItem {
  const bidNo = safeString(raw.bidNtceNo);
  const bidOrder = safeString(raw.bidNtceOrd);
  const tags = new Set<string>();

  const pushTag = (value?: string | null) => {
    const clean = safeString(value);
    if (clean) tags.add(clean);
  };

  pushTag(raw.ntceKindNm);
  pushTag(raw.bidMethdNm);
  pushTag(raw.cntrctCnclsMthdNm);
  pushTag(raw.rgstTyNm);
  pushTag(raw.chargerInsttNm);
  if (String(raw.intrbidYn ?? "").toUpperCase() === "Y") {
    tags.add("국제입찰");
  }
  if (safeString(raw.prtcptLmtRgnNm)) {
    tags.add(`지역제한:${safeString(raw.prtcptLmtRgnNm)}`);
  }

  const idBase = [bidNo, bidOrder].filter(Boolean).join("_");

  return {
    id: idBase || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    bidNo,
    bidOrder,
    title: safeString(raw.bidNtceNm) ?? safeString(raw.bidNtceSj) ?? "입찰공고",
    noticeDate: toIsoString(raw.bidNtceDt ?? raw.pblancDate),
    bidBeginDate: toIsoString(raw.bidBeginDt),
    bidEndDate: toIsoString(raw.bidClseDt),
    openingDate: toIsoString(raw.opengDt),
    organization: safeString(raw.ntceInsttNm),
    client: safeString(raw.dminsttNm),
    method: safeString(raw.bidMethdNm),
    contract: safeString(raw.cntrctCnclsMthdNm),
    noticeType: safeString(raw.ntceKindNm),
    registerType: safeString(raw.rgstTyNm),
    detailUrl: safeString(raw.bidNtceDtlUrl),
    noticeUrl: safeString(raw.bidNtceUrl ?? raw.bidNtceDtlUrl),
    isInternational: String(raw.intrbidYn ?? "").toUpperCase() === "Y",
    budget: toNumber(raw.asignBdgtAmt),
    estimate: toNumber(raw.presmptPrce),
    regionLimit: safeString(raw.prtcptLmtRgnNm),
    referenceNo: safeString(raw.refNo),
    telephone: safeString(raw.ntceInsttOfclTelNo),
    tags: Array.from(tags).sort((a, b) => a.localeCompare(b, "ko")),
  };
}

export function formatNaraDateParam(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\d{12}$/.test(trimmed)) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length >= 12) return digits.slice(0, 12);
  return null;
}
