import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { ExportDateForm } from "@/components/export/export-date-form";
import { ExportResults } from "@/components/export/export-results";
import {
  getExportRangeStats,
  resolveExportRange,
} from "@/lib/visitors/export-stats";

type ExportPageProps = {
  searchParams: Promise<{ from?: string; to?: string }>;
};

export default async function ExportPage({ searchParams }: ExportPageProps) {
  const params = await searchParams;
  const range = resolveExportRange(params.from, params.to);
  const stats =
    range.error === null
      ? await getExportRangeStats(range.from, range.to)
      : null;

  return (
    <DashboardPage>
      <DashboardHeader
        title="Export"
        description="Exporter les données sur une plage de dates personnalisée"
        badge="Export"
      />

      <div className="space-y-5">
        <ExportDateForm from={range.from} to={range.to} error={range.error} />

        {stats && <ExportResults stats={stats} />}
      </div>
    </DashboardPage>
  );
}
