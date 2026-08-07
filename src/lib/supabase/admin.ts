import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import {
  getSupabaseEnv,
  getSupabaseServiceRoleKey,
} from "@/lib/supabase/env";

/** Client service role — scripts serveur uniquement, jamais côté client. */
export function createAdminClient() {
  const { url } = getSupabaseEnv();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
