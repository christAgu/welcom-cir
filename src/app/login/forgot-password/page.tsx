"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  requestPasswordReset,
  type AuthActionState,
} from "@/lib/auth/actions";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    {} as AuthActionState,
  );

  return (
    <div className="livento-canvas flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="bento-card">
          <h1 className="livento-title text-xl">Mot de passe oublié</h1>
          <p className="livento-subtitle">
            Entrez votre email admin pour recevoir un lien de réinitialisation.
          </p>

          <form action={formAction} className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="livento-label">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="livento-input"
              />
            </div>

            {state.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {state.error}
              </p>
            )}

            {state.success && (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {state.success}
              </p>
            )}

            <Button
              type="submit"
              disabled={pending}
              className="livento-btn-primary h-11 w-full"
            >
              {pending ? "Envoi…" : "Envoyer le lien"}
              <ArrowRight className="size-4" />
            </Button>
          </form>

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
