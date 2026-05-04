import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { levelId } = await req.json();

  const existing = await prisma.tray.findMany({ where: { levelId } });
  if (existing.length >= 2) {
    return NextResponse.json({ error: "Max 2 trays per level" }, { status: 400 });
  }

  const tray = await prisma.tray.create({
    data: {
      levelId,
      position: existing.length + 1,
      containers: {
        create: [{ position: 1 }, { position: 2 }, { position: 3 }, { position: 4 }],
      },
    },
  });

  return NextResponse.json(tray, { status: 201 });
}
