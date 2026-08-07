import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { RapportsSection } from "@/components/reports/rapports-section";
import { getAllReportStats } from "@/lib/visitors/report-stats";

export default async function RapportsPage() {
  const { periods } = await getAllReportStats();

  return (
    <DashboardPage>
      <DashboardHeader
        title="Rapports"
        description="Cliquez sur une carte pour voir le détail et télécharger le PDF"
        badge="Analytics"
      />
      <p className="text-sm text-slate-500">
        Les totaux sont calculés sur la date de culte (première visite).
      </p>
      <RapportsSection periods={periods} />
    </DashboardPage>
  );
}
