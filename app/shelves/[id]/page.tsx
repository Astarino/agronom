export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Map } from "lucide-react";
import { ShelfView } from "@/components/shelf/ShelfView";

async function getShelf(id: string) {
  return prisma.shelf.findUnique({
    where: { id },
    include: {
      levels: {
        orderBy: { levelNumber: "asc" },
        include: {
          trays: {
            orderBy: { position: "asc" },
            include: {
              containers: {
                orderBy: { position: "asc" },
                include: { species: true },
              },
            },
          },
        },
      },
    },
  });
}

async function getSpecies() {
  return prisma.species.findMany({ orderBy: { name: "asc" } });
}

export default async function ShelfDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [shelf, species] = await Promise.all([getShelf(id), getSpecies()]);

  if (!shelf) notFound();

  const containers = shelf.levels.flatMap((level) => level.trays.flatMap((tray) => tray.containers));
  const active = containers.filter((container) => !["EMPTY", "HARVESTED"].includes(container.stage)).length;
  const ready = containers.filter((container) => container.stage === "READY").length;
  const free = containers.filter((container) => container.stage === "EMPTY").length;

  return (
    <div className="page-shell">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
        <Link href="/shelves"
          className="ui-icon-button shrink-0">
          <ArrowLeft size={18} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="page-eyebrow mb-1 flex items-center gap-1.5"><Map size={11} /> Схема размещения</div>
          <h1 className="font-display truncate text-2xl font-bold md:text-3xl" style={{ color: "var(--text-primary)" }}>
            {shelf.name}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {shelf.levels.length} этажей · {shelf.levels.reduce((a, l) => a + l.trays.reduce((b, t) => b + t.containers.length, 0), 0)} контейнеров
          </p>
        </div>
        </div>
        <div className="grid grid-cols-3 gap-2 pl-[52px] sm:pl-0">
          <ShelfStatus label="Свободно" value={free} color="var(--text-secondary)" />
          <ShelfStatus label="В работе" value={active} color="var(--green-sprout)" />
          <ShelfStatus label="К сбору" value={ready} color={ready ? "var(--gold)" : "var(--text-muted)"} />
        </div>
      </div>

      <ShelfView shelf={shelf} species={species} />
    </div>
  );
}

function ShelfStatus({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="min-w-[78px] rounded-xl border px-3 py-2 text-center"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="font-display text-lg font-bold" style={{ color }}>{value}</div>
      <div className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
}
