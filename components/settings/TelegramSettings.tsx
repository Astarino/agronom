"use client";

import { useState } from "react";
import { MessageCircle, Check, Send, ExternalLink, LogIn } from "lucide-react";
import { TelegramLoginWidget } from "@/components/auth/TelegramLoginWidget";

type User = {
  id: string;
  telegramChatId: string | null;
  telegramId: string | null;
  name: string | null;
} | null;

export function TelegramSettings({ user }: { user: User }) {
  const [chatId, setChatId] = useState(user?.telegramChatId ?? "");
  const [name, setName] = useState(user?.name ?? "");
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showManual, setShowManual] = useState(!user?.telegramChatId);

  async function save() {
    setLoading(true);
    try {
      await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramChatId: chatId || null, name: name || null }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setLoading(false);
    }
  }

  async function sendTest() {
    if (!chatId) return;
    setTesting(true);
    try {
      const res = await fetch("/api/telegram/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId }),
      });
      if (res.ok) alert("✅ Сообщение отправлено! Проверьте Telegram.");
      else alert("❌ Ошибка. Проверьте Chat ID.");
    } catch {
      alert("❌ Ошибка сети.");
    } finally {
      setTesting(false);
    }
  }

  const isConnected = !!user?.telegramChatId;

  return (
    <div className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-3 mb-5">
        <MessageCircle size={18} style={{ color: "#60A5FA" }} />
        <h2 className="font-display text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          Telegram бот
        </h2>
        {isConnected && (
          <span className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: "rgba(74,222,128,0.12)", color: "var(--green-sprout)", border: "1px solid rgba(74,222,128,0.25)" }}>
            Подключён
          </span>
        )}
      </div>

      {/* Connected state */}
      {isConnected && (
        <div className="mb-4 p-3 rounded-xl flex items-center gap-3"
          style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.18)" }}>
          <span className="text-2xl">✅</span>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {user.name ?? "Агроном"}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Chat ID: <span className="font-mono">{user.telegramChatId}</span>
            </p>
          </div>
          <button onClick={() => sendTest()} disabled={testing}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
            style={{ background: "rgba(96,165,250,0.1)", color: "#60A5FA", border: "1px solid rgba(96,165,250,0.2)" }}>
            <Send size={12} />
            {testing ? "..." : "Тест"}
          </button>
        </div>
      )}

      {/* Quick login via widget */}
      <div className="mb-4">
        <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
          {isConnected ? "Переподключить аккаунт:" : "Быстрый вход — один клик:"}
        </p>
        <TelegramLoginWidget />
      </div>

      {/* Open bot link */}
      <a href="https://t.me/agronomvubot" target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90 mb-4"
        style={{ background: "rgba(96,165,250,0.08)", color: "#60A5FA", border: "1px solid rgba(96,165,250,0.2)" }}>
        <MessageCircle size={15} />
        Открыть @agronomvubot
        <ExternalLink size={12} />
      </a>

      {/* Manual input toggle */}
      <button onClick={() => setShowManual((v) => !v)}
        className="text-xs w-full text-center mb-3 transition-colors hover:opacity-80"
        style={{ color: "var(--text-muted)" }}>
        {showManual ? "Скрыть" : "Ввести Chat ID вручную"} ↓
      </button>

      {showManual && (
        <div className="space-y-3 pt-1 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="pt-3">
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Имя</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Агроном"
              className="w-full px-3 py-2 rounded-xl text-sm"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Chat ID <span style={{ color: "var(--text-muted)" }}>(получите командой /start в боте)</span>
            </label>
            <input value={chatId} onChange={(e) => setChatId(e.target.value)} placeholder="123456789"
              className="w-full px-3 py-2 rounded-xl text-sm font-mono"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          </div>
          <button onClick={save} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium"
            style={{ background: "var(--green-sprout)", color: "#0A1409" }}>
            {saved ? <><Check size={14} /> Сохранено</> : "Сохранить"}
          </button>
        </div>
      )}
    </div>
  );
}
