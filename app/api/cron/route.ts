import { NextRequest, NextResponse } from "next/server";
import { processDueNotifications } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  // Protect cron endpoint
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sent = await processDueNotifications();
  return NextResponse.json({ ok: true, sent, timestamp: new Date().toISOString() });
}
