import { notFound } from "next/navigation";
import { VisitorPrintView } from "@/components/visitors/visitor-print-view";
import { buildVisitorPrintData } from "@/lib/visitors/visitor-print-data";
import { getVisitorWithMeta } from "@/lib/visitors/queries";

type VisitorPrintPageProps = {
  params: Promise<{ id: string }>;
};

export default async function VisitorPrintPage({ params }: VisitorPrintPageProps) {
  const { id } = await params;
  const meta = await getVisitorWithMeta(id);

  if (!meta) notFound();

  const data = buildVisitorPrintData(meta.visitor, meta.registeredByName);

  return <VisitorPrintView data={data} visitorId={meta.visitor.id} />;
}
