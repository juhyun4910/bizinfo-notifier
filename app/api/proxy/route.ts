import { NextRequest } from "next/server";

// 기업마당 API 프록시: 브라우저 CORS 회피 및 API 키 보호
// - 클라이언트는 /api/proxy 로만 호출합니다.
// - 서버에서 환경변수 BIZINFO_API_KEY 를 읽어 외부 API를 호출합니다.
// - 쿼리 파라미터(searchLclasId, hashtags, pageUnit, pageIndex 등)는 그대로 전달합니다.

const BIZINFO_BASE = "https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // 입력 파라미터 수집 (화이트리스트)
  const whitelist = [
    "searchCnt",
    "searchLclasId",
    "hashtags",
    "pageUnit",
    "pageIndex",
  ];

  // API 키: 쿼리로 전달하지 않으면 서버 환경변수 사용
  const keyFromQuery = searchParams.get("crtfcKey");
  const apiKey = keyFromQuery || process.env.BIZINFO_API_KEY || "21Ya48";

  const upstreamParams = new URLSearchParams();
  upstreamParams.set("crtfcKey", apiKey);
  upstreamParams.set("dataType", "json"); // JSON 고정 반환

  for (const name of whitelist) {
    const v = searchParams.get(name);
    if (v !== null && v !== undefined && v !== "") upstreamParams.set(name, v);
  }

  const upstreamUrl = `${BIZINFO_BASE}?${upstreamParams.toString()}`;

  try {
    const res = await fetch(upstreamUrl, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return Response.json(
        { error: "Upstream error", status: res.status, body: text },
        { status: res.status }
      );
    }

    const data = await res.json();
    return Response.json(data, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err: any) {
    return Response.json(
      { error: err?.message ?? "Network error" },
      { status: 502 }
    );
  }
}

