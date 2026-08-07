import type { CulteType, FieldDefinition, Json } from "@/lib/database.types";

export function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);
  if (value === null) return "";
  return String(value).trim();
}

export function isEmpty(value: string) {
  return value.length === 0;
}

export function toDateInputValue(iso: string | null | undefined) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function toTimeInputValue(iso: string | null | undefined, fallback = "10:00") {
  if (!iso) return fallback;

  const date = new Date(iso);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function combineDateAndTime(
  date: string,
  time: string,
): string | { error: string } {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { error: "Date invalide." };
  }

  if (!/^\d{2}:\d{2}$/.test(time)) {
    return { error: "Heure invalide." };
  }

  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  if (hours > 23 || minutes > 59) {
    return { error: "Heure invalide." };
  }

  return new Date(year, month - 1, day, hours, minutes, 0).toISOString();
}

export function parseFollowUpDate(formData: FormData, key: string): string | null {
  const raw = getFieldValue(formData, key);
  if (isEmpty(raw)) return null;
  return new Date(`${raw}T12:00:00`).toISOString();
}

export function parseReturnedAt(
  formData: FormData,
): string | null | { error: string } {
  const choice = getFieldValue(formData, "returned_choice");

  if (choice !== "oui") {
    return null;
  }

  const raw = getFieldValue(formData, "returned_at");
  if (isEmpty(raw)) {
    return { error: "Indiquez la date de retour au culte." };
  }

  return new Date(`${raw}T12:00:00`).toISOString();
}

export function parseVisitorFields(
  formData: FormData,
  fields: FieldDefinition[],
): { data: Record<string, Json> } | { error: string } {
  const data: Record<string, Json> = {};

  for (const field of fields) {
    const raw = getFieldValue(formData, field.key);

    if (field.field_type === "checkbox") {
      data[field.key] = formData.get(field.key) === "on";
      continue;
    }

    if (field.required && isEmpty(raw)) {
      return { error: `Le champ « ${field.label} » est requis.` };
    }

    if (!isEmpty(raw)) {
      data[field.key] = raw;
    }
  }

  return { data };
}

export function parseCulteFields(formData: FormData):
  | { culteDate: string; culteType: CulteType }
  | { error: string } {
  const culteDate = getFieldValue(formData, "culte_date");
  const culteType = getFieldValue(formData, "culte_type") as CulteType;

  if (!culteDate) {
    return { error: "La date du culte est requise." };
  }

  if (culteType !== "dim" && culteType !== "mer") {
    return { error: "Type de culte invalide." };
  }

  return { culteDate, culteType };
}
