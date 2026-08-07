import { createClient } from "@/lib/supabase/server";
import type { CulteType } from "@/lib/culte-data";
import { formatCulteDayLabel } from "@/lib/culte-utils";
import { parseDashboardMonthParam } from "@/lib/dashboard-month";
import type { Visitor } from "@/lib/database.types";
import { getVisitorDisplayName } from "@/lib/visitors/display-name";
import { formatDateFr } from "@/lib/visitors/format-field-value";

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

const DATE_PARAM_RE = /^\d{4}-\d{2}-\d{2}$/;

export type MonthCulteSummary = {
  date: string;
  dateLabel: string;
  type: CulteType;
  typeLabel: string;
  count: number;
};

export type MonthStats = {
  yearMonth: string;
  monthLabel: string;
  totalCulte: number;
  totalRegistered: number;
  dimTotal: number;
  merTotal: number;
  dimCultes: number;
  merCultes: number;
  cultes: MonthCulteSummary[];
  followUp: {
    visited: number;
    called: number;
    returned: number;
  };
};

export type CulteDayVisitorRow = {
  id: string;
  name: string;
  registeredAtLabel: string;
  registeredByName: string;
  visited: boolean;
  called: boolean;
  returned: boolean;
};

export type CulteDayStats = {
  yearMonth: string;
  monthLabel: string;
  date: string;
  dateLabel: string;
  type: CulteType;
  typeLabel: string;
  count: number;
  visitors: CulteDayVisitorRow[];
};

function monthLabelFromKey(yearMonth: string) {
  const parsed = parseDashboardMonthParam(yearMonth);
  if (!parsed) return yearMonth;
  return `${MONTHS_FR[parsed.month]} ${parsed.year}`;
}

function isCreatedInMonth(isoTimestamp: string, year: number, month: number) {
  const date = new Date(isoTimestamp);
  return date.getFullYear() === year && date.getMonth() === month;
}

function culteTypeLabel(type: CulteType) {
  return type === "dim" ? "Dimanche" : "Mercredi";
}

function groupCultes(visitors: Visitor[]): MonthCulteSummary[] {
  const groups = new Map<string, MonthCulteSummary>();

  for (const visitor of visitors) {
    const existing = groups.get(visitor.culte_date);
    if (existing) {
      existing.count += 1;
    } else {
      groups.set(visitor.culte_date, {
        date: visitor.culte_date,
        dateLabel: formatCulteDayLabel(visitor.culte_date, visitor.culte_type),
        type: visitor.culte_type,
        typeLabel: culteTypeLabel(visitor.culte_type),
        count: 1,
      });
    }
  }

  return [...groups.values()].sort((a, b) => b.date.localeCompare(a.date));
}

function mapVisitorRow(
  visitor: Visitor,
  adminNames: Map<string, string>,
): CulteDayVisitorRow {
  const data =
    visitor.data && typeof visitor.data === "object"
      ? (visitor.data as Record<string, unknown>)
      : {};

  return {
    id: visitor.id,
    name: getVisitorDisplayName(data),
    registeredAtLabel: formatDateFr(visitor.created_at),
    registeredByName: adminNames.get(visitor.registered_by ?? "") ?? "—",
    visited: visitor.visited_at !== null,
    called: visitor.called_at !== null,
    returned: visitor.returned_at !== null,
  };
}

export function parseYearMonthParam(value: string) {
  return parseDashboardMonthParam(value);
}

export function parseCulteDateParam(value: string, yearMonth: string) {
  if (!DATE_PARAM_RE.test(value)) return null;

  const month = parseDashboardMonthParam(yearMonth);
  if (!month) return null;

  const [year, mon, day] = value.split("-").map(Number);
  if (year !== month.year || mon - 1 !== month.month) return null;

  const date = new Date(year, mon - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== mon - 1 || date.getDate() !== day) {
    return null;
  }

  return value;
}

export async function getMonthStats(yearMonth: string): Promise<MonthStats | null> {
  const parsed = parseDashboardMonthParam(yearMonth);
  if (!parsed) return null;

  const { year, month } = parsed;
  const monthStart = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const nextMonth = new Date(year, month + 1, 1);
  const monthEnd = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}-01`;

  const supabase = await createClient();

  const [{ data: visitors, error }, { data: admins }] = await Promise.all([
    supabase
      .from("visitors")
      .select("*")
      .gte("culte_date", monthStart)
      .lt("culte_date", monthEnd)
      .order("culte_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("admins").select("id, name"),
  ]);

  if (error || !visitors) return null;

  const cultes = groupCultes(visitors);
  const dimCultes = cultes.filter((culte) => culte.type === "dim");
  const merCultes = cultes.filter((culte) => culte.type === "mer");

  const registeredThisMonth = visitors.filter((visitor) =>
    isCreatedInMonth(visitor.created_at, year, month),
  );

  return {
    yearMonth,
    monthLabel: monthLabelFromKey(yearMonth),
    totalCulte: visitors.length,
    totalRegistered: registeredThisMonth.length,
    dimTotal: dimCultes.reduce((sum, culte) => sum + culte.count, 0),
    merTotal: merCultes.reduce((sum, culte) => sum + culte.count, 0),
    dimCultes: dimCultes.length,
    merCultes: merCultes.length,
    cultes,
    followUp: {
      visited: visitors.filter((v) => v.visited_at !== null).length,
      called: visitors.filter((v) => v.called_at !== null).length,
      returned: visitors.filter((v) => v.returned_at !== null).length,
    },
  };
}

export async function getCulteDayStats(
  yearMonth: string,
  date: string,
): Promise<CulteDayStats | null> {
  const parsedDate = parseCulteDateParam(date, yearMonth);
  if (!parsedDate) return null;

  const supabase = await createClient();

  const [{ data: visitors, error }, { data: admins }] = await Promise.all([
    supabase
      .from("visitors")
      .select("*")
      .eq("culte_date", parsedDate)
      .order("created_at", { ascending: true }),
    supabase.from("admins").select("id, name"),
  ]);

  if (error || !visitors || visitors.length === 0) {
    const emptyType: CulteType =
      new Date(`${parsedDate}T12:00:00`).getDay() === 3 ? "mer" : "dim";

    return {
      yearMonth,
      monthLabel: monthLabelFromKey(yearMonth),
      date: parsedDate,
      dateLabel: formatCulteDayLabel(parsedDate, emptyType),
      type: emptyType,
      typeLabel: culteTypeLabel(emptyType),
      count: 0,
      visitors: [],
    };
  }

  const adminNames = new Map(
    (admins ?? []).map((admin) => [admin.id, admin.name]),
  );

  const first = visitors[0];

  return {
    yearMonth,
    monthLabel: monthLabelFromKey(yearMonth),
    date: parsedDate,
    dateLabel: formatCulteDayLabel(parsedDate, first.culte_type),
    type: first.culte_type,
    typeLabel: culteTypeLabel(first.culte_type),
    count: visitors.length,
    visitors: visitors.map((visitor) => mapVisitorRow(visitor, adminNames)),
  };
}
