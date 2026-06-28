export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { Bell, Clock, CheckCircle2, Smartphone } from "lucide-react";
import { NotificationsList } from "@/components/notifications/NotificationsList";
import { formatDate } from "@/lib/utils";

async function getData() {
  const [notifications, user] = await Promise.all([
    prisma.notificationSchedule.findMany({
      orderBy: { scheduledAt: "asc" },
      include: {
        container: {
          include: {
            species: true,
            tray: { include: { level: { include: { shelf: true } } } },
          },
        },
      },
      take: 50,
    }),
    prisma.user.findFirst(),
  ]);
  return { notifications, user };
}

export default async function NotificationsPage() {
  const { notifications, user } = await getData();

  const pending = notifications.filter((n) => !n.sentAt && n.isActive);
  const sent = notifications.filter((n) => n.sentAt);

  return (
    <div className="page-shell max-w-3xl">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">План действий</div>
          <h1 className="page-title">Уведомления</h1>
          <p className="page-description">Напоминания о поливе, свете, переносе и сборе урожая.</p>
        </div>
      </div>

      {/* Telegram status */}
      <div className="mb-6 rounded-2xl border p-4"
        style={{
          background: user?.telegramChatId
            ? "rgba(135, 189, 156,0.08)"
            : "rgba(249,115,22,0.08)",
          border: `1px solid ${user?.telegramChatId ? "rgba(135, 189, 156,0.25)" : "rgba(249,115,22,0.25)"}`,
        }}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: user?.telegramChatId ? "rgba(135,189,156,0.14)" : "rgba(249,115,22,0.14)",
              color: user?.telegramChatId ? "var(--green-sprout)" : "#e0975a",
            }}>
            {user?.telegramChatId ? <CheckCircle2 size={20} /> : <Smartphone size={20} />}
          </div>
          <div>
            <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
              {user?.telegramChatId ? "Telegram подключён" : "Telegram не настроен"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {user?.telegramChatId
                ? `Chat ID: ${user.telegramChatId} · Уведомления активны`
                : "Перейдите в Настройки → Telegram для подключения бота"}
            </p>
          </div>
        </div>
      </div>

      {/* Pending */}
      <section className="mb-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest mb-3"
          style={{ color: "var(--text-muted)" }}>
          <Clock size={14} /> Запланировано ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="p-6 rounded-xl text-center"
            style={{ background: "var(--card)", border: "1px dashed var(--border)" }}>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Нет запланированных уведомлений
            </p>
          </div>
        ) : (
          <NotificationsList notifications={pending} type="pending" />
        )}
      </section>

      {/* Sent */}
      {sent.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--text-muted)" }}>
            <CheckCircle2 size={14} /> Отправлено ({sent.length})
          </h2>
          <NotificationsList notifications={sent} type="sent" />
        </section>
      )}
    </div>
  );
}
