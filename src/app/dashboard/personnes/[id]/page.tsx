import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { VisitorDetailView } from "@/components/visitors/visitor-detail-view";
import { getVisitorWithMeta } from "@/lib/visitors/queries";

type PersonneDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
};

export default async function PersonneDetailPage({
  params,
  searchParams,
}: PersonneDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const meta = await getVisitorWithMeta(id);

  if (!meta) notFound();

  return (
    <DashboardPage>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard/personnes" className="dash-btn-secondary h-10 px-4">
          <ArrowLeft className="size-4" />
          Retour à la liste
        </Link>
      </div>

      {query.saved === "1" && (
        <div className="dash-alert-success">
          <span className="dash-alert-success-dot" />
          Fiche mise à jour avec succès.
        </div>
      )}

      <VisitorDetailView visitor={meta.visitor} />
    </DashboardPage>
  );
}
