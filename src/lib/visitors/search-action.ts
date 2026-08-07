"use server";

import { getVisitorDisplayName } from "@/lib/visitors/display-name";
import { searchVisitors } from "@/lib/visitors/queries";

export type VisitorSearchResult = {
  id: string;
  name: string;
  culteDateLabel: string;
  culteTypeLabel: string;
};

export async function searchVisitorsAction(
  query: string,
): Promise<VisitorSearchResult[]> {
  const visitors = await searchVisitors(query, 8);

  return visitors.map((visitor) => {
    const data =
      visitor.data && typeof visitor.data === "object"
        ? (visitor.data as Record<string, unknown>)
        : {};

    return {
      id: visitor.id,
      name: getVisitorDisplayName(data),
      culteDateLabel: new Date(visitor.culte_date).toLocaleDateString("fr-FR"),
      culteTypeLabel: visitor.culte_type === "mer" ? "Mercredi" : "Dimanche",
    };
  });
}
