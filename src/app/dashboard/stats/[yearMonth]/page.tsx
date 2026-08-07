import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Download,
  Home,
  Phone,
  UserCheck,
} from "lucide-react";
import { ChapelDay } from "@/components/icons/chapel-day";
import { ChapelNight } from "@/components/icons/chapel-night";
import { DashboardMonthPicker } from "@/components/dashboard/dashboard-month-picker";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { StatCard } from "@/components/stats/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMonthStats } from "@/lib/visitors/month-stats";
import { cn } from "@/lib/utils";

type MonthStatsPageProps = {
  params: Promise<{ yearMonth: string }>;
};

function culteBadgeClass(type: string) {
  return type === "mer"
    ? "rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700"
    : "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700";
}

export default async function MonthStatsPage({ params }: MonthStatsPageProps) {
  const { yearMonth } = await params;
  const stats = await getMonthStats(yearMonth);

  if (!stats) notFound();

  return (
    <DashboardPage>
      <DashboardHeader
        badge="Statistiques"
        title={stats.monthLabel}
        description="Détail du mois — accueils par culte et suivi pastoral"
        actions={
          <>
            <Link
              href={`/dashboard/stats/${stats.yearMonth}/print`}
              target="_blank"
              rel="noopener noreferrer"
              className="dash-btn-secondary inline-flex h-10 items-center gap-2 px-4 text-sm font-semibold"
            >
              <Download className="size-4" />
              Export PDF
            </Link>
            <Link
              href={`/dashboard?month=${stats.yearMonth}`}
              className="dash-btn-secondary inline-flex h-10 items-center gap-2 px-4 text-sm font-semibold"
            >
              <ArrowLeft className="size-4" />
              Dashboard
            </Link>
          </>
        }
      />

      <section className="space-y-5">
        <div className="dash-section-head">
          <div>
            <h2 className="livento-section-title">Vue d&apos;ensemble</h2>
            <p className="livento-section-desc">
              Accueils en culte et fiches saisies — {stats.monthLabel.toLowerCase()}
            </p>
          </div>
          <DashboardMonthPicker
            monthKey={stats.yearMonth}
            monthLabel={stats.monthLabel}
            variant="stats"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Accueillies en culte"
            value={stats.totalCulte}
            hint="Personnes dont la date de culte est ce mois"
            icon={CalendarDays}
            iconTone="emerald"
          />
          <StatCard
            label="Fiches saisies"
            value={stats.totalRegistered}
            hint="Enregistrées ce mois (date de saisie)"
            icon={CalendarDays}
            iconTone="blue"
          />
          <StatCard
            label="Dimanches"
            value={stats.dimTotal}
            hint={`${stats.dimCultes} culte${stats.dimCultes > 1 ? "s" : ""} avec accueils`}
            icon={ChapelDay}
            iconTone="amber"
          />
          <StatCard
            label="Mercredis"
            value={stats.merTotal}
            hint={`${stats.merCultes} culte${stats.merCultes > 1 ? "s" : ""} avec accueils`}
            icon={ChapelNight}
            iconTone="indigo"
          />
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <h2 className="livento-section-title">Suivi pastoral</h2>
          <p className="livento-section-desc">
            Sur les accueils de {stats.monthLabel.toLowerCase()}
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <StatCard
            label="Visitées"
            value={stats.followUp.visited}
            icon={Home}
            iconTone="rose"
          />
          <StatCard
            label="Appelées"
            value={stats.followUp.called}
            icon={Phone}
            iconTone="blue"
          />
          <StatCard
            label="Revenues"
            value={stats.followUp.returned}
            icon={UserCheck}
            iconTone="emerald"
          />
        </div>
      </section>

      <section className="bento-card dash-table-card">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="livento-section-title">Cultes du mois</h2>
            <p className="livento-section-desc">
              Cliquez sur une date pour voir la liste des personnes
            </p>
          </div>
        </div>

        {stats.cultes.length === 0 ? (
          <p className="text-sm text-slate-500">
            Aucun accueil enregistré pour ce mois.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Culte</TableHead>
                <TableHead className="text-right">Accueillies</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.cultes.map((culte) => (
                <TableRow key={culte.date}>
                  <TableCell className="font-semibold text-slate-900">
                    <Link
                      href={`/dashboard/stats/${stats.yearMonth}/${culte.date}`}
                      className="transition-colors hover:text-blue-600"
                    >
                      {culte.dateLabel}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className={culteBadgeClass(culte.type)}>{culte.typeLabel}</span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-900">
                    {culte.count}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/stats/${stats.yearMonth}/${culte.date}`}
                      className={cn(
                        "inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600",
                      )}
                      aria-label={`Voir ${culte.dateLabel}`}
                    >
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </DashboardPage>
  );
}
