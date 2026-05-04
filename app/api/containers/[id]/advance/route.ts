import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { STAGE_ORDER, GrowthStage } from "@/lib/utils";
import { scheduleNotification, buildStageChangeMessage, buildHarvestMessage } from "@/lib/notifications";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { speciesId } = await req.json().catch(() => ({}));

  const container = await prisma.container.findUnique({
    where: { id },
    include: {
      species: true,
      tray: { include: { level: { include: { shelf: true } } } },
    },
  });
  if (!container) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const current = container.stage as GrowthStage;
  const idx = STAGE_ORDER.indexOf(current);
  if (idx >= STAGE_ORDER.length - 1) {
    return NextResponse.json({ error: "Already at final stage" }, { status: 400 });
  }

  const next = STAGE_ORDER[idx + 1];
  const now = new Date();

  // Build update data
  const updateData: Record<string, unknown> = { stage: next };

  if (next === "PREPARATION" || (next === "DARK_PHASE" && current === "EMPTY")) {
    updateData.plantedAt = now;
    if (speciesId) updateData.speciesId = speciesId;
  }
  if (next === "DARK_PHASE") {
    updateData.darkPhaseStarted = now;
    if (!container.plantedAt) updateData.plantedAt = now;
    if (speciesId && !container.speciesId) updateData.speciesId = speciesId;
  }
  if (next === "LIGHT_PHASE") {
    updateData.lightPhaseStarted = now;
  }
  if (next === "HARVESTED") {
    updateData.harvestedAt = now;
  }

  await prisma.container.update({ where: { id }, data: updateData });

  // Log the stage change
  await prisma.growthLog.create({
    data: {
      containerId: id,
      action: `Переход: ${current} → ${next}`,
      stage: next,
    },
  });

  // Schedule notifications
  const user = await prisma.user.findFirst();
  if (user) {
    const speciesName = container.species?.name ?? "Растение";
    const shelfName = container.tray.level.shelf.name;
    const levelNum = container.tray.level.levelNumber;

    const msg = buildStageChangeMessage(speciesName, next as GrowthStage, shelfName, levelNum);

    const minutesBefore = user.notifyBefore ?? 0;
    const scheduledAt = new Date(now.getTime() + minutesBefore * 60_000);

    await scheduleNotification({ userId: user.id, containerId: id, type: "STAGE_CHANGE", message: msg, scheduledAt });

    // If moved to LIGHT_PHASE, schedule daily watering reminders for 5 days
    if (next === "LIGHT_PHASE") {
      for (let day = 1; day <= 5; day++) {
        const waterAt = new Date(now.getTime() + day * 24 * 60 * 60 * 1000);
        waterAt.setHours(8, 0, 0, 0);
        const waterMsg = `💧 <b>Полив!</b>\n${speciesName} (${shelfName} / эт.${levelNum}) — день ${day} под светом`;
        await scheduleNotification({ userId: user.id, containerId: id, type: "WATERING", message: waterMsg, scheduledAt: waterAt });
      }

      // Harvest alert at min days
      const species = container.species;
      if (species) {
        const harvestAt = new Date(now.getTime() + species.lightDaysMin * 24 * 60 * 60 * 1000);
        const harvestMsg = buildHarvestMessage(speciesName, `${shelfName} / эт.${levelNum}`);
        await scheduleNotification({ userId: user.id, containerId: id, type: "HARVEST_READY", message: harvestMsg, scheduledAt: harvestAt });
      }
    }
  }

  return NextResponse.json({ ok: true, stage: next });
}
