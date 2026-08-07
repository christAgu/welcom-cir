"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/auth/session";
import type { Admin } from "@/lib/database.types";

export type AdminListEntry = Admin & { email: string | null };

export type AdminActionState = {
  error?: string;
  success?: string;
};

async function requireSuperAdminAccess() {
  try {
    return await requireSuperAdmin();
  } catch {
    throw new Error("FORBIDDEN");
  }
}

export async function listAdmins(): Promise<AdminListEntry[]> {
  await requireSuperAdminAccess();

  const adminClient = createAdminClient();
  const { data: admins, error } = await adminClient
    .from("admins")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !admins) {
    return [];
  }

  const { data: usersData, error: usersError } =
    await adminClient.auth.admin.listUsers();

  if (usersError || !usersData.users) {
    return admins.map((admin) => ({ ...admin, email: null }));
  }

  const emailByUserId = new Map(
    usersData.users.map((user) => [user.id, user.email ?? null]),
  );

  return admins.map((admin) => ({
    ...admin,
    email: emailByUserId.get(admin.user_id) ?? null,
  }));
}

export async function deleteAdmin(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  let currentAdmin;

  try {
    currentAdmin = await requireSuperAdminAccess();
  } catch {
    return { error: "Action réservée aux super admins." };
  }

  const adminId = String(formData.get("adminId") ?? "").trim();
  if (!adminId) {
    return { error: "Administrateur introuvable." };
  }

  const adminClient = createAdminClient();
  const { data: target, error: targetError } = await adminClient
    .from("admins")
    .select("*")
    .eq("id", adminId)
    .maybeSingle();

  if (targetError || !target) {
    return { error: "Administrateur introuvable." };
  }

  if (target.user_id === currentAdmin.user_id) {
    return { error: "Vous ne pouvez pas supprimer votre propre compte." };
  }

  if (target.role === "super_admin") {
    const { count, error: countError } = await adminClient
      .from("admins")
      .select("*", { count: "exact", head: true })
      .eq("role", "super_admin");

    if (countError || (count ?? 0) <= 1) {
      return { error: "Impossible de supprimer le dernier super admin." };
    }
  }

  const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(
    target.user_id,
  );

  if (deleteUserError) {
    return { error: "Suppression du compte échouée." };
  }

  revalidatePath("/dashboard/admins");
  return { success: `${target.name} a été supprimé.` };
}
