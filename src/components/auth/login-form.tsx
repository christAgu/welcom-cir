"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import {
  signIn,
  type AuthActionState,
} from "@/lib/auth/actions";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="space-y-5">
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
          placeholder="admin@example.com"
          className="livento-input"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="password" className="livento-label">
            Mot de passe
          </Label>
          <Link
            href="/login/forgot-password"
            className="text-xs font-medium text-primary hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          required
          className="livento-input"
        />
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="livento-btn-primary h-11 w-full"
      >
        {pending ? "Connexion…" : "Se connecter"}
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}
