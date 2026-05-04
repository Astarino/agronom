import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, differenceInDays, format } from "date-fns";
import { ru } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return format(new Date(date), "d MMM, HH:mm", { locale: ru });
}

export function formatRelative(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ru });
}

export function daysSince(date: Date | string) {
  return differenceInDays(new Date(), new Date(date));
}

export type GrowthStage =
  | "EMPTY"
  | "PREPARATION"
  | "DARK_PHASE"
  | "LIGHT_PHASE"
  | "READY"
  | "HARVESTED";

export const STAGE_LABELS: Record<GrowthStage, string> = {
  EMPTY: "Свободно",
  PREPARATION: "Подготовка",
  DARK_PHASE: "Тёмная фаза",
  LIGHT_PHASE: "Под светом",
  READY: "Готово к сбору!",
  HARVESTED: "Собрано",
};

export const STAGE_COLORS: Record<GrowthStage, string> = {
  EMPTY: "#1F2E22",
  PREPARATION: "#1E1A2E",
  DARK_PHASE: "#1C1530",
  LIGHT_PHASE: "#0F2B14",
  READY: "#2B2500",
  HARVESTED: "#0A1409",
};

export const STAGE_GLOW: Record<GrowthStage, string> = {
  EMPTY: "transparent",
  PREPARATION: "#7C3AED",
  DARK_PHASE: "#8B5CF6",
  LIGHT_PHASE: "#4ADE80",
  READY: "#FCD34D",
  HARVESTED: "transparent",
};

export const STAGE_ORDER: GrowthStage[] = [
  "EMPTY",
  "PREPARATION",
  "DARK_PHASE",
  "LIGHT_PHASE",
  "READY",
  "HARVESTED",
];

export function nextStage(current: GrowthStage): GrowthStage | null {
  const idx = STAGE_ORDER.indexOf(current);
  if (idx < STAGE_ORDER.length - 1) return STAGE_ORDER[idx + 1];
  return null;
}

export function getGrowthProgress(stage: GrowthStage): number {
  const progress: Record<GrowthStage, number> = {
    EMPTY: 0,
    PREPARATION: 10,
    DARK_PHASE: 35,
    LIGHT_PHASE: 65,
    READY: 95,
    HARVESTED: 100,
  };
  return progress[stage];
}
