"use client";

import { Dialog } from "@base-ui/react/dialog";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteVisitor } from "@/lib/visitors/actions";
import { cn } from "@/lib/utils";

type DeleteVisitorDialogProps = {
  visitorId: string;
  visitorName: string;
  className?: string;
};

export function DeleteVisitorDialog({
  visitorId,
  visitorName,
  className,
}: DeleteVisitorDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await deleteVisitor(visitorId);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className={cn(
          "inline-flex h-12 items-center justify-center gap-2 rounded-[8px] border border-red-200 bg-white px-5 text-sm font-semibold text-red-600 shadow-sm transition-colors hover:border-red-300 hover:bg-red-50 sm:w-auto",
          className,
        )}
      >
        <Trash2 className="size-4" />
        Supprimer
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-all duration-200 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-red-500" />

          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <Dialog.Title className="text-xl font-extrabold tracking-tight text-slate-950">
                  Supprimer la fiche
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-slate-500">
                  Cette action est définitive. La fiche de{" "}
                  <span className="font-semibold text-slate-700">{visitorName}</span>{" "}
                  sera effacée de la base de données.
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full text-slate-400 hover:text-slate-700"
                />
              }
            >
              <X className="size-4" />
              <span className="sr-only">Fermer</span>
            </Dialog.Close>
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Dialog.Close
              render={
                <Button
                  variant="outline"
                  className="h-11 rounded-xl border-slate-200 px-5"
                  disabled={pending}
                />
              }
            >
              Annuler
            </Dialog.Close>
            <Button
              type="button"
              disabled={pending}
              onClick={handleConfirm}
              className="h-11 rounded-xl bg-red-600 px-6 font-semibold text-white hover:bg-red-700 hover:scale-100"
            >
              {pending ? "Suppression…" : "Supprimer définitivement"}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
