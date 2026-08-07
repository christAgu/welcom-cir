import { createClient } from "@/lib/supabase/server";
import type { FieldDefinition, Visitor } from "@/lib/database.types";
import { getVisitorDisplayName } from "@/lib/visitors/display-name";
import type { PersonnesFilter } from "@/lib/visitors/personnes-filters";

export const VISITORS_PAGE_SIZE = 9;

export type VisitorsPageResult = {
  visitors: Visitor[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function parseVisitorsPageParam(value?: string | null) {
  const page = Number(value);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

export async function getActiveFieldDefinitions(): Promise<FieldDefinition[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("field_definitions")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data;
}

export async function listVisitors(limit = 50) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("visitors")
    .select("*")
    .order("culte_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data;
}

export async function listVisitorsPage(
  page = 1,
  pageSize = VISITORS_PAGE_SIZE,
): Promise<VisitorsPageResult> {
  const supabase = await createClient();

  const { count, error: countError } = await supabase
    .from("visitors")
    .select("*", { count: "exact", head: true });

  const total = countError || count === null ? 0 : count;
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("visitors")
    .select("*")
    .order("culte_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  return {
    visitors: error || !data ? [] : data,
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

export async function listVisitorsFilteredPage(
  filter: PersonnesFilter,
  page = 1,
  pageSize = VISITORS_PAGE_SIZE,
): Promise<VisitorsPageResult> {
  if (filter.type === "all") {
    return listVisitorsPage(page, pageSize);
  }

  const supabase = await createClient();

  let countQuery = supabase.from("visitors").select("*", { count: "exact", head: true });
  let dataQuery = supabase.from("visitors").select("*");

  if (filter.type === "culte_date") {
    countQuery = countQuery.eq("culte_date", filter.date);
    dataQuery = dataQuery.eq("culte_date", filter.date);
  } else if (filter.type === "culte_range") {
    countQuery = countQuery
      .gte("culte_date", filter.from)
      .lte("culte_date", filter.to);
    dataQuery = dataQuery
      .gte("culte_date", filter.from)
      .lte("culte_date", filter.to);
  } else if (filter.type === "culte_month") {
    const [year, month] = filter.month.split("-").map(Number);
    const monthStart = `${filter.month}-01`;
    const nextMonth = new Date(year, month, 1);
    const monthEnd = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}-01`;

    countQuery = countQuery
      .gte("culte_date", monthStart)
      .lt("culte_date", monthEnd);
    dataQuery = dataQuery
      .gte("culte_date", monthStart)
      .lt("culte_date", monthEnd);
  } else if (filter.type === "registered_month") {
    const [year, month] = filter.month.split("-").map(Number);
    const monthStart = new Date(year, month - 1, 1).toISOString();
    const monthEnd = new Date(year, month, 1).toISOString();

    countQuery = countQuery
      .gte("created_at", monthStart)
      .lt("created_at", monthEnd);
    dataQuery = dataQuery
      .gte("created_at", monthStart)
      .lt("created_at", monthEnd);
  }

  const { count, error: countError } = await countQuery;
  const total = countError || count === null ? 0 : count;
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await dataQuery
    .order("culte_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  return {
    visitors: error || !data ? [] : data,
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

function visitorDataRecord(data: unknown) {
  return data && typeof data === "object"
    ? (data as Record<string, unknown>)
    : {};
}

function visitorMatchesQuery(
  data: Record<string, unknown>,
  query: string,
) {
  const q = query.toLowerCase();
  const fields = ["nom", "prenoms", "contact_tel", "profession", "adresse"];

  if (getVisitorDisplayName(data).toLowerCase().includes(q)) {
    return true;
  }

  return fields.some((field) =>
    String(data[field] ?? "")
      .toLowerCase()
      .includes(q),
  );
}

export async function searchVisitors(query: string, limit?: number) {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const all = await findVisitorsMatchingQuery(trimmed);
  return limit ? all.slice(0, limit) : all;
}

export async function searchVisitorsPage(
  query: string,
  page = 1,
  pageSize = VISITORS_PAGE_SIZE,
): Promise<VisitorsPageResult> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return {
      visitors: [],
      total: 0,
      page: 1,
      pageSize,
      totalPages: 1,
    };
  }

  const all = await findVisitorsMatchingQuery(trimmed);
  const total = all.length;
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    visitors: all.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

async function findVisitorsMatchingQuery(query: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("visitors")
    .select("*")
    .order("culte_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(500);

  if (error || !data) return [];

  return data.filter((visitor) =>
    visitorMatchesQuery(visitorDataRecord(visitor.data), query),
  );
}

export async function getVisitorById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("visitors")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function getVisitorWithMeta(id: string) {
  const visitor = await getVisitorById(id);
  if (!visitor) return null;

  const supabase = await createClient();
  let registeredByName: string | null = null;

  if (visitor.registered_by) {
    const { data: admin } = await supabase
      .from("admins")
      .select("name")
      .eq("id", visitor.registered_by)
      .maybeSingle();
    registeredByName = admin?.name ?? null;
  }

  return { visitor, registeredByName };
}
