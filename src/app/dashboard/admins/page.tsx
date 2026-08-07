import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DeleteAdminButton } from "@/components/auth/delete-admin-button";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardPage } from "@/components/layout/dashboard-page";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listAdmins } from "@/lib/auth/admin-actions";
import { getCurrentAdmin } from "@/lib/auth/session";

export default async function AdminsPage() {
  const currentAdmin = await getCurrentAdmin();

  if (!currentAdmin?.is_active) {
    redirect("/login");
  }

  if (currentAdmin.role !== "super_admin") {
    redirect("/dashboard");
  }

  const admins = await listAdmins();

  return (
    <DashboardPage>
      <DashboardHeader
        title="Administrateurs"
        description="Comptes inscrits sur la plateforme. Vous pouvez supprimer un admin pour révoquer son accès."
        badge="Super admin"
      />
        <div className="bento-card dash-table-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => {
                const isSelf = admin.user_id === currentAdmin.user_id;

                return (
                  <TableRow key={admin.id}>
                    <TableCell className="font-semibold text-slate-900">
                      {admin.name}
                    </TableCell>
                    <TableCell>{admin.email ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full">
                        {admin.role === "super_admin" ? "Super admin" : "Admin"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={admin.is_active ? "default" : "secondary"}
                        className="rounded-full"
                      >
                        {admin.is_active ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {isSelf ? (
                        <span className="text-sm text-slate-400">Vous</span>
                      ) : (
                        <DeleteAdminButton
                          adminId={admin.id}
                          adminName={admin.name}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
    </DashboardPage>
  );
}
