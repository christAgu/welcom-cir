import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardPage } from "@/components/layout/dashboard-page";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FollowUpBadges } from "@/components/visitors/follow-up-status";
import { getCulteDayStats } from "@/lib/visitors/month-stats";
import { cn } from "@/lib/utils";

type CulteDayStatsPageProps = {
  params: Promise<{ yearMonth: string; date: string }>;
};

function culteBadgeClass(type: string) {
  return type === "mer"
    ? "rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700"
    : "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700";
}

export default async function CulteDayStatsPage({ params }: CulteDayStatsPageProps) {
  const { yearMonth, date } = await params;
  const stats = await getCulteDayStats(yearMonth, date);

  if (!stats) notFound();

  return (
    <DashboardPage>
      <DashboardHeader
        badge={stats.typeLabel}
        title={stats.dateLabel}
        description={`${stats.count} personne${stats.count > 1 ? "s" : ""} accueillie${stats.count > 1 ? "s" : ""} · ${stats.monthLabel}`}
        actions={
          <>
            <Link
              href={`/dashboard/stats/${stats.yearMonth}/${stats.date}/print`}
              target="_blank"
              rel="noopener noreferrer"
              className="dash-btn-secondary inline-flex h-10 items-center gap-2 px-4 text-sm font-semibold"
            >
              <Download className="size-4" />
              Export PDF
            </Link>
            <Link
              href={`/dashboard/stats/${stats.yearMonth}`}
              className="dash-btn-secondary inline-flex h-10 items-center gap-2 px-4 text-sm font-semibold"
            >
              <ArrowLeft className="size-4" />
              {stats.monthLabel}
            </Link>
          </>
        }
      />

      <div className="bento-card dash-table-card">
        {stats.count === 0 ? (
          <div className="py-12 text-center">
            <span className={cn(culteBadgeClass(stats.type), "inline-block")}>
              {stats.typeLabel}
            </span>
            <p className="mt-4 text-sm text-slate-500">
              Aucune fiche enregistrée pour ce culte.
            </p>
            <Link
              href={`/dashboard/stats/${stats.yearMonth}`}
              className="mt-4 inline-flex text-sm font-semibold text-blue-600 hover:underline"
            >
              Retour au détail du mois
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Enregistré le</TableHead>
                <TableHead>Par</TableHead>
                <TableHead>Suivi pastoral</TableHead>
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
                  <TableCell>{visitor.registeredAtLabel}</TableCell>
                  <TableCell>{visitor.registeredByName}</TableCell>
                  <TableCell>
                    <FollowUpBadges
                      visitor={{
                        visited_at: visitor.visited ? "1" : null,
                        called_at: visitor.called ? "1" : null,
                        returned_at: visitor.returned ? "1" : null,
                      }}
                      compact
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </DashboardPage>
  );
}
