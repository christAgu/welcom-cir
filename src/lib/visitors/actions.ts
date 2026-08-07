"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireActiveAdmin } from "@/lib/auth/session";
import {
  getFieldValue,
  parseCulteFields,
  parseFollowUpDate,
  parseReturnedAt,
  parseVisitorFields,
  combineDateAndTime,
} from "@/lib/visitors/form-utils";
import { getActiveFieldDefinitions } from "@/lib/visitors/queries";

export type VisitorActionState = {
  error?: string;
  success?: string;
};

function revalidateVisitorPaths(visitorId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/personnes");
  revalidatePath("/dashboard/nouveau");
  if (visitorId) {
    revalidatePath(`/dashboard/personnes/${visitorId}`);
    revalidatePath(`/dashboard/personnes/${visitorId}/modifier`);
  }
}

export async function createVisitor(
  _prev: VisitorActionState,
  formData: FormData,
): Promise<VisitorActionState> {
  let admin;

  try {
    admin = await requireActiveAdmin();
  } catch {
    return { error: "Session expirée. Reconnectez-vous." };
  }

  const culte = parseCulteFields(formData);
  if ("error" in culte) return { error: culte.error };

  const fields = await getActiveFieldDefinitions();
  const parsed = parseVisitorFields(formData, fields);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase.from("visitors").insert({
    culte_date: culte.culteDate,
    culte_type: culte.culteType,
    data: parsed.data,
    registered_by: admin.id,
    updated_by: admin.id,
  });

  if (error) {
    return { error: "Enregistrement impossible. Réessayez." };
  }

  revalidateVisitorPaths();
  redirect("/dashboard/personnes?created=1");
}

export async function updateVisitor(
  _prev: VisitorActionState,
  formData: FormData,
): Promise<VisitorActionState> {
  let admin;

  try {
    admin = await requireActiveAdmin();
  } catch {
    return { error: "Session expirée. Reconnectez-vous." };
  }

  const visitorId = getFieldValue(formData, "visitor_id");
  if (!visitorId) {
    return { error: "Fiche introuvable." };
  }

  const culte = parseCulteFields(formData);
  if ("error" in culte) return { error: culte.error };

  const fields = await getActiveFieldDefinitions();
  const parsed = parseVisitorFields(formData, fields);
  if ("error" in parsed) return { error: parsed.error };

  const returnedAt = parseReturnedAt(formData);
  if (returnedAt && typeof returnedAt === "object") {
    return { error: returnedAt.error };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("visitors")
    .update({
      culte_date: culte.culteDate,
      culte_type: culte.culteType,
      data: parsed.data,
      visited_at: parseFollowUpDate(formData, "visited_at"),
      called_at: parseFollowUpDate(formData, "called_at"),
      returned_at: returnedAt,
      updated_by: admin.id,
    })
    .eq("id", visitorId);

  if (error) {
    return { error: "Mise à jour impossible. Réessayez." };
  }

  revalidateVisitorPaths(visitorId);
  redirect(`/dashboard/personnes/${visitorId}?saved=1`);
}

export async function scheduleVisit(
  visitorId: string,
  visitDate: string,
  visitTime: string,
): Promise<VisitorActionState> {
  let admin;

  try {
    admin = await requireActiveAdmin();
  } catch {
    return { error: "Session expirée. Reconnectez-vous." };
  }

  if (!visitorId) {
    return { error: "Fiche introuvable." };
  }

  const visitedAt = combineDateAndTime(visitDate, visitTime);
  if (typeof visitedAt === "object") {
    return { error: visitedAt.error };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("visitors")
    .update({
      visited_at: visitedAt,
      updated_by: admin.id,
    })
    .eq("id", visitorId);

  if (error) {
    return { error: "Impossible de programmer la visite. Réessayez." };
  }

  revalidateVisitorPaths(visitorId);
  return { success: "Visite programmée." };
}

export async function scheduleCall(
  visitorId: string,
  callDate: string,
  callTime: string,
): Promise<VisitorActionState> {
  let admin;

  try {
    admin = await requireActiveAdmin();
  } catch {
    return { error: "Session expirée. Reconnectez-vous." };
  }

  if (!visitorId) {
    return { error: "Fiche introuvable." };
  }

  const calledAt = combineDateAndTime(callDate, callTime);
  if (typeof calledAt === "object") {
    return { error: calledAt.error };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("visitors")
    .update({
      called_at: calledAt,
      updated_by: admin.id,
    })
    .eq("id", visitorId);

  if (error) {
    return { error: "Impossible de programmer l'appel. Réessayez." };
  }

  revalidateVisitorPaths(visitorId);
  return { success: "Appel programmé." };
}

export async function markReturned(
  visitorId: string,
  returned: boolean,
  returnDate?: string,
): Promise<VisitorActionState> {
  let admin;

  try {
    admin = await requireActiveAdmin();
  } catch {
    return { error: "Session expirée. Reconnectez-vous." };
  }

  if (!visitorId) {
    return { error: "Fiche introuvable." };
  }

  let returnedAt: string | null = null;

  if (returned) {
    if (!returnDate || !/^\d{4}-\d{2}-\d{2}$/.test(returnDate)) {
      return { error: "Indiquez la date de retour au culte." };
    }

    returnedAt = new Date(`${returnDate}T12:00:00`).toISOString();
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("visitors")
    .update({
      returned_at: returnedAt,
      updated_by: admin.id,
    })
    .eq("id", visitorId);

  if (error) {
    return { error: "Impossible de mettre à jour le retour. Réessayez." };
  }

  revalidateVisitorPaths(visitorId);
  return { success: returned ? "Retour enregistré." : "Retour annulé." };
}

export async function deleteVisitor(
  visitorId: string,
): Promise<VisitorActionState> {
  try {
    await requireActiveAdmin();
  } catch {
    return { error: "Session expirée. Reconnectez-vous." };
  }

  if (!visitorId) {
    return { error: "Fiche introuvable." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("visitors").delete().eq("id", visitorId);

  if (error) {
    return { error: "Suppression impossible. Réessayez." };
  }

  revalidateVisitorPaths(visitorId);
  redirect("/dashboard/personnes");
}
