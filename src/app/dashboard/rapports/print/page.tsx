import { notFound } from "next/navigation";
import { ReportPrintView } from "@/components/reports/report-print-view";
import {
  getReportPeriodStats,
  isReportPeriodId,
} from "@/lib/visitors/report-stats";

type RapportPrintPageProps = {
  searchParams: Promise<{ period?: string }>;
};

export default async function RapportPrintPage({
  searchParams,
}: RapportPrintPageProps) {
  const params = await searchParams;
  const periodParam = params.period ?? "week";

  if (!isReportPeriodId(periodParam)) {
    notFound();
  }

  const period = await getReportPeriodStats(periodParam);
  const generatedAt = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return <ReportPrintView period={period} generatedAt={generatedAt} />;
}
