import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeTagName } from "@/lib/bizinfo";

/**
 * GET /api/tags - 모든 태그 반환.
 */
export async function GET() {
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
  return Response.json(tags.map((tag) => ({ id: tag.id, name: tag.name })));
}

/**
 * POST /api/tags - 태그 생성.
 */
export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name) {
    return new Response("name is required", { status: 400 });
  }
  const normalized = normalizeTagName(name);
  const tag = await prisma.tag.upsert({
    where: { name: normalized },
    update: {},
    create: { name: normalized },
  });
  return Response.json({ id: tag.id, name: tag.name });
}
