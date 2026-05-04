"use client";

import { useState } from "react";
import { MessageCircle, Check, Send } from "lucide-react";

type User = { id: string; telegramChatId: string | null; name: string | null; telegramId: string | null } | null;

export function TelegramSettings({ user }: { user: User }) {
  const [chatId, setChatId] = useState(user?.telegramChatId ?? "");
  const [name, setName] = useState(user?.name ?? "");
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    try {
      await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramChatId: chatId || null, name: name || null }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setLoading(false);
    }
  }

  async function sendTest() {
    if (!chatId) return;
    setTesting(true);
    try {
      await fetch("/api/telegram/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId }),
      });
      alert("Тестовое сообщение отправлено! Проверьте Telegram.");
    } catch {
      alert("Ошибка отправки. Проверьте Chat ID.");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-3 mb-5">
        <MessageCircle size={18} style={{ color: "#60A5FA" }} />
        <h2 className="font-display text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          Telegram бот
        </h2>
        {user?.telegramChatId && (
          <span className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: "rgba(74,222,128,0.15)", color: "var(--green-sprout)", border: "1px solid rgba(74,222,128,0.3)" }}>
            Подключён
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            Ваше имя
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Агроном"
            className="w-full px-3 py-2.5 rounded-xl text-sm"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            Telegram Chat ID
          </label>
          <input
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            placeholder="123456789"
            className="w-full px-3 py-2.5 rounded-xl text-sm font-mono"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          />
          <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
            Получите ID, написав /start боту
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={save}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: "var(--green-sprout)", color: "#0A1409" }}>
            {saved ? <><Check size={14} /> Сохранено</> : "Сохранить"}
          </button>

          {chatId && (
            <button
              onClick={sendTest}
              disabled={testing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: "rgba(96,165,250,0.1)", color: "#60A5FA", border: "1px solid rgba(96,165,250,0.3)" }}>
              <Send size={14} />
              {testing ? "..." : "Тест"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
