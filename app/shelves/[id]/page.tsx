import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/shelves"
          className="p-2 rounded-xl transition-colors hover:bg-white/5"
          style={{ color: "var(--text-muted)" }}>
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold" style={{ color: "var(--text-primary)" }}>
            {shelf.name}
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {shelf.levels.length} этажей · {shelf.levels.reduce((a, l) => a + l.trays.reduce((b, t) => b + t.containers.length, 0), 0)} контейнеров
          </p>
        </div>
      </div>

      <ShelfView shelf={shelf} species={species} />
    </div>
  );
}
