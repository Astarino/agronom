import { prisma } from "@/lib/db";
import Link from "next/link";
import { Leaf, Plus, Thermometer, Droplets, Clock } from "lucide-react";
import { AddSpeciesButton } from "@/components/species/AddSpeciesButton";

async function getSpecies() {
  return prisma.species.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { containers: true } } },
  });
}

export default async function SpeciesPage() {
  const species = await getSpecies();

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Виды растений
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Инструкции по выращиванию и параметры
          </p>
        </div>
        <AddSpeciesButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
        {species.map((s) => {
          const steps = JSON.parse(s.steps) as Array<{ step: number; title: string }>;
          return (
            <Link
              key={s.id}
              href={`/species/${s.id}`}
              className="group p-5 rounded-2xl transition-all hover:scale-[1.02] animate-fade-in"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              {/* Color strip + name */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-2 self-stretch rounded-full flex-shrink-0"
                  style={{ background: s.color, opacity: 0.8 }}
                />
                <div className="flex-1 min-w-0">
                  <h2 className="font-display text-lg font-semibold leading-tight"
                    style={{ color: "var(--text-primary)" }}>
                    {s.name}
                  </h2>
                  {s.variety && (
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {s.variety}
                    </p>
                  )}
                </div>
              </div>

              {/* Params grid */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <Param icon={<Thermometer size={11} />}
                  label="Темп." value={`${s.tempMin}–${s.tempMax}°C`} />
                <Param icon={<Droplets size={11} />}
                  label="Влажн." value={`${s.humidityMin}–${s.humidityMax}%`} />
                <Param icon={<Clock size={11} />}
                  label="Тёмная" value={`${s.darkDaysMin}–${s.darkDaysMax} д`} />
                <Param icon={<Clock size={11} />}
                  label="На свету" value={`${s.lightDaysMin}–${s.lightDaysMax} д`} />
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between pt-3 border-t"
                style={{ borderColor: "var(--border)" }}>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {steps.length} шагов · высота {s.heightMin}–{s.heightMax} см
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: `${s.color}22`, color: s.color }}>
                  {s._count.containers} контейн.
                </span>
              </div>
            </Link>
          );
        })}

        {/* Add new */}
        <AddSpeciesButton asCard />
      </div>
    </div>
  );
}

function Param({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg px-2 py-1.5"
      style={{ background: "var(--surface)" }}>
      <span style={{ color: "var(--text-muted)" }}>{icon}</span>
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}:</span>
      <span className="font-mono text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{value}</span>
    </div>
  );
}
