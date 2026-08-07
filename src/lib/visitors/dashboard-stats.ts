import { createClient } from "@/lib/supabase/server";
import type { CulteDayReport, CulteType } from "@/lib/culte-data";
import type { Visitor } from "@/lib/database.types";
import { formatDashboardMonthParam } from "@/lib/dashboard-month";
import { getVisitorDisplayName } from "@/lib/visitors/display-name";
import { formatDateTimeFr } from "@/lib/visitors/format-field-value";

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

export type CulteBar = {
  label: string;
  type: CulteType;
  count: number;
  date: string;
};

export type ScheduledVisit = {
  id: string;
  name: string;
  visitDateLabel: string;
  isPast: boolean;
};

export type LastCulteStat = {
  date: string;
  culteDateIso: string | null;
  label: string;
  count: number;
  trend: number | null;
};

export type DashboardWeekRange = {
  from: string;
  to: string;
};

export type DashboardStats = {
  monthLabel: string;
  monthKey: string;
  isCurrentMonth: boolean;
  adminFirstName: string;
  dernierDimanche: LastCulteStat;
  dernierMercredi: LastCulteStat;
  totalSemaine: number;
  weekRange: DashboardWeekRange | null;
  evolutionSemaine: number | null;
  totalMois: number;
  totalCulteMois: number;
  moisHint: string;
  evolutionMois: number | null;
  followUp: {
    visited: number;
    called: number;
    returned: number;
    totalRegistered: number;
    visitedTrend: number | null;
    calledTrend: number | null;
    returnedTrend: number | null;
  };
  culteBars: CulteBar[];
  scheduledVisits: ScheduledVisit[];
  culteReportsByDate: Record<string, CulteDayReport>;
};

function parseDate(isoDate: string) {
  return new Date(`${isoDate}T12:00:00`);
}

function toIsoDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getWeekStart(reference: Date) {
  const dayOfWeek = reference.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  return new Date(
    reference.getFullYear(),
    reference.getMonth(),
    reference.getDate() - mondayOffset,
  );
}

function isInCurrentWeek(isoDate: string, reference: Date) {
  const date = parseDate(isoDate);
  const weekStart = getWeekStart(reference);
  const weekEnd = new Date(
    reference.getFullYear(),
    reference.getMonth(),
    reference.getDate(),
  );
  weekEnd.setHours(23, 59, 59, 999);
  weekStart.setHours(0, 0, 0, 0);
  return date >= weekStart && date <= weekEnd;
}

function monthKey(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function isInMonth(isoDate: string, year: number, month: number) {
  const date = parseDate(isoDate);
  return date.getFullYear() === year && date.getMonth() === month;
}

function isCreatedInMonth(isoTimestamp: string, year: number, month: number) {
  const date = new Date(isoTimestamp);
  return date.getFullYear() === year && date.getMonth() === month;
}

function isTimestampInMonth(isoTimestamp: string, year: number, month: number) {
  const date = new Date(isoTimestamp);
  return date.getFullYear() === year && date.getMonth() === month;
}

function formatLongDate(isoDate: string) {
  return parseDate(isoDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortCulteLabel(isoDate: string, type: CulteType) {
  const date = parseDate(isoDate);
  const day = date.getDate();
  const month = date
    .toLocaleDateString("fr-FR", { month: "short" })
    .replace(".", "");
  return type === "dim" ? `Dim. ${day} ${month}.` : `Mer. ${day} ${month}.`;
}

function formatBarLabel(isoDate: string) {
  const date = parseDate(isoDate);
  const day = date.getDate();
  const month = date
    .toLocaleDateString("fr-FR", { month: "short" })
    .replace(".", "");
  return `${day} ${month}.`;
}

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

function groupCountsByCulte(visitors: Visitor[]) {
  const counts = new Map<string, { date: string; type: CulteType; count: number }>();

  for (const visitor of visitors) {
    const key = `${visitor.culte_date}:${visitor.culte_type}`;
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, {
        date: visitor.culte_date,
        type: visitor.culte_type,
        count: 1,
      });
    }
  }

  return [...counts.values()].sort((a, b) => b.date.localeCompare(a.date));
}

function lastCulteStat(
  groups: ReturnType<typeof groupCountsByCulte>,
  type: CulteType,
  referenceDate = new Date(),
): LastCulteStat {
  const todayIso = toIsoDate(referenceDate);
  const typed = groups.filter(
    (group) => group.type === type && group.date <= todayIso,
  );
  const latest = typed[0];
  const previous = typed[1];

  if (!latest) {
    return { date: "—", culteDateIso: null, label: "—", count: 0, trend: null };
  }

  return {
    date: formatLongDate(latest.date),
    culteDateIso: latest.date,
    label: formatShortCulteLabel(latest.date, type),
    count: latest.count,
    trend: previous ? percentChange(latest.count, previous.count) : null,
  };
}

function isInPreviousWeek(isoDate: string, reference: Date) {
  const previousWeek = new Date(reference);
  previousWeek.setDate(previousWeek.getDate() - 7);
  return isInCurrentWeek(isoDate, previousWeek);
}

function buildCulteReports(
  visitors: Visitor[],
  adminNames: Map<string, string>,
): Record<string, CulteDayReport> {
  const reports: Record<string, CulteDayReport> = {};

  for (const visitor of visitors) {
    const key = visitor.culte_date;
    const data =
      visitor.data && typeof visitor.data === "object"
        ? (visitor.data as Record<string, unknown>)
        : {};

    const entry = {
      name: getVisitorDisplayName(data),
      registeredBy: adminNames.get(visitor.registered_by ?? "") ?? "—",
    };

    if (!reports[key]) {
      reports[key] = {
        date: visitor.culte_date,
        type: visitor.culte_type,
        visitors: [],
      };
    }

    reports[key].visitors.push(entry);
  }

  return reports;
}

export function followUpRate(count: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((count / total) * 100);
}

export async function getDashboardStats(
  referenceDate = new Date(),
): Promise<DashboardStats> {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const monthLabel = `${MONTHS_FR[month]} ${year}`;

  const rangeStart = new Date(year, month - 1, 1);
  const fromDate = `${rangeStart.getFullYear()}-${String(rangeStart.getMonth() + 1).padStart(2, "0")}-01`;

  const supabase = await createClient();

  const registeredFrom = new Date(year, month - 1, 1).toISOString();

  const [{ data: visitors, error }, { data: admins }] = await Promise.all([
    supabase
      .from("visitors")
      .select("*")
      .or(`culte_date.gte.${fromDate},created_at.gte.${registeredFrom}`)
      .order("created_at", { ascending: false }),
    supabase.from("admins").select("id, name"),
  ]);

  const rows = error || !visitors ? [] : visitors;
  const adminNames = new Map(
    (admins ?? []).map((admin) => [admin.id, admin.name.split(" ")[0] ?? admin.name]),
  );

  const culteGroups = groupCountsByCulte(rows);
  const dernierDimanche = lastCulteStat(culteGroups, "dim", referenceDate);
  const dernierMercredi = lastCulteStat(culteGroups, "mer", referenceDate);
  const weekVisitors = rows.filter((visitor) =>
    isInCurrentWeek(visitor.culte_date, referenceDate),
  );
  const prevWeekVisitors = rows.filter((visitor) =>
    isInPreviousWeek(visitor.culte_date, referenceDate),
  );
  const totalSemaine = weekVisitors.length;
  const totalSemainePrecedente = prevWeekVisitors.length;
  const weekRange: DashboardWeekRange | null =
    totalSemaine > 0
      ? {
          from: toIsoDate(getWeekStart(referenceDate)),
          to: toIsoDate(referenceDate),
        }
      : null;

  const monthVisitors = rows.filter((visitor) =>
    isInMonth(visitor.culte_date, year, month),
  );
  const registeredThisMonth = rows.filter((visitor) =>
    isCreatedInMonth(visitor.created_at, year, month),
  );
  const prevMonthRegistered = rows.filter((visitor) => {
    const prev = new Date(year, month - 1, 1);
    return isCreatedInMonth(
      visitor.created_at,
      prev.getFullYear(),
      prev.getMonth(),
    );
  });

  const totalMois = registeredThisMonth.length;
  const totalCulteMois = monthVisitors.length;
  const moisHint =
    totalCulteMois === totalMois
      ? "Fiches enregistrées ce mois"
      : `${totalMois} fiche${totalMois > 1 ? "s" : ""} saisie${totalMois > 1 ? "s" : ""} · ${totalCulteMois} arrivée${totalCulteMois > 1 ? "s" : ""} en culte ce mois`;
  const evolutionMois = percentChange(totalMois, prevMonthRegistered.length);

  const prevMonthVisitors = rows.filter((visitor) => {
    const prev = new Date(year, month - 1, 1);
    return isInMonth(visitor.culte_date, prev.getFullYear(), prev.getMonth());
  });

  const countFollowUp = (list: Visitor[], field: "visited_at" | "called_at" | "returned_at") =>
    list.filter((visitor) => visitor[field] !== null).length;

  const followUp = {
    visited: countFollowUp(monthVisitors, "visited_at"),
    called: countFollowUp(monthVisitors, "called_at"),
    returned: countFollowUp(monthVisitors, "returned_at"),
    totalRegistered: totalCulteMois,
    visitedTrend: percentChange(
      countFollowUp(monthVisitors, "visited_at"),
      countFollowUp(prevMonthVisitors, "visited_at"),
    ),
    calledTrend: percentChange(
      countFollowUp(monthVisitors, "called_at"),
      countFollowUp(prevMonthVisitors, "called_at"),
    ),
    returnedTrend: percentChange(
      countFollowUp(monthVisitors, "returned_at"),
      countFollowUp(prevMonthVisitors, "returned_at"),
    ),
  };

  const monthPrefix = monthKey(year, month);
  const culteBars = culteGroups
    .filter((group) => group.date.startsWith(monthPrefix))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((group) => ({
      label: formatBarLabel(group.date),
      type: group.type,
      count: group.count,
      date: group.date,
    }));

  const scheduledVisits = rows
    .filter(
      (visitor) =>
        visitor.visited_at !== null &&
        isTimestampInMonth(visitor.visited_at, year, month),
    )
    .sort((a, b) => {
      const dateA = a.visited_at ?? "";
      const dateB = b.visited_at ?? "";
      return dateA.localeCompare(dateB);
    })
    .slice(0, 5)
    .map((visitor) => {
      const data =
        visitor.data && typeof visitor.data === "object"
          ? (visitor.data as Record<string, unknown>)
          : {};
      return {
        id: visitor.id,
        name: getVisitorDisplayName(data),
        visitDateLabel: formatDateTimeFr(visitor.visited_at),
        isPast: new Date(visitor.visited_at!) < referenceDate,
      };
    });

  const culteReportsByDate = buildCulteReports(
    monthVisitors,
    adminNames,
  );

  return {
    monthLabel,
    monthKey: formatDashboardMonthParam(new Date(year, month, 1)),
    isCurrentMonth:
      year === new Date().getFullYear() && month === new Date().getMonth(),
    adminFirstName: "—",
    dernierDimanche,
    dernierMercredi,
    totalSemaine,
    weekRange,
    evolutionSemaine: percentChange(totalSemaine, totalSemainePrecedente),
    totalMois,
    totalCulteMois,
    moisHint,
    evolutionMois,
    followUp,
    culteBars,
    scheduledVisits,
    culteReportsByDate,
  };
}
