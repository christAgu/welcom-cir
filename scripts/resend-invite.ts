/**
 * Renvoie un lien pour choisir un nouveau mot de passe (admin existant).
 *
 * Usage :
 *   npm run resend-invite -- --email ague26oth@gmail.com
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        args[key] = next;
        i++;
      }
    }
  }
  return args;
}

async function main() {
  loadEnvLocal();

  const email = parseArgs(process.argv.slice(2)).email?.trim();
  if (!email) {
    console.error("Usage: npm run resend-invite -- --email user@example.com");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const redirectTo = `${siteUrl}/auth/confirm?next=${encodeURIComponent("/login/set-password")}`;

  if (!url || !serviceRoleKey) {
    console.error("Variables Supabase manquantes dans .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: users, error: listError } =
    await supabase.auth.admin.listUsers();

  if (listError) {
    console.error("Erreur:", listError.message);
    process.exit(1);
  }

  const user = users.users.find(
    (entry) => entry.email?.toLowerCase() === email.toLowerCase(),
  );

  if (!user) {
    console.error(`Aucun utilisateur pour ${email}`);
    process.exit(1);
  }

  const { data: linkData, error: linkError } =
    await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo },
    });

  if (linkError || !linkData.properties?.action_link) {
    console.error(
      "Génération du lien échouée:",
      linkError?.message ?? "Lien absent",
    );
    process.exit(1);
  }

  console.log("\nNouveau lien (valide une seule fois) :\n");
  console.log(linkData.properties.action_link);
  console.log("");
  console.log("Ouvrez ce lien une seule fois dans le navigateur (pas d'aperçu email).");
  console.log("Mot de passe temporaire alternatif : npm run reset-admin -- --email ... --password \"...\"");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
