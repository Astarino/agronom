import { NextRequest, NextResponse } from "next/server";
import { createHmac, createHash } from "crypto";
import { prisma } from "@/lib/db";

function verifyTelegramHash(data: Record<string, string | number>, token: string): boolean {
  const { hash, ...rest } = data;
  const dataCheckString = Object.entries(rest)
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join("\n");

  const secretKey = createHash("sha256").update(token).digest();
  const computed = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
  return computed === String(hash);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) return NextResponse.json({ error: "No bot token" }, { status: 500 });

  // Verify auth date is fresh (within 24h)
  const authDate = Number(data.auth_date);
  if (Date.now() / 1000 - authDate > 86400) {
    return NextResponse.json({ error: "Auth expired" }, { status: 401 });
  }

  if (!verifyTelegramHash(data, token)) {
    return NextResponse.json({ error: "Invalid hash" }, { status: 401 });
  }

  // Save or update user
  const telegramId = String(data.id);
  const chatId = String(data.id); // for bots, user_id = chat_id for direct messages
  const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || data.username || "Агроном";

  let user = await prisma.user.findFirst();

  if (user) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { telegramId, telegramChatId: chatId, name: String(name) },
    });
  } else {
    user = await prisma.user.create({
      data: { id: "default-user", telegramId, telegramChatId: chatId, name: String(name) },
    });
  }

  const response = NextResponse.json({ ok: true, user: { id: user.id, name: user.name } });

  // Set session cookie
  response.cookies.set("agronom_uid", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });

  return response;
}
