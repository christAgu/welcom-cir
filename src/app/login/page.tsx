import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentAdmin } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; logout?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  if (isSupabaseConfigured() && params.logout !== "1") {
    const admin = await getCurrentAdmin();
    if (admin?.is_active) redirect("/dashboard");
    if (admin && !admin.is_active) redirect("/login/set-password");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="livento-login-panel">
        <div className="livento-login-orb -left-20 -top-20 size-80" />
        <div className="livento-login-orb -bottom-10 right-0 size-96 opacity-60" />

        <div className="relative">
          <div className="flex size-[4.5rem] items-center justify-center rounded-2xl bg-white p-2 shadow-lg shadow-black/10">
            <Image
              src="/cir-logo.png"
              alt="Communauté Internationale de la Rédemption"
              width={64}
              height={64}
              className="size-full object-contain"
              priority
            />
          </div>
          <h1 className="mt-10 max-w-md text-4xl font-bold leading-tight tracking-tight">
            Accueillir chaque visiteur avec clarté et simplicité
          </h1>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-white/80">
            Le Département de suivie centralise les inscriptions, les
            statistiques et les rapports pour votre équipe d&apos;accueil.
          </p>
        </div>

        <p className="relative text-sm text-white/60">
          Plateforme sécurisée · Inscription ouverte
        </p>
      </div>

      <div className="livento-canvas flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Image
              src="/cir-logo.png"
              alt="Communauté Internationale de la Rédemption"
              width={56}
              height={56}
              className="mb-4 size-14 object-contain"
              priority
            />
            <p className="livento-subtitle">Connexion admin</p>
          </div>

          <div className="bento-card">
            <div className="mb-8 hidden lg:block">
              <Image
                src="/cir-logo.png"
                alt="Communauté Internationale de la Rédemption"
                width={56}
                height={56}
                className="mb-5 size-14 object-contain"
                priority
              />
              <h2 className="livento-section-title text-xl before:hidden">
                Bon retour
              </h2>
              <p className="livento-section-desc mt-1 pl-0">
                Connectez-vous à votre espace admin
              </p>
            </div>

            {params.logout === "1" && (
              <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                Vous êtes déconnecté. Connectez-vous pour continuer.
              </p>
            )}

            {params.error === "auth_callback" && (
              <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                Lien de connexion invalide ou expiré.
              </p>
            )}

            <LoginForm />

            {!isSupabaseConfigured() && (
              <p className="livento-stat-hint mt-6 text-center text-amber-600">
                Supabase non configuré — vérifiez votre fichier .env.local
              </p>
            )}
          </div>

          <p className="livento-stat-hint mt-6 text-center">
            Pas encore de compte ?{" "}
            <Link
              href="/login/signup"
              prefetch
              className="font-medium text-primary hover:underline"
            >
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
