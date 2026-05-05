import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { archiveContainerCycle } from "@/lib/history";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tray = await prisma.tray.findUnique({
    where: { id },
    include: { containers: { select: { id: true } } },
  });

  if (!tray) return NextResponse.json({ error: "Not found" }, { status: 404 });

  for (const container of tray.containers) {
    await archiveContainerCycle(container.id);
  }

  await prisma.tray.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
