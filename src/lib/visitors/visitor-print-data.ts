import type { Visitor } from "@/lib/database.types";
import { getVisitorDisplayName } from "@/lib/visitors/display-name";
import {
  formatDateFr,
  formatDateTimeFr,
  formatFieldValue,
} from "@/lib/visitors/format-field-value";

export type VisitorPrintField = {
  label: string;
  value: string;
};

export type VisitorPrintQuestion = {
  label: string;
  answer: string;
  note?: string;
};

export type VisitorPrintData = {
  displayName: string;
  culteTypeLabel: string;
  culteDateLabel: string;
  registeredAtLabel: string;
  registeredByName: string;
  identity: VisitorPrintField[];
  contact: VisitorPrintField[];
  spiritual: VisitorPrintField[];
  sponsor: VisitorPrintField[];
  questions: VisitorPrintQuestion[];
  followUp: VisitorPrintField[];
  remarques: string | null;
  generatedAt: string;
};

const QUESTIONS = [
  { key: "visite_autorisee", label: "Pouvons-nous vous visiter ?" },
  {
    key: "rencontrer_apotre",
    label: "Souhaitez-vous personnellement rencontrer l'Apôtre ?",
  },
  {
    key: "culte_apprecie",
    label: "Avez-vous aimé notre culte d'adoration et de louange ?",
  },
  {
    key: "participer_cultes",
    label: "Voudrez-vous bien participer désormais à nos cultes ?",
  },
  {
    key: "desir_membre_cir",
    label: "Désirez-vous être membre de notre communauté (CIR) ?",
  },
] as const;

function val(data: Record<string, unknown>, key: string) {
  return formatFieldValue(data[key]);
}

function field(label: string, value: string): VisitorPrintField {
  return { label, value: value === "—" ? "Non renseigné" : value };
}

function followUpValue(iso: string | null, withTime = false) {
  if (!iso) return "Non";
  return withTime ? formatDateTimeFr(iso) : formatDateFr(iso);
}

export function buildVisitorPrintData(
  visitor: Visitor,
  registeredByName: string | null = null,
  generatedAt = new Date(),
): VisitorPrintData {
  const data =
    visitor.data && typeof visitor.data === "object"
      ? (visitor.data as Record<string, unknown>)
      : {};

  const preoccupation = val(data, "preoccupation_apotre");
  const remarques = val(data, "remarques");

  return {
    displayName: getVisitorDisplayName(data),
    culteTypeLabel: visitor.culte_type === "dim" ? "Dimanche" : "Mercredi",
    culteDateLabel: formatDateFr(visitor.culte_date),
    registeredAtLabel: formatDateFr(visitor.created_at),
    registeredByName: registeredByName ?? "—",
    identity: [
      field("Nom", val(data, "nom")),
      field("Prénoms", val(data, "prenoms")),
      field("Âge", val(data, "age")),
      field("Profession", val(data, "profession")),
      field("Situation matrimoniale", val(data, "situation_matrimoniale")),
    ],
    contact: [
      field("Contacts (Tél)", val(data, "contact_tel")),
      field("Adresse précise", val(data, "adresse")),
    ],
    spiritual: [
      field("Église habituelle fréquentée", val(data, "eglise_habituelle")),
    ],
    sponsor: [
      field("Invité par — Nom", val(data, "invite_par_nom")),
      field("Invité par — Contact", val(data, "invite_par_contact")),
    ],
    questions: QUESTIONS.map((item) => ({
      label: item.label,
      answer: val(data, item.key),
      note:
        item.key === "rencontrer_apotre" && val(data, item.key) === "Oui"
          ? preoccupation === "—"
            ? undefined
            : `Objet : ${preoccupation}`
          : undefined,
    })),
    followUp: [
      field("Visite programmée", followUpValue(visitor.visited_at, true)),
      field("Appel programmé", followUpValue(visitor.called_at, true)),
      field("Revenue", followUpValue(visitor.returned_at)),
    ],
    remarques: remarques === "—" ? null : remarques,
    generatedAt: generatedAt.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };
}
