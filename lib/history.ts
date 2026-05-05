import { prisma } from "@/lib/db";

export async function archiveContainerCycle(containerId: string) {
  const container = await prisma.container.findUnique({
    where: { id: containerId },
    include: {
      species: true,
      tray: { include: { level: { include: { shelf: true } } } },
    },
  });

  if (!container || container.stage === "EMPTY" || !container.species) return null;

  return prisma.cropHistory.create({
    data: {
      userId: container.tray.level.shelf.userId,
      containerId: container.id,
      speciesId: container.speciesId,
      speciesName: container.species.name,
      shelfName: container.tray.level.shelf.name,
      levelNumber: container.tray.level.levelNumber,
      trayPosition: container.tray.position,
      containerPosition: container.position,
      plantedAt: container.plantedAt,
      darkPhaseStarted: container.darkPhaseStarted,
      lightPhaseStarted: container.lightPhaseStarted,
      harvestedAt: container.harvestedAt,
      finalStage: container.stage,
      notes: container.notes,
    },
  });
}
