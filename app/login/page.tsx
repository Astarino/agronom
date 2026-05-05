import { Sprout } from "lucide-react";
import { TelegramLoginWidget } from "@/components/auth/TelegramLoginWidget";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "var(--bg)" }}>

      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)" }}>
          <Sprout size={32} style={{ color: "var(--green-sprout)" }} />
        </div>
        <h1 className="font-display text-3xl font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
          Агроном
        </h1>
        <p className="text-sm text-center max-w-xs" style={{ color: "var(--text-muted)" }}>
          Дневник выращивания микрозелени
        </p>
      </div>

      {/* Login card */}
      <div className="w-full max-w-sm p-6 rounded-2xl"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}>

        <h2 className="font-semibold text-center mb-2" style={{ color: "var(--text-primary)" }}>
          Войти через Telegram
        </h2>
        <p className="text-xs text-center mb-6" style={{ color: "var(--text-muted)" }}>
          Нажмите кнопку — Telegram автоматически свяжет аккаунт и включит уведомления
        </p>

        <TelegramLoginWidget />

        <p className="text-xs text-center mt-4" style={{ color: "var(--text-muted)" }}>
          Данные используются только для отправки уведомлений в Telegram
        </p>
      </div>

      {/* Steps */}
      <div className="mt-8 w-full max-w-sm space-y-3">
        {[
          { n: "1", text: "Войдите через Telegram одним нажатием" },
          { n: "2", text: "Бот автоматически привяжется к вашему аккаунту" },
          { n: "3", text: "Получайте уведомления о поливе и сборе урожая" },
        ].map(({ n, text }) => (
          <div key={n} className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: "rgba(74,222,128,0.12)", color: "var(--green-sprout)", border: "1px solid rgba(74,222,128,0.25)" }}>
              {n}
            </span>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
