import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Church,
  ClipboardList,
  Download,
  Home,
  MapPin,
  Pencil,
  Phone,
  Sparkles,
  User,
  UserPlus,
} from "lucide-react";
import { ChapelDay } from "@/components/icons/chapel-day";
import { ChapelNight } from "@/components/icons/chapel-night";
import { FollowUpDetailPanel } from "@/components/visitors/follow-up-detail-panel";
import { DeleteVisitorDialog } from "@/components/visitors/delete-visitor-dialog";
import type { Visitor } from "@/lib/database.types";
import {
  formatDateFr,
  formatFieldValue,
} from "@/lib/visitors/format-field-value";
import { cn } from "@/lib/utils";

type VisitorDetailViewProps = {
  visitor: Visitor;
};

function val(data: Record<string, unknown>, key: string) {
  return formatFieldValue(data[key]);
}

function isMissing(value: string) {
  return value === "—";
}

function EmptyValue() {
  return <span className="text-sm italic text-slate-400">Non renseigné</span>;
}

function YesNoPill({ value }: { value: string }) {
  if (value === "Oui") {
    return (
      <span className="inline-flex shrink-0 items-center rounded-full bg-[#DCFCE7] px-3.5 py-1.5 text-xs font-bold tracking-wide text-green-700 shadow-sm ring-1 ring-green-200/60">
        Oui
      </span>
    );
  }

  if (value === "Non") {
    return (
      <span className="inline-flex shrink-0 items-center rounded-full bg-[#FEE2E2] px-3.5 py-1.5 text-xs font-bold tracking-wide text-red-600 shadow-sm ring-1 ring-red-200/60">
        Non
      </span>
    );
  }

  return <EmptyValue />;
}

function InfoCard({
  title,
  subtitle,
  icon: Icon,
  accent,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  icon: typeof User;
  accent: "blue" | "amber" | "orange" | "emerald" | "violet" | "slate";
  children: React.ReactNode;
  className?: string;
}) {
  const accents = {
    blue: {
      bar: "bg-blue-500",
      icon: "bg-blue-50 text-[#0057d8] ring-1 ring-blue-100/80",
    },
    amber: {
      bar: "bg-amber-500",
      icon: "bg-amber-50 text-amber-600 ring-1 ring-amber-100/80",
    },
    orange: {
      bar: "bg-orange-500",
      icon: "bg-orange-50 text-orange-600 ring-1 ring-orange-100/80",
    },
    emerald: {
      bar: "bg-emerald-500",
      icon: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100/80",
    },
    violet: {
      bar: "bg-violet-500",
      icon: "bg-violet-50 text-violet-600 ring-1 ring-violet-100/80",
    },
    slate: {
      bar: "bg-slate-400",
      icon: "bg-slate-100 text-slate-600 ring-1 ring-slate-200/80",
    },
  }[accent];

  return (
    <section className={cn("bento-card bento-card-hover group", className)}>
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-0.5",
          accents.bar,
        )}
      />

      <div className="relative mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              accents.icon,
            )}
          >
            <Icon className="size-[18px]" strokeWidth={2.1} />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-slate-900">
              {title}
            </h3>
            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      <div className="relative space-y-3">{children}</div>
    </section>
  );
}

function FieldTile({
  label,
  value,
  highlight,
  href,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  href?: string;
}) {
  const content = isMissing(value) ? (
    <EmptyValue />
  ) : (
    <p
      className={cn(
        "break-words font-semibold text-slate-900",
        highlight ? "text-xl tracking-tight" : "text-base",
      )}
    >
      {value}
    </p>
  );

  return (
    <div className="rounded-2xl border border-slate-100/80 bg-gradient-to-br from-slate-50/90 to-white p-4 transition-colors group-hover:border-slate-200/80">
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      {href && !isMissing(value) ? (
        <a
          href={href}
          className="inline-flex items-center gap-1.5 text-base font-semibold text-blue-600 transition-colors hover:text-blue-700"
        >
          {value}
          <ArrowUpRight className="size-3.5 opacity-60" />
        </a>
      ) : (
        content
      )}
    </div>
  );
}

function QuestionRow({
  index,
  question,
  answer,
  children,
}: {
  index: number;
  question: string;
  answer: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-100/80 bg-gradient-to-br from-slate-50/50 to-white p-4 transition-all hover:border-blue-100 hover:shadow-sm">
      <div className="flex items-start gap-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#0057d8] text-xs font-bold text-white shadow-md shadow-blue-500/20">
          {String(index).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <p className="text-sm font-semibold leading-snug text-slate-800">
              {question}
            </p>
            <YesNoPill value={answer} />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function VisitorDetailView({ visitor }: VisitorDetailViewProps) {
  const data =
    visitor.data && typeof visitor.data === "object"
      ? (visitor.data as Record<string, unknown>)
      : {};

  const nom = val(data, "nom");
  const prenoms = val(data, "prenoms");
  const situation = val(data, "situation_matrimoniale");
  const desirMembre = val(data, "desir_membre_cir");
  const rencontrerApotre = val(data, "rencontrer_apotre");
  const preoccupation = val(data, "preoccupation_apotre");
  const remarques = val(data, "remarques");
  const contactTel = val(data, "contact_tel");
  const isDim = visitor.culte_type === "dim";
  const CulteIcon = isDim ? ChapelDay : ChapelNight;

  const displayTitle = [prenoms, nom]
    .filter((part) => !isMissing(part))
    .join(" ");

  const questions = [
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
  ];

  const yesCount = questions.filter((q) => val(data, q.key) === "Oui").length;

  return (
    <div className="pb-24">
      {/* Hero profil */}
      <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-10 top-0 size-56 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="absolute -right-10 bottom-0 size-56 rounded-full bg-violet-400/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.08),transparent_45%)]" />
        </div>

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-700">
              <Sparkles className="size-3.5" />
              Fiche nouveau venu
            </div>

            <div>
              {!isMissing(prenoms) && (
                <p className="text-sm font-medium text-slate-500">{prenoms}</p>
              )}
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                {!isMissing(nom) ? nom : displayTitle || "Sans nom"}
              </h1>
            </div>

            <div className="flex flex-wrap gap-2">
              {!isMissing(situation) && (
                <span className="rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                  {situation}
                </span>
              )}
              {desirMembre === "Oui" && (
                <span className="rounded-full bg-[#DCFCE7] px-3.5 py-1.5 text-xs font-bold text-green-700 ring-1 ring-green-200/70">
                  Souhaite devenir membre
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 lg:items-end">
            <p className="text-sm text-slate-500">
              Cotonou, le{" "}
              <span className="font-semibold text-slate-700">
                {formatDateFr(visitor.created_at)}
              </span>
            </p>
            <div
              className={cn(
                "inline-flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm",
                isDim
                  ? "border-amber-100 bg-amber-50/80"
                  : "border-indigo-100 bg-indigo-50/80",
              )}
            >
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-xl",
                  isDim
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                    : "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25",
                )}
              >
                <CulteIcon className="size-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {isDim ? "Dimanche" : "Mercredi"}
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {formatDateFr(visitor.culte_date)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
          {[
            {
              label: "Réponses positives",
              value: yesCount,
              hint: "sur 5 questions",
            },
            {
              label: "Contact",
              value: isMissing(contactTel) ? "—" : contactTel,
              hint: "téléphone",
            },
            {
              label: "Profession",
              value: val(data, "profession"),
              hint: "activité",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-100/80 bg-slate-50/70 px-4 py-3 backdrop-blur-sm"
            >
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {stat.label}
              </p>
              <p className="mt-1 truncate text-2xl font-extrabold tracking-tight text-slate-950">
                {stat.value}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{stat.hint}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Grille bento */}
      <div className="mt-5 grid gap-5 lg:grid-cols-12">
        <InfoCard
          title="Suivi pastoral"
          subtitle="Visitée, appelée et revenue"
          icon={Home}
          accent="emerald"
          className="lg:col-span-12"
        >
          <FollowUpDetailPanel
            visitor={visitor}
            visitorName={displayTitle || "Sans nom"}
          />
        </InfoCard>

        <InfoCard
          title="Identité"
          subtitle="Informations personnelles"
          icon={User}
          accent="blue"
          className="lg:col-span-6"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldTile label="Nom" value={nom} highlight />
            <FieldTile label="Prénoms" value={prenoms} />
            <FieldTile label="Âge" value={val(data, "age")} />
            <FieldTile label="Profession" value={val(data, "profession")} />
          </div>
          <div className="rounded-2xl border border-slate-100/80 bg-gradient-to-br from-blue-50/50 to-white p-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Situation matrimoniale
            </p>
            {isMissing(situation) ? (
              <EmptyValue />
            ) : (
              <span className="inline-flex rounded-full bg-blue-100 px-3.5 py-1.5 text-sm font-bold text-blue-700">
                {situation}
              </span>
            )}
          </div>
        </InfoCard>

        <InfoCard
          title="Contact & adresse"
          subtitle="Coordonnées et localisation"
          icon={Phone}
          accent="amber"
          className="lg:col-span-6"
        >
          <FieldTile
            label="Contacts (Tél)"
            value={contactTel}
            href={!isMissing(contactTel) ? `tel:${contactTel}` : undefined}
          />
          <FieldTile
            label="Adresse précise"
            value={val(data, "adresse")}
          />
        </InfoCard>

        <InfoCard
          title="Vie spirituelle"
          subtitle="Parcours ecclésial"
          icon={Church}
          accent="orange"
          className="lg:col-span-5"
        >
          <FieldTile
            label="Église habituelle fréquentée"
            value={val(data, "eglise_habituelle")}
          />
        </InfoCard>

        <InfoCard
          title="Invité par"
          subtitle="Parrainage et recommandation"
          icon={UserPlus}
          accent="emerald"
          className="lg:col-span-7"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldTile label="Nom" value={val(data, "invite_par_nom")} />
            <FieldTile
              label="Contact (Tél)"
              value={val(data, "invite_par_contact")}
              href={
                !isMissing(val(data, "invite_par_contact"))
                  ? `tel:${val(data, "invite_par_contact")}`
                  : undefined
              }
            />
          </div>
        </InfoCard>

        <InfoCard
          title="Questions personnelles"
          subtitle="Réponses du formulaire d'accueil"
          icon={ClipboardList}
          accent="violet"
          className="lg:col-span-12"
        >
          <div className="grid gap-3">
            {questions.map((item, index) => (
              <QuestionRow
                key={item.key}
                index={index + 1}
                question={item.label}
                answer={val(data, item.key)}
              >
                {item.key === "rencontrer_apotre" &&
                rencontrerApotre === "Oui" ? (
                  <div className="mt-4 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100/40 p-4 ring-1 ring-blue-100/50">
                    <p className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-blue-600">
                      <MapPin className="size-3.5" />
                      Objet de la préoccupation
                    </p>
                    {isMissing(preoccupation) ? (
                      <EmptyValue />
                    ) : (
                      <p className="text-sm leading-relaxed font-medium text-slate-800">
                        {preoccupation}
                      </p>
                    )}
                  </div>
                ) : null}
              </QuestionRow>
            ))}
          </div>
        </InfoCard>

        {!isMissing(remarques) && (
          <InfoCard
            title="Remarques"
            subtitle="Notes complémentaires"
            icon={ClipboardList}
            accent="slate"
            className="lg:col-span-12"
          >
            <blockquote className="rounded-2xl border-l-4 border-slate-300 bg-slate-50/80 px-5 py-4 text-sm leading-relaxed text-slate-700">
              {remarques}
            </blockquote>
          </InfoCard>
        )}
      </div>

      {/* Barre d'action sticky */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200/60 bg-white/85 px-4 py-4 backdrop-blur-xl lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-bold text-slate-900">
              {displayTitle || "Sans nom"}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <CalendarDays className="size-3.5" />
              Enregistrée le {formatDateFr(visitor.created_at)}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
            <Link
              href={`/dashboard/personnes/${visitor.id}/print`}
              target="_blank"
              rel="noopener noreferrer"
              className="dash-btn-secondary inline-flex h-12 items-center justify-center gap-2 px-5 text-sm font-semibold sm:w-auto"
            >
              <Download className="size-4" />
              Export PDF
            </Link>
            <Link
              href={`/dashboard/personnes/${visitor.id}/modifier`}
              className="dash-btn-primary inline-flex h-12 w-full items-center justify-center gap-2 px-8 text-sm font-bold sm:w-auto"
            >
              <Pencil className="size-4" />
              Modifier la fiche
            </Link>
            <DeleteVisitorDialog
              visitorId={visitor.id}
              visitorName={displayTitle || "Sans nom"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
