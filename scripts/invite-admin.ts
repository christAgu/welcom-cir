/**
 * Invite un admin par email (Supabase Auth invite + ligne admins).
 *
 * Usage :
 *   npx tsx scripts/invite-admin.ts --email admin@example.com --name "Marie Accueil"
 *   npx tsx scripts/invite-admin.ts --email admin@example.com --name "Marie" --role super_admin
 *
 * Prérequis : SUPABASE_SERVICE_ROLE_KEY et NEXT_PUBLIC_SUPABASE_URL dans .env.local
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

type AdminRole = "admin" | "super_admin";

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
      } else {
        args[key] = "true";
      }
    }
  }
  return args;
}

async function main() {
  loadEnvLocal();

  const args = parseArgs(process.argv.slice(2));
  const email = args.email;
  const name = args.name;
  const role = (args.role ?? "admin") as AdminRole;
  const password = args.password;

  if (!email || !name) {
    console.error(
      "Usage: npx tsx scripts/invite-admin.ts --email admin@example.com --name \"Marie Accueil\" [--role super_admin] [--password \"MotDePasse123!\"]",
    );
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (!url || !serviceRoleKey) {
    console.error(
      "NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis dans .env.local",
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let userId: string;

  if (password) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (error || !data.user) {
      console.error("Création utilisateur échouée:", error?.message ?? "Inconnu");
      process.exit(1);
    }

    userId = data.user.id;
    console.log(`Compte créé pour ${email} (connexion directe possible).`);
  } else {
    const { data: inviteData, error: inviteError } =
      await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${siteUrl}/auth/confirm?next=${encodeURIComponent("/login/set-password")}`,
      });

    if (inviteError || !inviteData.user) {
      console.error(
        "Invitation échouée:",
        inviteError?.message ?? "Utilisateur inconnu",
      );
      process.exit(1);
    }

    userId = inviteData.user.id;
    console.log(`Invitation envoyée à ${email}.`);
  }

  const { error: adminError } = await supabase.from("admins").insert({
    user_id: userId,
    name,
    role,
    is_active: password ? true : false,
  });

  if (adminError) {
    console.error("Création profil admin échouée:", adminError.message);
    process.exit(1);
  }

  console.log(`Admin configuré : ${name} (${role})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
