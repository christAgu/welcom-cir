import { notFound } from "next/navigation";
import { CulteDayPrintView } from "@/components/stats/culte-day-print-view";
import { getCulteDayStats } from "@/lib/visitors/month-stats";

type CulteDayPrintPageProps = {
  params: Promise<{ yearMonth: string; date: string }>;
};

export default async function CulteDayPrintPage({ params }: CulteDayPrintPageProps) {
  const { yearMonth, date } = await params;
  const stats = await getCulteDayStats(yearMonth, date);

  if (!stats) notFound();

  const generatedAt = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return <CulteDayPrintView stats={stats} generatedAt={generatedAt} />;
}
