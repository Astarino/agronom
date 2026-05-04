import { prisma } from "@/lib/db";
import { Bell, Clock, CheckCircle2, X } from "lucide-react";
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
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)" }}>
          <Bell size={18} style={{ color: "var(--green-sprout)" }} />
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Уведомления
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Telegram бот отправляет напоминания
          </p>
        </div>
      </div>

      {/* Telegram status */}
      <div className="p-4 rounded-2xl mb-6"
        style={{
          background: user?.telegramChatId
            ? "rgba(74,222,128,0.08)"
            : "rgba(249,115,22,0.08)",
          border: `1px solid ${user?.telegramChatId ? "rgba(74,222,128,0.25)" : "rgba(249,115,22,0.25)"}`,
        }}>
        <div className="flex items-center gap-3">
          <div className="text-2xl">
            {user?.telegramChatId ? "✅" : "📱"}
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
