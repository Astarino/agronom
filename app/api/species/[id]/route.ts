import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const species = await prisma.species.findUnique({ where: { id } });
  if (!species) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(species);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();
  const species = await prisma.species.update({ where: { id }, data });
  return NextResponse.json(species);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.species.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
