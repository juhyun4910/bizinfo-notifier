import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/tags/:id - 태그 삭제.
 */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return new Response("Invalid id", { status: 400 });
  }
  await prisma.noticeTag.deleteMany({ where: { tagId: id } });
  await prisma.tag.delete({ where: { id } });
  return Response.json({ ok: true });
}
