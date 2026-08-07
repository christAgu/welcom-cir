import { notFound } from "next/navigation";
import { MonthStatsPrintView } from "@/components/stats/month-stats-print-view";
import { getMonthStats } from "@/lib/visitors/month-stats";

type MonthStatsPrintPageProps = {
  params: Promise<{ yearMonth: string }>;
};

export default async function MonthStatsPrintPage({
  params,
}: MonthStatsPrintPageProps) {
  const { yearMonth } = await params;
  const stats = await getMonthStats(yearMonth);

  if (!stats) notFound();

  const generatedAt = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return <MonthStatsPrintView stats={stats} generatedAt={generatedAt} />;
}
