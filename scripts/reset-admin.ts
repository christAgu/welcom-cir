/**
 * Réinitialise l'accès admin : mot de passe + activation du profil.
 *
 * Usage :
 *   npm run reset-admin -- --email ague26oth@gmail.com --password "VotreMotDePasse123!"
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

  const args = parseArgs(process.argv.slice(2));
  const email = args.email?.trim();
  const password = args.password;

  if (!email || !password) {
    console.error(
      'Usage: npm run reset-admin -- --email user@example.com --password "MotDePasse123!"',
    );
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("Le mot de passe doit contenir au moins 6 caractères.");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
    console.error("Impossible de lister les utilisateurs:", listError.message);
    process.exit(1);
  }

  const user = users.users.find(
    (entry) => entry.email?.toLowerCase() === email.toLowerCase(),
  );

  if (!user) {
    console.error(`Aucun utilisateur trouvé pour ${email}`);
    process.exit(1);
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    { password, email_confirm: true },
  );

  if (updateError) {
    console.error("Mise à jour mot de passe échouée:", updateError.message);
    process.exit(1);
  }

  const { error: adminError } = await supabase
    .from("admins")
    .update({ is_active: true })
    .eq("user_id", user.id);

  if (adminError) {
    console.error("Activation admin échouée:", adminError.message);
    process.exit(1);
  }

  console.log(`Accès réinitialisé pour ${email}.`);
  console.log("Connectez-vous sur http://localhost:3000/login");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
