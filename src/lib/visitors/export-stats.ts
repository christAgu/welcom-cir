import { createClient } from "@/lib/supabase/server";
import { todayLocalIsoDate, toDateKey } from "@/lib/culte-utils";
import type { Visitor } from "@/lib/database.types";
import { getVisitorDisplayName } from "@/lib/visitors/display-name";
import type { ReportVisitor } from "@/lib/visitors/report-stats";

const DATE_PARAM_RE = /^\d{4}-\d{2}-\d{2}$/;

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

export type ExportRangeStats = {
  from: string;
  to: string;
  rangeHint: string;
  count: number;
  dimCount: number;
  merCount: number;
  visitors: ReportVisitor[];
};

export type ResolvedExportRange = {
  from: string;
  to: string;
  error: string | null;
};

function parseIsoDate(iso: string) {
  return new Date(`${iso}T12:00:00`);
}

function parseDateParam(value?: string | null) {
  if (!value || !DATE_PARAM_RE.test(value)) return null;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return value;
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

  if (start.getTime() === end.getTime()) {
    return formatDateFr(from);
  }

  if (start.getFullYear() === end.getFullYear()) {
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} – ${end.getDate()} ${formatMonthShort(end)} ${end.getFullYear()}`;
    }

    return `${formatMonthShort(start)} – ${formatMonthShort(end)} ${end.getFullYear()}`;
  }

  return `${formatMonthShort(start)} ${start.getFullYear()} – ${formatMonthShort(end)} ${end.getFullYear()}`;
}

function defaultRangeFrom() {
  const now = new Date();
  return toDateKey(new Date(now.getFullYear(), now.getMonth(), 1));
}

export function resolveExportRange(
  fromParam?: string | null,
  toParam?: string | null,
): ResolvedExportRange {
  const from = parseDateParam(fromParam) ?? defaultRangeFrom();
  const to = parseDateParam(toParam) ?? todayLocalIsoDate();

  if (from > to) {
    return {
      from,
      to,
      error: "La date de début doit être antérieure ou égale à la date de fin.",
    };
  }

  return { from, to, error: null };
}

function mapVisitor(
  visitor: Pick<Visitor, "id" | "culte_date" | "culte_type" | "data" | "created_at">,
): ReportVisitor {
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

export async function getExportRangeStats(
  from: string,
  to: string,
): Promise<ExportRangeStats> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("visitors")
    .select("id, culte_date, culte_type, data, created_at")
    .gte("culte_date", from)
    .lte("culte_date", to)
    .order("culte_date", { ascending: false })
    .order("created_at", { ascending: false });

  const rows = error || !data ? [] : data;
  const visitors = rows.map(mapVisitor);

  return {
    from,
    to,
    rangeHint: formatRangeHint(from, to),
    count: visitors.length,
    dimCount: visitors.filter((visitor) => visitor.culteType === "dim").length,
    merCount: visitors.filter((visitor) => visitor.culteType === "mer").length,
    visitors,
  };
}
