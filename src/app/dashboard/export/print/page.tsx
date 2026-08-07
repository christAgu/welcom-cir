import { notFound } from "next/navigation";
import { ExportPrintView } from "@/components/export/export-print-view";
import {
  getExportRangeStats,
  resolveExportRange,
} from "@/lib/visitors/export-stats";

type ExportPrintPageProps = {
  searchParams: Promise<{ from?: string; to?: string }>;
};

export default async function ExportPrintPage({
  searchParams,
}: ExportPrintPageProps) {
  const params = await searchParams;
  const range = resolveExportRange(params.from, params.to);

  if (range.error) notFound();

  const stats = await getExportRangeStats(range.from, range.to);
  const generatedAt = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return <ExportPrintView stats={stats} generatedAt={generatedAt} />;
}
