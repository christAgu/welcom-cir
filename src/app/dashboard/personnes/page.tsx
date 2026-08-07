import Link from "next/link";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { DashboardLinkButton } from "@/components/ui/dashboard-link-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FollowUpBadges } from "@/components/visitors/follow-up-status";
import { VisitorsPagination } from "@/components/visitors/visitors-pagination";
import {
  listVisitorsFilteredPage,
  parseVisitorsPageParam,
  searchVisitorsPage,
} from "@/lib/visitors/queries";
import { getVisitorDisplayName } from "@/lib/visitors/display-name";
import { parsePersonnesFilter } from "@/lib/visitors/personnes-filters";
import { cn } from "@/lib/utils";

type PersonnesPageProps = {
  searchParams: Promise<{
    created?: string;
    q?: string;
    page?: string;
    culte?: string;
    from?: string;
    to?: string;
    culte_month?: string;
    registered_month?: string;
  }>;
};

function culteLabel(type: string) {
  return type === "mer" ? "Mercredi" : "Dimanche";
}

function culteBadgeClass(type: string) {
  return type === "mer"
    ? "rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700"
    : "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700";
}

export default async function PersonnesPage({ searchParams }: PersonnesPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const isSearching = query.length >= 2;
  const page = parseVisitorsPageParam(params.page);
  const filter = parsePersonnesFilter(params);
  const hasPeriodFilter = filter.type !== "all";

  const result = isSearching
    ? await searchVisitorsPage(query, page)
    : await listVisitorsFilteredPage(filter, page);

  const { visitors, total, totalPages } = result;

  const description = isSearching
    ? `${total} résultat${total > 1 ? "s" : ""} pour « ${query} »`
    : hasPeriodFilter
      ? `${total} personne${total > 1 ? "s" : ""} · ${filter.label}`
      : `${total} personne${total > 1 ? "s" : ""} enregistrée${total > 1 ? "s" : ""}`;

  return (
    <DashboardPage>
        <DashboardHeader
          title="Nouvelles âmes"
          description={description}
          badge="Annuaire"
          actions={
            <DashboardLinkButton
              href="/dashboard/nouveau"
              className="dash-btn-primary h-9 px-3.5 text-xs font-semibold shadow-md hover:scale-100"
            >
              Nouvelle personne
            </DashboardLinkButton>
          }
        />
        {params.created === "1" && (
          <div className="dash-alert-success">
            <span className="dash-alert-success-dot" />
            Personne enregistrée avec succès.
          </div>
        )}

        {isSearching && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-slate-700">
            <span>
              Recherche active : <strong>{query}</strong>
            </span>
            <Link
              href="/dashboard/personnes"
              className="font-semibold text-blue-600 hover:underline"
            >
              Effacer
            </Link>
          </div>
        )}

        {hasPeriodFilter && !isSearching && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-sm text-slate-700">
            <span>
              Période : <strong>{filter.label}</strong>
            </span>
            <Link
              href="/dashboard/personnes"
              className="font-semibold text-blue-600 hover:underline"
            >
              Voir toutes les personnes
            </Link>
          </div>
        )}

        <div className="bento-card dash-table-card overflow-hidden">
          {total === 0 ? (
            <p className="p-8 text-sm text-slate-500">
              {isSearching ? (
                <>
                  Aucune personne ne correspond à « {query} ».{" "}
                  <Link
                    href="/dashboard/personnes"
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    Voir toutes les personnes
                  </Link>
                </>
              ) : hasPeriodFilter ? (
                <>
                  Aucune personne accueillie sur cette période.{" "}
                  <Link
                    href="/dashboard/personnes"
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    Voir toutes les personnes
                  </Link>
                </>
              ) : (
                <>
                  Aucune personne enregistrée pour l&apos;instant.{" "}
                  <Link
                    href="/dashboard/nouveau"
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    Ajouter la première fiche
                  </Link>
                </>
              )}
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Culte</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Enregistré le</TableHead>
                    <TableHead>Suivi pastoral</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visitors.map((visitor) => {
                    const data =
                      visitor.data && typeof visitor.data === "object"
                        ? (visitor.data as Record<string, unknown>)
                        : {};

                    return (
                      <TableRow key={visitor.id}>
                        <TableCell className="font-semibold text-slate-900">
                          <Link
                            href={`/dashboard/personnes/${visitor.id}`}
                            className={cn(
                              "transition-colors hover:text-blue-600",
                            )}
                          >
                            {getVisitorDisplayName(data)}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span className={culteBadgeClass(visitor.culte_type)}>
                            {culteLabel(visitor.culte_type)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(visitor.culte_date).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell>
                          {new Date(visitor.created_at).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell>
                          <FollowUpBadges visitor={visitor} compact />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <VisitorsPagination
                page={result.page}
                totalPages={totalPages}
                total={total}
                filter={isSearching ? { type: "all" } : filter}
                query={isSearching ? query : undefined}
                created={params.created}
              />
            </>
          )}
        </div>
    </DashboardPage>
  );
}
