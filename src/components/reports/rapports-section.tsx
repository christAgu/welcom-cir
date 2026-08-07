"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BarChart3,
  Calendar,
  CalendarDays,
  CalendarRange,
  Download,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/stats/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  ReportPeriodId,
  ReportPeriodStats,
} from "@/lib/visitors/report-stats";
import { cn } from "@/lib/utils";

const PERIOD_ICONS = {
  week: CalendarDays,
  month: Calendar,
  "3m": CalendarRange,
  "6m": TrendingUp,
  year: BarChart3,
} as const;

const PERIOD_TONES = {
  week: "rose",
  month: "indigo",
  "3m": "blue",
  "6m": "violet",
  year: "emerald",
} as const;

type RapportsSectionProps = {
  periods: ReportPeriodStats[];
};

export function RapportsSection({ periods }: RapportsSectionProps) {
  const [selectedId, setSelectedId] = useState<ReportPeriodId>("week");

  const selected = useMemo(
    () => periods.find((period) => period.id === selectedId) ?? periods[0],
    [periods, selectedId],
  );

  if (!selected) {
    return (
      <div className="bento-card">
        <p className="text-sm text-slate-500">Aucune donnée disponible.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {periods.map((period) => {
          const Icon = PERIOD_ICONS[period.id];
          const tone = PERIOD_TONES[period.id];

          return (
            <button
              key={period.id}
              type="button"
              onClick={() => setSelectedId(period.id)}
              className="text-left"
            >
              <StatCard
                label={period.title}
                value={period.count}
                hint={period.rangeHint}
                icon={Icon}
                iconTone={tone}
                trendBadge="personnes"
                selected={selectedId === period.id}
                className="h-full w-full cursor-pointer"
              />
            </button>
          );
        })}
      </div>

      <section className="bento-card">
        <div className="dash-section-head">
          <div>
            <h2 className="livento-section-title">{selected.title}</h2>
            <p className="livento-section-desc">
              {selected.count} personne{selected.count > 1 ? "s" : ""} accueillie
              {selected.count > 1 ? "s" : ""} · {selected.rangeHint}
            </p>
          </div>
          <Link
            href={`/dashboard/rapports/print?period=${selected.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="dash-btn-primary h-10 px-5"
          >
            <Download className="size-4" />
            Export PDF
          </Link>
        </div>

        {selected.visitors.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-center text-sm text-slate-500">
            Aucun nouveau venu enregistré sur cette période.
          </p>
        ) : (
          <div className="dash-table-card overflow-hidden rounded-2xl border border-slate-100">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Culte</TableHead>
                  <TableHead>Date de culte</TableHead>
                  <TableHead>Enregistré le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selected.visitors.map((visitor) => (
                  <TableRow key={visitor.id}>
                    <TableCell className="font-semibold text-slate-900">
                      <Link
                        href={`/dashboard/personnes/${visitor.id}`}
                        className="transition-colors hover:text-blue-600"
                      >
                        {visitor.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-semibold",
                          visitor.culteType === "mer"
                            ? "bg-indigo-50 text-indigo-700"
                            : "bg-amber-50 text-amber-700",
                        )}
                      >
                        {visitor.culteTypeLabel}
                      </span>
                    </TableCell>
                    <TableCell>{visitor.culteDateLabel}</TableCell>
                    <TableCell>{visitor.registeredAtLabel}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
