export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { TelegramSettings } from "@/components/settings/TelegramSettings";
import { NotifyTimingSettings } from "@/components/settings/NotifyTimingSettings";

async function getUser() {
  return prisma.user.findFirst();
}

export default async function SettingsPage() {
  const user = await getUser();

  return (
    <div className="page-shell max-w-2xl">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Параметры</div>
          <h1 className="page-title">Настройки</h1>
          <p className="page-description">Подключение Telegram и время отправки напоминаний.</p>
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
              style={{ background: "rgba(135, 189, 156,0.15)", color: "var(--green-sprout)", border: "1px solid rgba(135, 189, 156,0.3)" }}>
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
