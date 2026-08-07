#!/usr/bin/env npx tsx
/**
 * Vérifie la configuration Supabase du projet cir-welcom.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

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

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const checks: { label: string; ok: boolean; detail?: string }[] = [];

  checks.push({
    label: "NEXT_PUBLIC_SUPABASE_URL",
    ok: Boolean(url),
  });
  checks.push({
    label: "SUPABASE_SERVICE_ROLE_KEY",
    ok: Boolean(serviceRoleKey),
  });
  checks.push({
    label: "NEXT_PUBLIC_SITE_URL",
    ok: siteUrl.includes("localhost:3000"),
    detail: siteUrl,
  });

  if (!url || !serviceRoleKey) {
    for (const check of checks) {
      console.log(`${check.ok ? "✓" : "✗"} ${check.label}${check.detail ? ` — ${check.detail}` : ""}`);
    }
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { count: fieldCount, error: fieldError } = await supabase
    .from("field_definitions")
    .select("*", { count: "exact", head: true });

  checks.push({
    label: "Table field_definitions",
    ok: !fieldError && (fieldCount ?? 0) >= 5,
    detail: fieldError?.message ?? `${fieldCount ?? 0} champs`,
  });

  const { count: adminCount, error: adminError } = await supabase
    .from("admins")
    .select("*", { count: "exact", head: true });

  checks.push({
    label: "Premier admin",
    ok: !adminError && (adminCount ?? 0) > 0,
    detail: adminError?.message ?? `${adminCount ?? 0} admin(s)`,
  });

  for (const check of checks) {
    console.log(`${check.ok ? "✓" : "✗"} ${check.label}${check.detail ? ` — ${check.detail}` : ""}`);
  }

  const allOk = checks.every((c) => c.ok);
  if (!allOk) {
    console.log("\nÉtapes restantes :");
    if ((adminCount ?? 0) === 0) {
      console.log(
        '  npm run invite-admin -- --email VOTRE@EMAIL.com --name "Marie Accueil"',
      );
      console.log(
        '  ou avec mot de passe direct : --password "VotreMotDePasse123!"',
      );
    }
    process.exit(1);
  }

  console.log("\nConfiguration Supabase OK.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
