import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { shelfId } = await req.json();

  const existing = await prisma.shelfLevel.findMany({ where: { shelfId }, orderBy: { levelNumber: "asc" } });
  const nextNumber = existing.length + 1;

  const level = await prisma.shelfLevel.create({
    data: {
      shelfId,
      levelNumber: nextNumber,
      trays: {
        create: [
          { position: 1, containers: { create: [{ position: 1 }, { position: 2 }, { position: 3 }, { position: 4 }] } },
          { position: 2, containers: { create: [{ position: 1 }, { position: 2 }, { position: 3 }, { position: 4 }] } },
        ],
      },
    },
  });

  return NextResponse.json(level, { status: 201 });
}
