"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import type { AuthActionState } from "@/lib/auth/actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/constants";

type PasswordFormProps = {
  action: (
    prev: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
  submitLabel: string;
  pendingLabel?: string;
  description?: string;
};

export function PasswordForm({
  action,
  submitLabel,
  pendingLabel = "Enregistrement…",
  description,
}: PasswordFormProps) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      {description && (
        <p className="livento-section-desc">{description}</p>
      )}

      <div className="space-y-2">
        <Label htmlFor="password" className="livento-label">
          Nouveau mot de passe
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
        {pending ? pendingLabel : submitLabel}
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}
