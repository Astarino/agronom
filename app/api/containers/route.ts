import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stage = searchParams.get("stage");

  const containers = await prisma.container.findMany({
    where: stage ? { stage } : undefined,
    include: {
      species: true,
      tray: { include: { level: { include: { shelf: true } } } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(containers);
}

export async function POST(req: NextRequest) {
  const { trayId, position } = await req.json();
  const container = await prisma.container.create({
    data: { trayId, position },
  });
  return NextResponse.json(container, { status: 201 });
}
