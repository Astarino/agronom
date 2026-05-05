import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { archiveContainerCycle } from "@/lib/history";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shelf = await prisma.shelf.findUnique({
    where: { id },
    include: {
      levels: {
        orderBy: { levelNumber: "asc" },
        include: {
          trays: {
            orderBy: { position: "asc" },
            include: {
              containers: { orderBy: { position: "asc" }, include: { species: true } },
            },
          },
        },
      },
    },
  });
  if (!shelf) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(shelf);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();
  const shelf = await prisma.shelf.update({ where: { id }, data });
  return NextResponse.json(shelf);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shelf = await prisma.shelf.findUnique({
    where: { id },
    include: {
      levels: { include: { trays: { include: { containers: { select: { id: true } } } } } },
    },
  });

  if (!shelf) return NextResponse.json({ error: "Not found" }, { status: 404 });

  for (const level of shelf.levels) {
    for (const tray of level.trays) {
      for (const container of tray.containers) {
        await archiveContainerCycle(container.id);
      }
    }
  }

  await prisma.shelf.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
