import type { FieldDefinition } from "@/lib/database.types";

export function formatFieldValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Oui" : "Non";
  }

  return String(value);
}

export function formatFieldDisplay(
  field: FieldDefinition,
  data: Record<string, unknown>,
): string {
  return formatFieldValue(data[field.key]);
}

export function formatDateFr(iso: string | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!iso) return "—";

  return new Date(iso).toLocaleDateString(
    "fr-FR",
    options ?? { day: "numeric", month: "long", year: "numeric" },
  );
}

export function formatDateTimeFr(iso: string | null | undefined) {
  if (!iso) return "—";

  return new Date(iso).toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatReturnedDisplay(returnedAt: string | null) {
  if (!returnedAt) {
    return "Non";
  }

  return `Oui · ${formatDateFr(returnedAt)}`;
}
