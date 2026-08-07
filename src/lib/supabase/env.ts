const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
// JWT anon key requis pour que les requêtes RLS voient auth.uid() après connexion.
const key =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(url && key);
}

export function getSupabaseEnv() {
  if (!url || !key) {
    throw new Error(
      "Variables Supabase manquantes. Copiez .env.example vers .env.local et renseignez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (ou ANON_KEY).",
    );
  }

  return { url, key };
}

export function getSupabaseServiceRoleKey() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY manquante — requise pour les scripts admin.",
    );
  }
  return serviceRoleKey;
}
