import { NextRequest } from "next/server";
import { importNotices } from "@/lib/importer";

/**
 * POST /api/import
 * 기업마당 API에서 공고를 불러와 데이터베이스에 업서트한다.
 * - 보안 주석: 외부 API 키는 서버 환경변수를 통해서만 접근하며, 클라이언트 번들에 포함되면 남용 위험이 크다.
 * - 운영 주석: 외부 API는 일시적 장애나 레이트 리밋이 있을 수 있으므로 fetchAllPages에서 지수 백오프를 적용한다.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const {
    searchLclasId,
    hashtags,
    pages = 3,
    pageUnit = 100,
  }: { searchLclasId?: string; hashtags?: string; pages?: number; pageUnit?: number } = body;

  const result = await importNotices({ searchLclasId, hashtags, pages, pageUnit });

  return Response.json(result);
}
