import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();
  const level = await prisma.shelfLevel.update({ where: { id }, data });
  return NextResponse.json(level);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.shelfLevel.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
