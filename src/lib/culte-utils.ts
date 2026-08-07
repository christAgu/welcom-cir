import type { CulteType } from "@/lib/culte-data";

const MONTHS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
] as const;

export const WEEKDAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"] as const;

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Dimanche = 0, Mercredi = 3 */
export function getCulteType(date: Date): CulteType | null {
  const day = date.getDay();
  if (day === 0) return "dim";
  if (day === 3) return "mer";
  return null;
}

export function isCulteDay(date: Date): boolean {
  return getCulteType(date) !== null;
}

export function formatMonthYear(date: Date): string {
  return `${MONTHS_FR[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatCulteDayLabel(dateKey: string, type: CulteType): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const label = `${d} ${MONTHS_FR[date.getMonth()]} ${y}`;
  return type === "dim" ? `Dimanche ${label}` : `Mercredi ${label}`;
}

/** Grille calendrier (lun → dim), avec null pour cases vides */
export function getCalendarDays(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  // Lundi = 0 … Dimanche = 6
  const startOffset = (first.getDay() + 6) % 7;
  const days: (Date | null)[] = Array.from({ length: startOffset }, () => null);

  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

export function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

/** Date locale (évite le décalage UTC de toISOString). */
export function todayLocalIsoDate(reference = new Date()): string {
  return toDateKey(reference);
}

/** Dimanche ou mercredi le plus récent (aujourd'hui si culte). */
export function defaultCulteDateIso(reference = new Date()): string {
  if (getCulteType(reference)) {
    return toDateKey(reference);
  }

  const date = new Date(reference);
  for (let i = 0; i < 7; i += 1) {
    date.setDate(date.getDate() - 1);
    if (getCulteType(date)) {
      return toDateKey(date);
    }
  }

  return toDateKey(reference);
}
