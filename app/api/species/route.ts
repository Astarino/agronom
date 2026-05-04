import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const species = await prisma.species.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(species);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const species = await prisma.species.create({ data });
  return NextResponse.json(species, { status: 201 });
}
