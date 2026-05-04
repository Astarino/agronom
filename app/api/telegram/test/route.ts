import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  const { chatId } = await req.json();
  if (!chatId) return NextResponse.json({ error: "chatId required" }, { status: 400 });

  await sendTelegramMessage(
    chatId,
    "🌿 <b>Тест уведомления!</b>\n\nБот подключён и работает. Вы будете получать уведомления о поливе, смене фазы и готовности урожая."
  );

  return NextResponse.json({ ok: true });
}
