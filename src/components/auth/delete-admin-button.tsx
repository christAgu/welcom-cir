"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { deleteAdmin, type AdminActionState } from "@/lib/auth/admin-actions";
import { Button } from "@/components/ui/button";

type DeleteAdminButtonProps = {
  adminId: string;
  adminName: string;
  disabled?: boolean;
};

export function DeleteAdminButton({
  adminId,
  adminName,
  disabled,
}: DeleteAdminButtonProps) {
  const [state, formAction, pending] = useActionState<
    AdminActionState,
    FormData
  >(deleteAdmin, {});

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="adminId" value={adminId} />
      {state.error && (
        <p className="mb-2 text-xs text-red-600">{state.error}</p>
      )}
      {state.success && (
        <p className="mb-2 text-xs text-emerald-700">{state.success}</p>
      )}
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={disabled || pending}
        className="text-destructive hover:text-destructive"
        onClick={(event) => {
          if (
            !confirm(
              `Supprimer le compte de ${adminName} ? Cette action est définitive.`,
            )
          ) {
            event.preventDefault();
          }
        }}
      >
        <Trash2 className="size-4" />
        {pending ? "Suppression…" : "Supprimer"}
      </Button>
    </form>
  );
}
