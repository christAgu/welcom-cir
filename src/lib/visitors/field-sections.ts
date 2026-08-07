import type { FieldDefinition } from "@/lib/database.types";

export const SECTION_LABELS: Record<string, string> = {
  identite: "1. Votre identité",
  questions: "2. Questions personnelles",
  remarques: "Remarques",
  general: "Informations",
};

export const SECTION_ORDER = ["identite", "questions", "remarques", "general"] as const;

export function getFieldSection(field: FieldDefinition) {
  const row = field as FieldDefinition & { section?: string };
  return row.section ?? "general";
}

export function groupFieldsBySection(fields: FieldDefinition[]) {
  const sections = new Map<string, FieldDefinition[]>();

  for (const field of fields) {
    const section = getFieldSection(field);
    const list = sections.get(section) ?? [];
    list.push(field);
    sections.set(section, list);
  }

  return sections;
}
