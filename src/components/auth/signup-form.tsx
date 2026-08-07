"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { signUp, type AuthActionState } from "@/lib/auth/actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/constants";

const initialState: AuthActionState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name" className="livento-label">
          Nom complet
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          placeholder="Marie Accueil"
          className="livento-input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="livento-label">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="marie@example.com"
          className="livento-input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="livento-label">
          Mot de passe
        </Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          className="livento-input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm" className="livento-label">
          Confirmer le mot de passe
        </Label>
        <PasswordInput
          id="confirm"
          name="confirm"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
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
        {pending ? "Inscription…" : "Créer mon compte"}
        <ArrowRight className="size-4" />
      </Button>

      <p className="livento-stat-hint text-center text-sm">
        Déjà inscrit ?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
