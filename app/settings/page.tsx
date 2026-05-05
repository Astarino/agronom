export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { Settings } from "lucide-react";
import { TelegramSettings } from "@/components/settings/TelegramSettings";
import { NotifyTimingSettings } from "@/components/settings/NotifyTimingSettings";

async function getUser() {
  return prisma.user.findFirst();
}

export default async function SettingsPage() {
  const user = await getUser();

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)" }}>
          <Settings size={18} style={{ color: "var(--green-sprout)" }} />
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Настройки
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Telegram бот и уведомления
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <TelegramSettings user={user} />
        <NotifyTimingSettings user={user} />
        <BotInstructionsCard />
      </div>
    </div>
  );
}

function BotInstructionsCard() {
  return (
    <div className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <h2 className="font-display text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
        Как подключить бота
      </h2>
      <ol className="space-y-3">
        {[
          { n: 1, text: 'Найдите бота в Telegram: @agronom_diary_bot (или перейдите по ссылке)' },
          { n: 2, text: 'Нажмите "Start" и отправьте команду /start' },
          { n: 3, text: 'Бот покажет ваш Chat ID — скопируйте его' },
          { n: 4, text: 'Вставьте Chat ID в поле выше и нажмите "Сохранить"' },
          { n: 5, text: 'Готово! Теперь бот будет присылать уведомления о поливе, свете и сборе урожая' },
        ].map(({ n, text }) => (
          <li key={n} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold"
              style={{ background: "rgba(74,222,128,0.15)", color: "var(--green-sprout)", border: "1px solid rgba(74,222,128,0.3)" }}>
              {n}
            </span>
            <p className="text-sm pt-0.5" style={{ color: "var(--text-secondary)" }}>{text}</p>
          </li>
        ))}
      </ol>

      <div className="mt-4 p-3 rounded-xl"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
          Команды бота: /start · /status · /help
        </p>
      </div>
    </div>
  );
}
