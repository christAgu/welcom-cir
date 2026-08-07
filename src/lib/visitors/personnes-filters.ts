const CULTE_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export type PersonnesFilter =
  | { type: "all" }
  | { type: "culte_date"; date: string; label: string }
  | { type: "culte_range"; from: string; to: string; label: string }
  | { type: "culte_month"; month: string; label: string }
  | { type: "registered_month"; month: string; label: string };

function parseDateParam(value?: string | null) {
  if (!value || !CULTE_DATE_RE.test(value)) return null;
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

function formatCulteDateLabel(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

export function parsePersonnesFilter(params: {
  culte?: string | null;
  from?: string | null;
  to?: string | null;
  culte_month?: string | null;
  registered_month?: string | null;
}): PersonnesFilter {
  const culte = parseDateParam(params.culte);
  if (culte) {
    return {
      type: "culte_date",
      date: culte,
      label: formatCulteDateLabel(culte),
    };
  }

  const from = parseDateParam(params.from);
  const to = parseDateParam(params.to);
  if (from && to && from <= to) {
    const fromLabel = new Date(`${from}T12:00:00`).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
    const toLabel = new Date(`${to}T12:00:00`).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return {
      type: "culte_range",
      from,
      to,
      label: `Semaine du ${fromLabel} au ${toLabel}`,
    };
  }

  const month = params.culte_month?.trim();
  if (month && MONTH_RE.test(month)) {
    return {
      type: "culte_month",
      month,
      label: `Culte — ${formatMonthLabel(month)}`,
    };
  }

  const registeredMonth = params.registered_month?.trim();
  if (registeredMonth && MONTH_RE.test(registeredMonth)) {
    return {
      type: "registered_month",
      month: registeredMonth,
      label: `Fiches saisies — ${formatMonthLabel(registeredMonth)}`,
    };
  }

  return { type: "all" };
}

export function personnesFilterQueryString(
  filter: PersonnesFilter,
  extras?: { q?: string; page?: number; created?: string },
) {
  const params = new URLSearchParams();

  if (filter.type === "culte_date") {
    params.set("culte", filter.date);
  } else if (filter.type === "culte_range") {
    params.set("from", filter.from);
    params.set("to", filter.to);
  } else if (filter.type === "culte_month") {
    params.set("culte_month", filter.month);
  } else if (filter.type === "registered_month") {
    params.set("registered_month", filter.month);
  }

  if (extras?.q) params.set("q", extras.q);
  if (extras?.created) params.set("created", extras.created);
  if (extras?.page && extras.page > 1) params.set("page", String(extras.page));

  return params.toString();
}

export function personnesFilterHref(
  filter: PersonnesFilter,
  extras?: { q?: string; page?: number; created?: string },
) {
  const qs = personnesFilterQueryString(filter, extras);
  return qs ? `/dashboard/personnes?${qs}` : "/dashboard/personnes";
}
