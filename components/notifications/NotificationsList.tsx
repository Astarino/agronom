"use client";

import { formatDate } from "@/lib/utils";
import { Bell, X, CheckCircle2 } from "lucide-react";

type NotifItem = {
  id: string;
  type: string;
  message: string;
  scheduledAt: Date;
  sentAt: Date | null;
  isActive: boolean;
  container: {
    species: { name: string; color: string } | null;
    tray: { level: { shelf: { name: string }; levelNumber: number } };
  } | null;
};

const TYPE_ICONS: Record<string, string> = {
  WATERING: "💧", LIGHT_ON: "☀️", LIGHT_OFF: "🌙",
  MOVE_TO_LIGHT: "🌱", HARVEST_READY: "🌿", CUSTOM: "📋",
};

const TYPE_LABELS: Record<string, string> = {
  WATERING: "Полив", LIGHT_ON: "Включить свет", LIGHT_OFF: "Выключить свет",
  MOVE_TO_LIGHT: "Перенести под свет", HARVEST_READY: "Готово к сбору", CUSTOM: "Задача",
};

export function NotificationsList({ notifications, type }: {
  notifications: NotifItem[];
  type: "pending" | "sent";
}) {
  async function cancel(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    window.location.reload();
  }

  return (
    <div className="space-y-2">
      {notifications.map((n) => {
        const icon = TYPE_ICONS[n.type] ?? "🔔";
        const label = TYPE_LABELS[n.type] ?? n.type;
        const isSent = !!n.sentAt;

        return (
          <div key={n.id}
            className="flex items-start gap-3 p-3 rounded-xl"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              opacity: isSent ? 0.65 : 1,
            }}>
            <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-medium px-1.5 py-0.5 rounded-md"
                  style={{ background: "var(--surface)", color: "var(--text-secondary)" }}>
                  {label}
                </span>
                {n.container?.species && (
                  <span className="text-xs" style={{ color: n.container.species.color }}>
                    {n.container.species.name}
                  </span>
                )}
              </div>
              <p className="text-sm leading-snug mb-1" style={{ color: "var(--text-secondary)" }}>
                {n.message.replace(/<[^>]+>/g, "")}
              </p>
              <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                <span>{isSent ? "Отправлено" : "Запланировано"}:</span>
                <span className="font-mono">{formatDate(isSent ? n.sentAt! : n.scheduledAt)}</span>
                {n.container && (
                  <span>{n.container.tray.level.shelf.name} / эт.{n.container.tray.level.levelNumber}</span>
                )}
              </div>
            </div>
            {!isSent && (
              <button
                onClick={() => cancel(n.id)}
                className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10 flex-shrink-0"
                style={{ color: "var(--text-muted)" }}
                title="Отменить">
                <X size={14} />
              </button>
            )}
            {isSent && (
              <CheckCircle2 size={16} className="flex-shrink-0 mt-1" style={{ color: "#4ADE80" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
