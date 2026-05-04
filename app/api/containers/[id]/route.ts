import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const container = await prisma.container.findUnique({
    where: { id },
    include: {
      species: true,
      logs: { orderBy: { createdAt: "desc" } },
      tray: { include: { level: { include: { shelf: true } } } },
    },
  });
  if (!container) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(container);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();

  // Clear datetime fields if stage reset to EMPTY
  if (data.stage === "EMPTY") {
    data.plantedAt = null;
    data.darkPhaseStarted = null;
    data.lightPhaseStarted = null;
    data.harvestedAt = null;
    data.speciesId = null;
  }

  const container = await prisma.container.update({ where: { id }, data });
  return NextResponse.json(container);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.container.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
