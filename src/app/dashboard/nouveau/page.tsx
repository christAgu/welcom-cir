import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { VisitorForm } from "@/components/visitors/visitor-form";
import { defaultCulteDateIso } from "@/lib/culte-utils";
import { getActiveFieldDefinitions } from "@/lib/visitors/queries";

export default async function NouveauPage() {
  const fields = await getActiveFieldDefinitions();

  return (
    <DashboardPage narrow>
      <DashboardHeader
        title="Fiche de contact"
        description="Enregistrement des nouveaux venus — CIR Palais de Dieu"
        badge="Nouveaux venus"
      />
        <div className="bento-card">
          {fields.length === 0 ? (
            <p className="text-sm text-slate-500">
              Aucun champ de formulaire actif. Contactez un super admin.
            </p>
          ) : (
            <VisitorForm fields={fields} defaultCulteDate={defaultCulteDateIso()} />
          )}
        </div>
    </DashboardPage>
  );
}
