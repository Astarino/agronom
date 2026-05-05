import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { archiveContainerCycle } from "@/lib/history";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();
  const level = await prisma.shelfLevel.update({ where: { id }, data });
  return NextResponse.json(level);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const level = await prisma.shelfLevel.findUnique({
    where: { id },
    include: { trays: { include: { containers: { select: { id: true } } } } },
  });

  if (!level) return NextResponse.json({ error: "Not found" }, { status: 404 });

  for (const tray of level.trays) {
    for (const container of tray.containers) {
      await archiveContainerCycle(container.id);
    }
  }

  await prisma.shelfLevel.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
