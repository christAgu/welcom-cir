import Link from "next/link";
import { Download } from "lucide-react";
import { StatCard } from "@/components/stats/stat-card";
import { ChapelDay } from "@/components/icons/chapel-day";
import { ChapelNight } from "@/components/icons/chapel-night";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ExportRangeStats } from "@/lib/visitors/export-stats";
import { cn } from "@/lib/utils";

type ExportResultsProps = {
  stats: ExportRangeStats;
};

export function ExportResults({ stats }: ExportResultsProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard
          label="Total accueillis"
          value={stats.count}
          hint={stats.rangeHint}
          icon={ChapelDay}
          iconTone="emerald"
        />
        <StatCard
          label="Dimanches"
          value={stats.dimCount}
          hint="Sur la plage sélectionnée"
          icon={ChapelDay}
          iconTone="amber"
        />
        <StatCard
          label="Mercredis"
          value={stats.merCount}
          hint="Sur la plage sélectionnée"
          icon={ChapelNight}
          iconTone="indigo"
        />
      </div>

      <section className="bento-card dash-table-card">
        <div className="dash-section-head">
          <div>
            <h2 className="livento-section-title">Résultats</h2>
            <p className="livento-section-desc">
              {stats.count} personne{stats.count > 1 ? "s" : ""} · {stats.rangeHint}
            </p>
          </div>
          <Link
            href={`/dashboard/export/print?from=${stats.from}&to=${stats.to}`}
            target="_blank"
            rel="noopener noreferrer"
            className="dash-btn-primary inline-flex h-10 items-center gap-2 px-5"
          >
            <Download className="size-4" />
            Export PDF
          </Link>
        </div>

        {stats.visitors.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-center text-sm text-slate-500">
            Aucun nouveau venu sur cette plage de dates.
          </p>
        ) : (
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
              {stats.visitors.map((visitor) => (
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
        )}
      </section>
    </div>
  );
}
