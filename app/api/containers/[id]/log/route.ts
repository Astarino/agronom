import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const logs = await prisma.growthLog.findMany({
    where: { containerId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { action, notes, stage } = await req.json();

  const container = await prisma.container.findUnique({ where: { id } });
  if (!container) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const log = await prisma.growthLog.create({
    data: {
      containerId: id,
      action,
      notes,
      stage: stage ?? container.stage,
    },
  });

  return NextResponse.json(log, { status: 201 });
}
