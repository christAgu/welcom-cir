export function getVisitorDisplayName(data: Record<string, unknown>) {
  const prenoms = data.prenoms ?? data.first_names;
  const nom = data.nom ?? data.last_name ?? data.full_name;

  const parts = [prenoms, nom]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map((value) => value.trim());

  return parts.length > 0 ? parts.join(" ") : "Sans nom";
}
