import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Thermometer, Droplets, Clock, Weight, Ruler, CheckCircle2, AlertTriangle, Sun } from "lucide-react";

async function getSpecies(id: string) {
  return prisma.species.findUnique({ where: { id } });
}

export default async function SpeciesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const species = await getSpecies(id);
  if (!species) notFound();

  const steps = JSON.parse(species.steps) as Array<{
    step: number; title: string; desc: string; phase?: string;
  }>;
  const readySigns = JSON.parse(species.readySigns) as string[];
  const overgrownSigns = JSON.parse(species.overgrownSigns) as string[];

  const totalDaysMin = species.darkDaysMin + species.lightDaysMin;
  const totalDaysMax = species.darkDaysMax + species.lightDaysMax;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/species"
          className="p-2 rounded-xl transition-colors hover:bg-white/5"
          style={{ color: "var(--text-muted)" }}>
          <ArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-3 h-8 rounded-full" style={{ background: species.color }} />
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-semibold"
              style={{ color: "var(--text-primary)" }}>
              {species.name}
            </h1>
            {species.variety && (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{species.variety}</p>
            )}
          </div>
        </div>
      </div>

      {/* Key parameters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <ParamCard icon={<Thermometer size={16} />} label="Температура" value={`${species.tempMin}–${species.tempMax}°C`} color="#60A5FA" />
        <ParamCard icon={<Droplets size={16} />} label="Влажность" value={`${species.humidityMin}–${species.humidityMax}%`} color="#34D399" />
        <ParamCard icon={<Clock size={16} />} label="Время роста" value={`${totalDaysMin}–${totalDaysMax} дн`} color="#A78BFA" />
        <ParamCard icon={<Ruler size={16} />} label="Высота" value={`${species.heightMin}–${species.heightMax} см`} color={species.color} />
      </div>

      {/* Secondary params */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <SmallParam label="Семян на лоток" value={`${species.seedAmount} г`} />
        <SmallParam label="Прижим" value={`${species.pressWeight} г`} />
        {species.soakHours && <SmallParam label="Замачивание" value={`${species.soakHours} ч`} />}
        {species.lightHeight && (
          <SmallParam label="Высота света" value={`${species.lightHeight} см`} icon={<Sun size={11} />} />
        )}
        <SmallParam label="Тёмная фаза" value={`${species.darkDaysMin}–${species.darkDaysMax} дн`} />
        <SmallParam label="Фаза света" value={`${species.lightDaysMin}–${species.lightDaysMax} дн`} />
      </div>

      {/* Light schedule */}
      <div className="p-4 rounded-2xl mb-6 flex items-center gap-4"
        style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
        <Sun size={20} style={{ color: "#FCD34D" }} className="flex-shrink-0" />
        <div>
          <p className="text-sm font-medium" style={{ color: "#FCD34D" }}>Световой режим</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Свет — <strong>16 часов</strong> / Темнота — <strong>8 часов</strong>
          </p>
        </div>
      </div>

      {/* Instructions steps */}
      <section className="mb-6">
        <h2 className="font-display text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Инструкция
        </h2>
        <div className="space-y-3">
          {steps.map((step, i) => {
            const phaseColors: Record<string, { bg: string; color: string; label: string }> = {
              PREPARATION: { bg: "rgba(124,58,237,0.1)", color: "#A78BFA", label: "Подготовка" },
              DARK_PHASE:  { bg: "rgba(139,92,246,0.1)", color: "#C4B5FD", label: "Тёмная фаза" },
              LIGHT_PHASE: { bg: "rgba(74,222,128,0.1)", color: "#4ADE80", label: "Под светом" },
              READY:       { bg: "rgba(252,211,77,0.1)", color: "#FCD34D", label: "Готово" },
            };
            const phaseStyle = step.phase ? phaseColors[step.phase] : null;

            return (
              <div key={i}
                className="flex gap-4 p-4 rounded-xl"
                style={{
                  background: phaseStyle ? phaseStyle.bg : "var(--card)",
                  border: `1px solid ${phaseStyle ? `${phaseStyle.color}33` : "var(--border)"}`,
                }}>
                <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold"
                  style={{
                    background: phaseStyle ? `${phaseStyle.color}22` : "var(--surface)",
                    color: phaseStyle ? phaseStyle.color : "var(--text-muted)",
                    border: `1px solid ${phaseStyle ? `${phaseStyle.color}44` : "var(--border)"}`,
                  }}>
                  {step.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                      {step.title}
                    </span>
                    {phaseStyle && (
                      <span className="text-xs px-1.5 py-0.5 rounded-md"
                        style={{ background: `${phaseStyle.color}22`, color: phaseStyle.color }}>
                        {phaseStyle.label}
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ready signs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <SignsCard
          title="Признаки готовности"
          signs={readySigns}
          icon={<CheckCircle2 size={16} />}
          color="#4ADE80"
          bg="rgba(74,222,128,0.08)"
          border="rgba(74,222,128,0.2)"
        />
        <SignsCard
          title="Признаки перерастания"
          signs={overgrownSigns}
          icon={<AlertTriangle size={16} />}
          color="#F97316"
          bg="rgba(249,115,22,0.08)"
          border="rgba(249,115,22,0.2)"
        />
      </div>
    </div>
  );
}

function ParamCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string; color: string;
}) {
  return (
    <div className="p-3 rounded-xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="mb-2" style={{ color }}>{icon}</div>
      <div className="font-mono text-base font-bold mb-0.5" style={{ color: "var(--text-primary)" }}>{value}</div>
      <div className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
}

function SmallParam({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      {icon && <span style={{ color: "var(--text-muted)" }}>{icon}</span>}
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}:</span>
      <span className="font-mono text-xs font-medium ml-auto" style={{ color: "var(--text-primary)" }}>{value}</span>
    </div>
  );
}

function SignsCard({ title, signs, icon, color, bg, border }: {
  title: string; signs: string[]; icon: React.ReactNode;
  color: string; bg: string; border: string;
}) {
  return (
    <div className="p-4 rounded-xl" style={{ background: bg, border: `1px solid ${border}` }}>
      <div className="flex items-center gap-2 mb-3" style={{ color }}>
        {icon}
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <ul className="space-y-1.5">
        {signs.map((sign, i) => (
          <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
            <span style={{ color, flexShrink: 0 }}>·</span>
            {sign}
          </li>
        ))}
      </ul>
    </div>
  );
}
