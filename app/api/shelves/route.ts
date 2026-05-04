import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const shelves = await prisma.shelf.findMany({
    include: { levels: { include: { trays: { include: { containers: { include: { species: true } } } } } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(shelves);
}

export async function POST(req: NextRequest) {
  const { name, levels = 3 } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const user = await prisma.user.findFirst();
  if (!user) return NextResponse.json({ error: "No user" }, { status: 400 });

  const levelData = Array.from({ length: levels }, (_, i) => ({
    levelNumber: i + 1,
    trays: {
      create: [
        { position: 1, containers: { create: [{ position: 1 }, { position: 2 }, { position: 3 }, { position: 4 }] } },
        { position: 2, containers: { create: [{ position: 1 }, { position: 2 }, { position: 3 }, { position: 4 }] } },
      ],
    },
  }));

  const shelf = await prisma.shelf.create({
    data: { name, userId: user.id, levels: { create: levelData } },
    include: { levels: true },
  });

  return NextResponse.json(shelf, { status: 201 });
}
