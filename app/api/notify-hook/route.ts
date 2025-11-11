import { NextRequest } from "next/server";

/**
 * POST /api/notify-hook
 * 향후 알림톡 대행사 API 연동을 위한 확장 포인트.
 * - 운영 주석: 저장 이벤트 → 태그 매칭 → notify-hook 큐/워커 순으로 확장할 수 있도록 자리만 마련한다.
 */
export async function POST(req: NextRequest) {
  const payload = await req.json();
  console.log("[notify-hook] payload", payload);
  return Response.json({ ok: true });
}
