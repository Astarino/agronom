import { NextRequest, NextResponse } from "next/server";
import { buildBotCommands } from "@/lib/telegram";

let botInitialized = false;

function ensureBot() {
  if (!botInitialized) {
    buildBotCommands();
    botInitialized = true;
  }
}

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-telegram-bot-api-secret-token");
    if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    ensureBot();
    const { getBot } = await import("@/lib/telegram");
    const bot = getBot();
    const update = await req.json();
    await bot.handleUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Telegram webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// Setup webhook endpoint
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const setup = searchParams.get("setup");

  if (setup === "1") {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const { setWebhook } = await import("@/lib/telegram");
    await setWebhook(`${appUrl}/api/telegram`);
    return NextResponse.json({ ok: true, webhook: `${appUrl}/api/telegram` });
  }

  return NextResponse.json({ ok: true, info: "Telegram webhook endpoint" });
}
