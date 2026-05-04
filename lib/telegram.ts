import { Bot } from "grammy";

let bot: Bot | null = null;

export function getBot(): Bot {
  if (!bot) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");
    bot = new Bot(token);
  }
  return bot;
}

export async function sendTelegramMessage(chatId: string, text: string) {
  try {
    const b = getBot();
    await b.api.sendMessage(chatId, text, { parse_mode: "HTML" });
  } catch (err) {
    console.error("Telegram send error:", err);
  }
}

export async function setWebhook(url: string) {
  const b = getBot();
  await b.api.setWebhook(url, {
    secret_token: process.env.TELEGRAM_WEBHOOK_SECRET,
  });
}

export async function deleteWebhook() {
  const b = getBot();
  await b.api.deleteWebhook();
}

export function buildBotCommands() {
  const b = getBot();

  b.command("start", async (ctx) => {
    const chatId = ctx.chat.id.toString();
    const name = ctx.from?.first_name ?? "Агроном";

    await ctx.reply(
      `🌿 <b>Привет, ${name}!</b>\n\n` +
        `Я помощник агронома для выращивания микрозелени.\n\n` +
        `<b>Ваш Telegram Chat ID:</b> <code>${chatId}</code>\n\n` +
        `Скопируйте этот ID и введите его в настройках приложения, ` +
        `чтобы получать уведомления.\n\n` +
        `<b>Команды:</b>\n` +
        `/status — статус всех активных контейнеров\n` +
        `/help — помощь`,
      { parse_mode: "HTML" }
    );
  });

  b.command("status", async (ctx) => {
    const { prisma } = await import("@/lib/db");
    const chatId = ctx.chat.id.toString();

    const user = await prisma.user.findUnique({
      where: { telegramChatId: chatId },
    });

    if (!user) {
      await ctx.reply(
        "❌ Вы не подключены к приложению.\n\n" +
          `Ваш Chat ID: <code>${chatId}</code>\n` +
          "Введите его в настройках приложения.",
        { parse_mode: "HTML" }
      );
      return;
    }

    const containers = await prisma.container.findMany({
      where: {
        stage: { not: "EMPTY" },
        tray: {
          level: { shelf: { userId: user.id } },
        },
      },
      include: { species: true, tray: { include: { level: { include: { shelf: true } } } } },
    });

    if (containers.length === 0) {
      await ctx.reply("📭 Нет активных контейнеров.", { parse_mode: "HTML" });
      return;
    }

    const { STAGE_LABELS } = await import("@/lib/utils");
    const lines = containers.map((c) => {
      const shelf = c.tray.level.shelf.name;
      const level = c.tray.level.levelNumber;
      const sp = c.species?.name ?? "—";
      const stage = STAGE_LABELS[c.stage as keyof typeof STAGE_LABELS] ?? c.stage;
      const daysAgo = c.plantedAt
        ? Math.floor((Date.now() - new Date(c.plantedAt).getTime()) / 86400000)
        : 0;
      return `• <b>${sp}</b> — ${stage} (день ${daysAgo}) [${shelf} / эт.${level}]`;
    });

    await ctx.reply(
      `🌱 <b>Активные контейнеры (${containers.length}):</b>\n\n` + lines.join("\n"),
      { parse_mode: "HTML" }
    );
  });

  b.command("help", async (ctx) => {
    await ctx.reply(
      `🌿 <b>Помощник агронома</b>\n\n` +
        `<b>Команды:</b>\n` +
        `/start — начало работы и получение Chat ID\n` +
        `/status — статус всех активных посевов\n` +
        `/help — эта справка\n\n` +
        `<b>Уведомления:</b>\n` +
        `Бот отправляет уведомления о поливе, смене фазы и готовности урожая. ` +
        `Настройте время уведомлений в приложении.`,
      { parse_mode: "HTML" }
    );
  });

  return b;
}
