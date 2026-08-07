import Link from "next/link";
import { redirect } from "next/navigation";
import { PasswordForm } from "@/components/auth/password-form";
import { setPassword } from "@/lib/auth/actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/constants";
import { getCurrentAdmin } from "@/lib/auth/session";

export default async function SetPasswordPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/login");
  }

  if (admin.is_active) {
    redirect("/dashboard");
  }

  return (
    <div className="livento-canvas flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="bento-card">
          <h1 className="livento-title text-xl">Choisissez votre mot de passe</h1>
          <p className="livento-subtitle">
            Bienvenue {admin.name} — définissez votre mot de passe pour activer
            votre compte.
          </p>

          <div className="mt-6">
            <PasswordForm
              action={setPassword}
              submitLabel="Activer mon compte"
              description={`Minimum ${MIN_PASSWORD_LENGTH} caractères.`}
            />
          </div>

          <Link
            href="/login"
            className="mt-6 block text-center text-sm text-muted-foreground hover:text-foreground"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
