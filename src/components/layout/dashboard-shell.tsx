import { AppTopNav } from "@/components/layout/app-topnav";
import type { Admin } from "@/lib/database.types";

type DashboardShellProps = {
  children: React.ReactNode;
  admin?: Admin | null;
};

export function DashboardShell({ children, admin }: DashboardShellProps) {
  return (
    <div className="livento-canvas flex min-h-svh flex-col">
      <div className="livento-ambient" aria-hidden />
      <AppTopNav admin={admin} />
      <main className="relative z-[1] flex flex-1 flex-col">{children}</main>
    </div>
  );
}
