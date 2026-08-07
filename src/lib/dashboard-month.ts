const MONTH_PARAM_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export function parseDashboardMonthParam(value?: string | null) {
  if (!value || !MONTH_PARAM_RE.test(value)) {
    return null;
  }

  const [year, month] = value.split("-").map(Number);
  return { year, month: month - 1 };
}

export function formatDashboardMonthParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function resolveDashboardReferenceDate(monthParam?: string | null) {
  const now = new Date();
  const parsed = parseDashboardMonthParam(monthParam);

  if (!parsed) {
    return { referenceDate: now, monthKey: formatDashboardMonthParam(now), isCurrentMonth: true };
  }

  const isCurrentMonth =
    parsed.year === now.getFullYear() && parsed.month === now.getMonth();

  if (isCurrentMonth) {
    return {
      referenceDate: now,
      monthKey: formatDashboardMonthParam(now),
      isCurrentMonth: true,
    };
  }

  const lastDay = new Date(parsed.year, parsed.month + 1, 0, 23, 59, 59, 999);

  return {
    referenceDate: lastDay,
    monthKey: formatDashboardMonthParam(lastDay),
    isCurrentMonth: false,
  };
}

export function shiftDashboardMonth(monthKey: string, delta: number) {
  const parsed = parseDashboardMonthParam(monthKey);
  if (!parsed) return formatDashboardMonthParam(new Date());

  const date = new Date(parsed.year, parsed.month + delta, 1);
  return formatDashboardMonthParam(date);
}

export function canNavigateDashboardMonth(monthKey: string, direction: "prev" | "next") {
  const parsed = parseDashboardMonthParam(monthKey);
  if (!parsed) return direction === "prev";

  const now = new Date();
  const currentKey = formatDashboardMonthParam(now);

  if (direction === "next") {
    return monthKey < currentKey;
  }

  return true;
}
