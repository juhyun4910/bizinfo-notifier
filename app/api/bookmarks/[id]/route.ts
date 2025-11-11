import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/bookmarks/:id
 * 북마크를 삭제한다.
 */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return new Response("Invalid id", { status: 400 });
  }
  await prisma.bookmark.delete({ where: { id } });
  return Response.json({ ok: true });
}
