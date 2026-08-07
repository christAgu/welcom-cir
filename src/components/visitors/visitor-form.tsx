"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createVisitor,
  type VisitorActionState,
} from "@/lib/visitors/actions";
import type { FieldDefinition } from "@/lib/database.types";
import { cn } from "@/lib/utils";

type VisitorFormProps = {
  fields: FieldDefinition[];
  defaultCulteDate?: string;
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

function DynamicField({ field }: { field: FieldDefinition }) {
  const common = {
    id: field.key,
    name: field.key,
    required: field.required,
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
      <select {...common} defaultValue="">
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

function renderField(field: FieldDefinition) {
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
      <DynamicField field={field} />
    </div>
  );
}

export function VisitorForm({ fields, defaultCulteDate }: VisitorFormProps) {
  const [state, formAction, pending] = useActionState(
    createVisitor,
    initialState,
  );

  const sections = groupFieldsBySection(fields);
  const sectionOrder = ["identite", "questions", "remarques", "general"];

  return (
    <form action={formAction} className="space-y-8">
      <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Culte du jour
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
              defaultValue={defaultCulteDate}
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
              defaultValue="dim"
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
                sectionKey === "identite"
                  ? "sm:grid-cols-2"
                  : "grid-cols-1",
              )}
            >
              {sectionFields.map((field) => {
                if (field.key === "age") {
                  return (
                    <div key={field.id} className="sm:col-span-2 sm:max-w-[140px]">
                      {renderField(field)}
                    </div>
                  );
                }

                if (FULL_WIDTH_TEXTAREA_KEYS.has(field.key)) {
                  return (
                    <div key={field.id} className="sm:col-span-2">
                      {renderField(field)}
                    </div>
                  );
                }

                return renderField(field);
              })}
            </div>
          </section>
        );
      })}

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="dash-btn-primary h-11 w-full sm:w-auto sm:px-8"
      >
        {pending ? "Enregistrement…" : "Enregistrer la fiche"}
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}
