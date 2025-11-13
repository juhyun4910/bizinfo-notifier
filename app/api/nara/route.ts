import { NextRequest } from "next/server";
import { formatNaraDateParam, normalizeNaraBid } from "@/lib/nara";

const BASE_URL = "https://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoCnstwkPPSSrch";
const DEFAULT_DECODED_KEY = "q2HVAspWsjmDqvN0Ij315KOUZWqIZZBEYU0UILXrn0C/VIM2zB2WYQJWiMFDe9DZMMfWYcpFeRxWn3o2bX51Bw==";
const DEFAULT_ENCODED_KEY = "q2HVAspWsjmDqvN0Ij315KOUZWqIZZBEYU0UILXrn0C%2FVIM2zB2WYQJWiMFDe9DZMMfWYcpFeRxWn3o2bX51Bw%3D%3D";

function decodeIfNeeded(key: string) {
  if (!key.includes("%")) return key;
  try {
    return decodeURIComponent(key);
  } catch {
    return key;
  }
}

function resolveServiceKey(): string | null {
  const encoded = process.env.NARA_API_KEY_ENCODED ?? process.env.NARA_API_KEY_URL ?? null;
  if (encoded) return decodeIfNeeded(encoded);

  const decoded = process.env.NARA_API_KEY ?? process.env.NARA_API_KEY_DECODED ?? null;
  if (decoded) return decoded;

  if (DEFAULT_ENCODED_KEY) return decodeIfNeeded(DEFAULT_ENCODED_KEY);
  if (DEFAULT_DECODED_KEY) return DEFAULT_DECODED_KEY;
  return null;
}

const passthroughParams = [
  "bidNtceNm",
  "ntceInsttNm",
  "ntceInsttCd",
  "dminsttNm",
  "dminsttCd",
  "bidNtceNo",
  "bidNtceOrd",
  "refNo",
  "prtcptLmtRgnCd",
  "indstrytyCd",
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));
  const inqryDiv = searchParams.get("inqryDiv") === "2" ? "2" : "1";
  const start = formatNaraDateParam(searchParams.get("start"));
  const end = formatNaraDateParam(searchParams.get("end"));

  if (!start || !end) {
    return Response.json({ error: "조회 시작/종료 일시를 YYYY-MM-DDTHH:mm 형식으로 입력해주세요." }, { status: 400 });
  }

  const serviceKey = resolveServiceKey();
  if (!serviceKey) {
    return Response.json({ error: "나라장터 API Key가 설정되지 않았습니다." }, { status: 500 });
  }

  const params = new URLSearchParams();
  params.set("ServiceKey", serviceKey);
  params.set("type", "json");
  params.set("numOfRows", String(pageSize));
  params.set("pageNo", String(page));
  params.set("inqryDiv", inqryDiv);
  params.set("inqryBgnDt", start);
  params.set("inqryEndDt", end);

  for (const key of passthroughParams) {
    const value = searchParams.get(key);
    if (value !== null && value !== undefined && value !== "") {
      params.set(key, value);
    }
  }

  const upstreamUrl = `${BASE_URL}?${params.toString()}`;

  try {
    const res = await fetch(upstreamUrl, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const rawText = await res.text().catch(() => "");
    if (!res.ok) {
      try {
        const parsed = JSON.parse(rawText);
        const header = parsed?.response?.header;
        if (header?.resultMsg) {
          return Response.json({ error: header.resultMsg, code: header.resultCode ?? String(res.status) }, { status: res.status });
        }
      } catch {
        // ignore parse error
      }
      return Response.json({ error: rawText || `Upstream HTTP ${res.status}` }, { status: res.status });
    }

    const data = rawText ? JSON.parse(rawText) : null;
    const response = data?.response;
    const header = response?.header;

    if (!response || header?.resultCode === undefined) {
      return Response.json({ error: "잘못된 응답 형식입니다." }, { status: 502 });
    }

    if (header.resultCode !== "00") {
      return Response.json(
        { error: header.resultMsg ?? "나라장터 API 오류", code: header.resultCode },
        { status: 502 },
      );
    }

    const body = response.body ?? {};
    const total = Number(body.totalCount ?? 0);
    const itemsRaw = body.items?.item ?? body.items ?? [];
    const rows = Array.isArray(itemsRaw) ? itemsRaw : itemsRaw ? [itemsRaw] : [];
    const items = rows.map((item: any) => normalizeNaraBid(item ?? {}));

    return Response.json({
      items,
      total,
      page,
      pageSize,
      inqryDiv,
    });
  } catch (error: any) {
    return Response.json({ error: error?.message ?? "요청 처리 중 오류가 발생했습니다." }, { status: 502 });
  }
}
