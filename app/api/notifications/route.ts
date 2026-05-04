import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const notifications = await prisma.notificationSchedule.findMany({
    orderBy: { scheduledAt: "asc" },
    include: { container: { include: { species: true } } },
  });
  return NextResponse.json(notifications);
}

export async function POST(req: NextRequest) {
  const { userId, containerId, type, message, scheduledAt } = await req.json();
  const notification = await prisma.notificationSchedule.create({
    data: { userId, containerId, type, message, scheduledAt: new Date(scheduledAt) },
  });
  return NextResponse.json(notification, { status: 201 });
}
