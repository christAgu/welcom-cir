import Link from "next/link";
import { Sparkles } from "lucide-react";
import { SignupForm } from "@/components/auth/signup-form";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function SignupPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="livento-login-panel">
        <div className="livento-login-orb -left-20 -top-20 size-80" />
        <div className="livento-login-orb -bottom-10 right-0 size-96 opacity-60" />

        <div className="relative">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Sparkles className="size-6" />
          </div>
          <h1 className="mt-10 max-w-md text-4xl font-bold leading-tight tracking-tight">
            Rejoignez l&apos;équipe d&apos;accueil
          </h1>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-white/80">
            Créez votre compte pour accéder au tableau de bord du Département
            de suivie.
          </p>
        </div>

        <p className="relative text-sm text-white/60">
          Inscription ouverte · Gestion des accès par super admin
        </p>
      </div>

      <div className="livento-canvas flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          <div className="bento-card">
            <div className="mb-8">
              <h2 className="livento-section-title text-xl before:hidden">
                Créer un compte
              </h2>
              <p className="livento-section-desc mt-1 pl-0">
                Renseignez vos informations pour vous inscrire
              </p>
            </div>

            {!isSupabaseConfigured() && (
              <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                Supabase non configuré — vérifiez votre fichier .env.local
              </p>
            )}

            <SignupForm />
          </div>

          <p className="livento-stat-hint mt-6 text-center text-sm">
            Déjà inscrit ?{" "}
            <Link
              href="/login"
              prefetch
              className="font-medium text-primary hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
