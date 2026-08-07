import Link from "next/link";
import { redirect } from "next/navigation";
import { PasswordForm } from "@/components/auth/password-form";
import { resetPassword } from "@/lib/auth/actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/constants";
import { getAuthUser } from "@/lib/auth/session";

export default async function ResetPasswordPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login?error=auth_callback");
  }

  return (
    <div className="livento-canvas flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="bento-card">
          <h1 className="livento-title text-xl">Nouveau mot de passe</h1>
          <p className="livento-subtitle">
            Choisissez un nouveau mot de passe pour votre compte admin.
          </p>

          <div className="mt-6">
            <PasswordForm
              action={resetPassword}
              submitLabel="Enregistrer"
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
