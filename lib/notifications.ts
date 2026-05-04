import { prisma } from "@/lib/db";
import { sendTelegramMessage } from "@/lib/telegram";
import { STAGE_LABELS, GrowthStage } from "@/lib/utils";

export async function scheduleNotification({
  userId,
  containerId,
  type,
  message,
  scheduledAt,
}: {
  userId: string;
  containerId?: string;
  type: string;
  message: string;
  scheduledAt: Date;
}) {
  return prisma.notificationSchedule.create({
    data: { userId, containerId, type, message, scheduledAt },
  });
}

export async function processDueNotifications() {
  const now = new Date();

  const due = await prisma.notificationSchedule.findMany({
    where: {
      isActive: true,
      sentAt: null,
      scheduledAt: { lte: now },
    },
    include: {
      user: true,
      container: { include: { species: true } },
    },
  });

  let sent = 0;
  for (const notif of due) {
    if (!notif.user.telegramChatId) continue;
    try {
      await sendTelegramMessage(notif.user.telegramChatId, notif.message);
      await prisma.notificationSchedule.update({
        where: { id: notif.id },
        data: { sentAt: now },
      });
      sent++;
    } catch (e) {
      console.error("Failed to send notification", notif.id, e);
    }
  }
  return sent;
}

export function buildStageChangeMessage(
  speciesName: string,
  newStage: GrowthStage,
  shelfName: string,
  levelNumber: number
): string {
  const label = STAGE_LABELS[newStage];
  const emojis: Record<GrowthStage, string> = {
    EMPTY: "⬜",
    PREPARATION: "🌰",
    DARK_PHASE: "🌑",
    LIGHT_PHASE: "🌱",
    READY: "🌿",
    HARVESTED: "✂️",
  };
  const emoji = emojis[newStage] ?? "🌿";
  return (
    `${emoji} <b>${speciesName}</b>\n` +
    `Новая фаза: <b>${label}</b>\n` +
    `📍 ${shelfName} / Этаж ${levelNumber}`
  );
}

export function buildWateringMessage(speciesName: string, location: string): string {
  return `💧 <b>Время полива!</b>\n${speciesName} (${location}) нуждается в увлажнении.`;
}

export function buildHarvestMessage(speciesName: string, location: string): string {
  return `🌿 <b>Готово к сбору!</b>\n${speciesName} (${location}) можно убирать. Не переросло — срочно!`;
}

export function buildLightMessage(on: boolean, levelName: string): string {
  return on
    ? `☀️ <b>Включить свет</b> на ${levelName}`
    : `🌙 <b>Выключить свет</b> на ${levelName}`;
}
