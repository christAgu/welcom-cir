import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { VisitorEditForm } from "@/components/visitors/visitor-edit-form";
import { getVisitorDisplayName } from "@/lib/visitors/display-name";
import {
  getActiveFieldDefinitions,
  getVisitorWithMeta,
} from "@/lib/visitors/queries";

type PersonneModifierPageProps = {
  params: Promise<{ id: string }>;
};

function culteLabel(type: string) {
  return type === "mer" ? "Mercredi" : "Dimanche";
}

export default async function PersonneModifierPage({
  params,
}: PersonneModifierPageProps) {
  const { id } = await params;
  const [meta, fields] = await Promise.all([
    getVisitorWithMeta(id),
    getActiveFieldDefinitions(),
  ]);

  if (!meta) notFound();

  const { visitor } = meta;
  const data =
    visitor.data && typeof visitor.data === "object"
      ? (visitor.data as Record<string, unknown>)
      : {};
  const displayName = getVisitorDisplayName(data);

  return (
    <DashboardPage narrow>
      <DashboardHeader
        title={`Modifier — ${displayName}`}
        description="Mettez à jour les informations et le suivi pastoral"
        badge={culteLabel(visitor.culte_type)}
        actions={
          <Link
            href={`/dashboard/personnes/${id}`}
            className="dash-btn-secondary h-10 px-4"
          >
            <ArrowLeft className="size-4" />
            Retour à la fiche
          </Link>
        }
      />
        <div className="bento-card">
          {fields.length === 0 ? (
            <p className="text-sm text-slate-500">
              Aucun champ de formulaire actif. Contactez un super admin.
            </p>
          ) : (
            <VisitorEditForm visitor={visitor} fields={fields} />
          )}
        </div>
    </DashboardPage>
  );
}
