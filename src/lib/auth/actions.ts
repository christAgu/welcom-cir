"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAdminByUserId } from "@/lib/auth/session";
import { validatePasswordLength } from "@/lib/auth/constants";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AuthActionState = {
  error?: string;
  success?: string;
};

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function signIn(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: "Identifiants incorrects." };
  }

  if (data.session) {
    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
  }

  const admin = await fetchAdminByUserId(data.user.id);

  if (!admin) {
    await supabase.auth.signOut();
    return { error: "Ce compte n'est pas autorisé." };
  }

  if (!admin.is_active) {
    redirect("/login/set-password");
  }

  redirect("/dashboard");
}

export async function signOut() {
  redirect("/auth/signout");
}

export async function setPassword(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const passwordError = validatePasswordLength(password);
  if (passwordError) {
    return { error: passwordError };
  }

  if (password !== confirm) {
    return { error: "Les mots de passe ne correspondent pas." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Session expirée. Reconnectez-vous via le lien d'invitation." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: error.message };
  }

  const { error: adminError } = await supabase
    .from("admins")
    .update({ is_active: true })
    .eq("user_id", user.id);

  if (adminError) {
    return { error: "Impossible d'activer le compte admin." };
  }

  redirect("/dashboard");
}

export async function requestPasswordReset(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "Email requis." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/auth/confirm?next=${encodeURIComponent("/login/reset-password")}`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: "Si un compte existe, un email de réinitialisation a été envoyé.",
  };
}

export async function resetPassword(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const passwordError = validatePasswordLength(password);
  if (passwordError) {
    return { error: passwordError };
  }

  if (password !== confirm) {
    return { error: "Les mots de passe ne correspondent pas." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase
      .from("admins")
      .update({ is_active: true })
      .eq("user_id", user.id);
  }

  redirect("/dashboard");
}

async function ensureAdminProfile(userId: string, name: string) {
  const adminClient = createAdminClient();
  const { error } = await adminClient.from("admins").upsert(
    {
      user_id: userId,
      name,
      role: "admin",
      is_active: true,
    },
    { onConflict: "user_id" },
  );

  return error?.message ?? null;
}

export async function signUp(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return {
      error: "Supabase non configuré — vérifiez votre fichier .env.local.",
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!name || !email || !password) {
    return { error: "Tous les champs sont requis." };
  }

  const passwordError = validatePasswordLength(password);
  if (passwordError) {
    return { error: passwordError };
  }

  if (password !== confirm) {
    return { error: "Les mots de passe ne correspondent pas." };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (!data.user) {
      return { error: "Inscription impossible. Réessayez." };
    }

    const adminError = await ensureAdminProfile(data.user.id, name);
    if (adminError) {
      return {
        error:
          "Compte créé mais profil admin indisponible. Contactez un super admin.",
      };
    }

    if (data.session) {
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
      redirect("/dashboard");
    }

    return {
      success:
        "Compte créé. Consultez votre email pour confirmer votre adresse, puis connectez-vous.",
    };
  } catch (err) {
    if (isRedirectError(err)) {
      throw err;
    }

    console.error("signUp failed:", err);
    return {
      error:
        "Impossible de joindre le serveur d'authentification. Vérifiez votre connexion et la configuration Supabase.",
    };
  }
}
