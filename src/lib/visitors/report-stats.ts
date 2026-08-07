import { createClient } from "@/lib/supabase/server";
import type { CulteType, Visitor } from "@/lib/database.types";
import { getVisitorDisplayName } from "@/lib/visitors/display-name";

export type ReportPeriodId = "week" | "month" | "3m" | "6m" | "year";

export const REPORT_PERIOD_IDS: ReportPeriodId[] = [
  "week",
  "month",
  "3m",
  "6m",
  "year",
];

export type ReportVisitor = {
  id: string;
  name: string;
  culteDate: string;
  culteDateLabel: string;
  culteType: CulteType;
  culteTypeLabel: string;
  registeredAt: string;
  registeredAtLabel: string;
};

export type ReportPeriodStats = {
  id: ReportPeriodId;
  title: string;
  rangeHint: string;
  count: number;
  trend: number | null;
  visitors: ReportVisitor[];
};

const MONTHS_SHORT_FR = [
  "Jan.",
  "Fév.",
  "Mar.",
  "Avr.",
  "Mai",
  "Juin",
  "Juil.",
  "Août",
  "Sep.",
  "Oct.",
  "Nov.",
  "Déc.",
] as const;

function toIsoDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseIsoDate(iso: string) {
  return new Date(`${iso}T12:00:00`);
}

function formatDateFr(iso: string) {
  return parseIsoDate(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatMonthShort(date: Date) {
  return MONTHS_SHORT_FR[date.getMonth()];
}

function formatRangeHint(from: string, to: string) {
  const start = parseIsoDate(from);
  const end = parseIsoDate(to);

  if (start.getFullYear() === end.getFullYear()) {
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} – ${end.getDate()} ${formatMonthShort(end)} ${end.getFullYear()}`;
    }

    return `${formatMonthShort(start)} – ${formatMonthShort(end)} ${end.getFullYear()}`;
  }

  return `${formatMonthShort(start)} ${start.getFullYear()} – ${formatMonthShort(end)} ${end.getFullYear()}`;
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

function getPeriodBounds(period: ReportPeriodId, reference = new Date()) {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const day = reference.getDate();

  if (period === "week") {
    const from = getWeekStart(reference);
    const to = new Date(year, month, day);

    return {
      from: toIsoDate(from),
      to: toIsoDate(to),
      rangeHint: formatRangeHint(toIsoDate(from), toIsoDate(to)),
    };
  }

  if (period === "month") {
    const from = new Date(year, month, 1);
    const to = new Date(year, month, day);

    return {
      from: toIsoDate(from),
      to: toIsoDate(to),
      rangeHint: formatRangeHint(toIsoDate(from), toIsoDate(to)),
    };
  }

  if (period === "year") {
    return {
      from: `${year}-01-01`,
      to: toIsoDate(reference),
      rangeHint: `${MONTHS_SHORT_FR[0]} – ${formatMonthShort(reference)} ${year}`,
    };
  }

  const monthSpan = period === "3m" ? 3 : 6;
  const from = new Date(year, month - (monthSpan - 1), 1);
  const to = new Date(year, month, day);

  return {
    from: toIsoDate(from),
    to: toIsoDate(to),
    rangeHint: formatRangeHint(toIsoDate(from), toIsoDate(to)),
  };
}

function getPreviousPeriodBounds(period: ReportPeriodId, reference = new Date()) {
  const year = reference.getFullYear();
  const month = reference.getMonth();

  if (period === "week") {
    const weekStart = getWeekStart(reference);
    const previousEnd = new Date(
      weekStart.getFullYear(),
      weekStart.getMonth(),
      weekStart.getDate() - 1,
    );
    const previousStart = new Date(
      previousEnd.getFullYear(),
      previousEnd.getMonth(),
      previousEnd.getDate() - 6,
    );

    return {
      from: toIsoDate(previousStart),
      to: toIsoDate(previousEnd),
    };
  }

  if (period === "month") {
    const previousEnd = new Date(year, month, 0);
    const previousStart = new Date(year, month - 1, 1);

    return {
      from: toIsoDate(previousStart),
      to: toIsoDate(previousEnd),
    };
  }

  if (period === "year") {
    return {
      from: `${year - 1}-01-01`,
      to: `${year - 1}-12-31`,
    };
  }

  const current = getPeriodBounds(period, reference);
  const currentFrom = parseIsoDate(current.from);
  const previousEnd = new Date(
    currentFrom.getFullYear(),
    currentFrom.getMonth(),
    0,
  );
  const monthSpan = period === "3m" ? 3 : 6;
  const previousStart = new Date(
    previousEnd.getFullYear(),
    previousEnd.getMonth() - (monthSpan - 1),
    1,
  );

  return {
    from: toIsoDate(previousStart),
    to: toIsoDate(previousEnd),
  };
}

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

function mapVisitor(visitor: Pick<Visitor, "id" | "culte_date" | "culte_type" | "data" | "created_at">): ReportVisitor {
  const data =
    visitor.data && typeof visitor.data === "object"
      ? (visitor.data as Record<string, unknown>)
      : {};

  return {
    id: visitor.id,
    name: getVisitorDisplayName(data),
    culteDate: visitor.culte_date,
    culteDateLabel: formatDateFr(visitor.culte_date),
    culteType: visitor.culte_type,
    culteTypeLabel: visitor.culte_type === "mer" ? "Mercredi" : "Dimanche",
    registeredAt: visitor.created_at,
    registeredAtLabel: formatDateFr(visitor.created_at),
  };
}

function filterVisitorsByCulteDate(
  visitors: Pick<Visitor, "id" | "culte_date" | "culte_type" | "data" | "created_at">[],
  from: string,
  to: string,
) {
  return visitors
    .filter(
      (visitor) => visitor.culte_date >= from && visitor.culte_date <= to,
    )
    .sort((a, b) => b.culte_date.localeCompare(a.culte_date))
    .map(mapVisitor);
}

async function fetchVisitorsFrom(from: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("visitors")
    .select("id, culte_date, culte_type, data, created_at")
    .gte("culte_date", from)
    .order("culte_date", { ascending: false });

  if (error || !data) return [];
  return data;
}

const PERIOD_META: Record<
  ReportPeriodId,
  { title: string }
> = {
  week: { title: "Semaine en cours" },
  month: { title: "Mois en cours" },
  "3m": { title: "3 derniers mois" },
  "6m": { title: "6 derniers mois" },
  year: { title: "Année en cours" },
};

export async function getReportPeriodStats(
  period: ReportPeriodId,
  reference = new Date(),
): Promise<ReportPeriodStats> {
  const bounds = getPeriodBounds(period, reference);
  const previousBounds = getPreviousPeriodBounds(period, reference);
  const visitors = await fetchVisitorsFrom(previousBounds.from);

  const currentVisitors = filterVisitorsByCulteDate(
    visitors,
    bounds.from,
    bounds.to,
  );
  const previousCount = filterVisitorsByCulteDate(
    visitors,
    previousBounds.from,
    previousBounds.to,
  ).length;

  return {
    id: period,
    title: PERIOD_META[period].title,
    rangeHint: bounds.rangeHint,
    count: currentVisitors.length,
    trend: percentChange(currentVisitors.length, previousCount),
    visitors: currentVisitors,
  };
}

export async function getAllReportStats(reference = new Date()) {
  const periods = await Promise.all(
    REPORT_PERIOD_IDS.map((period) => getReportPeriodStats(period, reference)),
  );

  return {
    periods,
    generatedAt: reference.toISOString(),
  };
}

export function isReportPeriodId(value: string): value is ReportPeriodId {
  return (REPORT_PERIOD_IDS as string[]).includes(value);
}
