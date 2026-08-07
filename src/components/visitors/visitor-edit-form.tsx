"use client";

import { useActionState, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateVisitor,
  type VisitorActionState,
} from "@/lib/visitors/actions";
import type { FieldDefinition, Visitor } from "@/lib/database.types";
import { todayLocalIsoDate } from "@/lib/culte-utils";
import { toDateInputValue } from "@/lib/visitors/form-utils";
import { cn } from "@/lib/utils";

type VisitorEditFormProps = {
  visitor: Visitor;
  fields: FieldDefinition[];
};

const initialState: VisitorActionState = {};

const SECTION_LABELS: Record<string, string> = {
  identite: "1. Votre identité",
  questions: "2. Questions personnelles",
  remarques: "Remarques",
  general: "Informations",
};

const FULL_WIDTH_TEXTAREA_KEYS = new Set([
  "adresse",
  "preoccupation_apotre",
  "remarques",
]);

const GRID_PAIR_KEYS = new Set([
  "nom",
  "prenoms",
  "invite_par_nom",
  "invite_par_contact",
]);

function getSection(field: FieldDefinition) {
  const row = field as FieldDefinition & { section?: string };
  return row.section ?? "general";
}

function parseSelectOptions(options: FieldDefinition["options"]) {
  if (!options || !Array.isArray(options)) return [];
  return options
    .map((entry) => {
      if (typeof entry === "string") return entry;
      if (entry && typeof entry === "object" && "value" in entry) {
        return String((entry as { value: string }).value);
      }
      return null;
    })
    .filter((value): value is string => Boolean(value));
}

function getDefaultValue(
  field: FieldDefinition,
  data: Record<string, unknown>,
): string {
  const value = data[field.key];
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "on" : "";
  return String(value);
}

function DynamicField({
  field,
  defaultValue,
}: {
  field: FieldDefinition;
  defaultValue: string;
}) {
  const common = {
    id: field.key,
    name: field.key,
    required: field.required,
    defaultValue,
    className: cn(
      "livento-input w-full",
      field.field_type === "textarea" && "min-h-24 px-2.5 py-2",
      (field.field_type === "select" || field.field_type === "textarea") &&
        "rounded-lg border border-input bg-transparent text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
    ),
  };

  if (field.field_type === "textarea") {
    return <textarea {...common} rows={3} />;
  }

  if (field.field_type === "select") {
    const options = parseSelectOptions(field.options);
    return (
      <select {...common} defaultValue={defaultValue || ""}>
        <option value="" disabled>
          Choisir…
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (field.field_type === "checkbox") {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          id={field.key}
          name={field.key}
          defaultChecked={defaultValue === "true" || defaultValue === "on"}
          className="size-4 rounded border-input"
        />
        {field.label}
      </label>
    );
  }

  const inputType =
    field.field_type === "email"
      ? "email"
      : field.field_type === "phone"
        ? "tel"
        : field.field_type === "date"
          ? "date"
          : "text";

  return <Input type={inputType} {...common} />;
}

function groupFieldsBySection(fields: FieldDefinition[]) {
  const sections = new Map<string, FieldDefinition[]>();

  for (const field of fields) {
    const section = getSection(field);
    const list = sections.get(section) ?? [];
    list.push(field);
    sections.set(section, list);
  }

  return sections;
}

function renderField(field: FieldDefinition, data: Record<string, unknown>) {
  return (
    <div
      key={field.id}
      className={cn(
        "space-y-2",
        GRID_PAIR_KEYS.has(field.key) && "sm:col-span-1",
        field.key === "age" && "sm:max-w-[120px]",
      )}
    >
      {field.field_type !== "checkbox" && (
        <Label htmlFor={field.key} className="livento-label">
          {field.label}
          {field.required && <span className="text-destructive"> *</span>}
        </Label>
      )}
      <DynamicField field={field} defaultValue={getDefaultValue(field, data)} />
    </div>
  );
}

export function VisitorEditForm({ visitor, fields }: VisitorEditFormProps) {
  const [state, formAction, pending] = useActionState(
    updateVisitor,
    initialState,
  );
  const [returnedChoice, setReturnedChoice] = useState<"oui" | "non">(
    visitor.returned_at ? "oui" : "non",
  );

  const data =
    visitor.data && typeof visitor.data === "object"
      ? (visitor.data as Record<string, unknown>)
      : {};

  const sections = groupFieldsBySection(fields);
  const sectionOrder = ["identite", "questions", "remarques", "general"];

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="visitor_id" value={visitor.id} />

      <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Culte
        </p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="culte_date" className="livento-label">
              Date
            </Label>
            <Input
              id="culte_date"
              name="culte_date"
              type="date"
              required
              defaultValue={visitor.culte_date}
              className="livento-input"
            />
            <p className="text-xs text-muted-foreground">
              Date de la première visite au culte (dimanche ou mercredi)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="culte_type" className="livento-label">
              Type de culte
            </Label>
            <select
              id="culte_type"
              name="culte_type"
              required
              defaultValue={visitor.culte_type}
              className="livento-input h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              <option value="dim">Dimanche</option>
              <option value="mer">Mercredi</option>
            </select>
          </div>
        </div>
      </div>

      {sectionOrder.map((sectionKey) => {
        const sectionFields = sections.get(sectionKey);
        if (!sectionFields?.length) return null;

        return (
          <section key={sectionKey} className="space-y-5">
            <h3 className="livento-section-title text-base before:hidden">
              {SECTION_LABELS[sectionKey] ?? sectionKey}
            </h3>
            <div
              className={cn(
                "grid gap-5",
                sectionKey === "identite" ? "sm:grid-cols-2" : "grid-cols-1",
              )}
            >
              {sectionFields.map((field) => {
                if (field.key === "age") {
                  return (
                    <div key={field.id} className="sm:col-span-2 sm:max-w-[140px]">
                      {renderField(field, data)}
                    </div>
                  );
                }

                if (FULL_WIDTH_TEXTAREA_KEYS.has(field.key)) {
                  return (
                    <div key={field.id} className="sm:col-span-2">
                      {renderField(field, data)}
                    </div>
                  );
                }

                return renderField(field, data);
              })}
            </div>
          </section>
        );
      })}

      <section id="suivi-pastoral" className="space-y-5 scroll-mt-24">
        <div>
          <h3 className="livento-section-title text-base before:hidden">
            Suivi pastoral
          </h3>
          <p className="livento-section-desc">
            Indiquez la date de chaque étape de suivi (laissez vide si non
            effectué)
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="visited_at" className="livento-label">
              Visite programmée
            </Label>
            <Input
              id="visited_at"
              name="visited_at"
              type="date"
              defaultValue={toDateInputValue(visitor.visited_at)}
              className="livento-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="called_at" className="livento-label">
              Appelée
            </Label>
            <Input
              id="called_at"
              name="called_at"
              type="date"
              defaultValue={toDateInputValue(visitor.called_at)}
              className="livento-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="returned_choice" className="livento-label">
              Revenue
            </Label>
            <select
              id="returned_choice"
              name="returned_choice"
              value={returnedChoice}
              onChange={(event) =>
                setReturnedChoice(event.target.value as "oui" | "non")
              }
              className="livento-input h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              <option value="non">Non</option>
              <option value="oui">Oui</option>
            </select>
            {returnedChoice === "oui" && (
              <div className="space-y-2 pt-1">
                <Label htmlFor="returned_at" className="livento-label">
                  Date de retour
                </Label>
                <Input
                  id="returned_at"
                  name="returned_at"
                  type="date"
                  required
                  defaultValue={
                    toDateInputValue(visitor.returned_at) || todayLocalIsoDate()
                  }
                  className="livento-input"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      {state.success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.success}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="dash-btn-primary h-11 w-full sm:w-auto sm:px-8"
      >
        {pending ? "Enregistrement…" : "Enregistrer les modifications"}
        <Save className="size-4" />
      </Button>
    </form>
  );
}
