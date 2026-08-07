import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Admin } from "@/lib/database.types";

export async function fetchAdminByUserId(userId: string): Promise<Admin | null> {
  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from("admins")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  return data;
}

export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentAdmin(): Promise<Admin | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  return fetchAdminByUserId(user.id);
}

export async function requireActiveAdmin(): Promise<Admin> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    throw new Error("UNAUTHORIZED");
  }

  if (!admin.is_active) {
    throw new Error("PENDING_PASSWORD");
  }

  return admin;
}

export async function requireSuperAdmin(): Promise<Admin> {
  const admin = await requireActiveAdmin();

  if (admin.role !== "super_admin") {
    throw new Error("FORBIDDEN");
  }

  return admin;
}

export async function redirectIfMissingAdmin() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/auth/signout");
  }

  if (!admin.is_active) {
    redirect("/login/set-password");
  }

  return admin;
}
