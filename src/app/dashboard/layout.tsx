import { DashboardShell } from "@/components/layout/dashboard-shell";
import { redirectIfMissingAdmin } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let admin = null;

  if (isSupabaseConfigured()) {
    admin = await redirectIfMissingAdmin();
  }

  return <DashboardShell admin={admin}>{children}</DashboardShell>;
}
