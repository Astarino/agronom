import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await prisma.user.findFirst();
  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const data = await req.json();
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({ data: { ...data, id: "default-user" } });
  } else {
    user = await prisma.user.update({ where: { id: user.id }, data });
  }
  return NextResponse.json(user);
}
