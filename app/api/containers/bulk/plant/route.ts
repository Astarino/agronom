import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildStageChangeMessage } from "@/lib/notifications";

const MAX_BULK_CONTAINERS = 100;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const containerIds: string[] = Array.isArray(body?.containerIds)
    ? Array.from(new Set<string>(
        body.containerIds.filter((id: unknown): id is string => typeof id === "string")
      ))
    : [];
  const speciesId = typeof body?.speciesId === "string" ? body.speciesId : "";
  const notes = typeof body?.notes === "string" ? body.notes.trim().slice(0, 1000) : "";
  const emoji = typeof body?.emoji === "string" ? body.emoji.trim().slice(0, 16) : "";
  const eventAt = new Date(body?.eventAt);

  if (!containerIds.length || containerIds.length > MAX_BULK_CONTAINERS) {
    return NextResponse.json({ error: "Выберите от 1 до 100 контейнеров" }, { status: 400 });
  }
  if (!speciesId) {
    return NextResponse.json({ error: "Выберите вид растения" }, { status: 400 });
  }
  if (Number.isNaN(eventAt.getTime())) {
    return NextResponse.json({ error: "Некорректная дата посева" }, { status: 400 });
  }

  const [species, containers, user] = await Promise.all([
    prisma.species.findUnique({ where: { id: speciesId } }),
    prisma.container.findMany({
      where: { id: { in: containerIds } },
      include: { tray: { include: { level: { include: { shelf: true } } } } },
    }),
    prisma.user.findFirst(),
  ]);

  if (!species) {
    return NextResponse.json({ error: "Вид растения не найден" }, { status: 404 });
  }
  if (containers.length !== containerIds.length) {
    return NextResponse.json({ error: "Некоторые контейнеры не найдены" }, { status: 404 });
  }

  const occupied = containers.filter((container) => container.stage !== "EMPTY");
  if (occupied.length) {
    return NextResponse.json(
      { error: `${occupied.length} выбранных контейнеров уже заняты. Обновите страницу и повторите.` },
      { status: 409 }
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      const updateResult = await tx.container.updateMany({
        where: { id: { in: containerIds }, stage: "EMPTY" },
        data: {
          stage: "PREPARATION",
          speciesId,
          plantedAt: eventAt,
          notes: notes || null,
          emoji: emoji || null,
        },
      });

      if (updateResult.count !== containerIds.length) {
        throw new Error("CONTAINERS_CHANGED");
      }

      await tx.growthLog.createMany({
        data: containers.map((container) => ({
          containerId: container.id,
          action: "Массовая посадка: EMPTY → PREPARATION",
          notes: notes || null,
          stage: "PREPARATION",
          createdAt: eventAt,
        })),
      });

      if (user) {
        await tx.notificationSchedule.createMany({
          data: containers.map((container) => ({
            userId: user.id,
            containerId: container.id,
            type: "STAGE_CHANGE",
            message: buildStageChangeMessage(
              species.name,
              "PREPARATION",
              container.tray.level.shelf.name,
              container.tray.level.levelNumber
            ),
            scheduledAt: eventAt,
          })),
        });
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === "CONTAINERS_CHANGED") {
      return NextResponse.json(
        { error: "Состав контейнеров изменился. Обновите страницу и повторите." },
        { status: 409 }
      );
    }
    throw error;
  }

  return NextResponse.json({ ok: true, planted: containerIds.length });
}
