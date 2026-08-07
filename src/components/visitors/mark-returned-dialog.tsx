"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Pencil, UserCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { markReturned } from "@/lib/visitors/actions";
import { todayLocalIsoDate } from "@/lib/culte-utils";
import { toDateInputValue } from "@/lib/visitors/form-utils";
import { cn } from "@/lib/utils";

type MarkReturnedDialogProps = {
  visitorId: string;
  visitorName: string;
  returnedAt?: string | null;
  className?: string;
  variant?: "default" | "inline";
};

export function MarkReturnedDialog({
  visitorId,
  visitorName,
  returnedAt,
  className,
  variant = "default",
}: MarkReturnedDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [returnedChoice, setReturnedChoice] = useState<"oui" | "non">(
    returnedAt ? "oui" : "non",
  );
  const [returnDate, setReturnDate] = useState(
    toDateInputValue(returnedAt) || todayLocalIsoDate(),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setReturnedChoice(returnedAt ? "oui" : "non");
      setReturnDate(toDateInputValue(returnedAt) || todayLocalIsoDate());
      setError(null);
    }
  }, [open, returnedAt]);

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await markReturned(
        visitorId,
        returnedChoice === "oui",
        returnedChoice === "oui" ? returnDate : undefined,
      );
      if (result.error) {
        setError(result.error);
        return;
      }

      setOpen(false);
      router.refresh();
    });
  }

  const inlineTriggerClass =
    "dash-btn-primary dash-btn-icon inline-flex shrink-0 items-center justify-center";

  const inlineLabel = returnedAt
    ? "Modifier le retour au culte"
    : "Marquer revenue au culte";

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label={variant === "inline" ? inlineLabel : undefined}
        className={cn(
          variant === "inline"
            ? inlineTriggerClass
            : "dash-btn-secondary inline-flex h-12 items-center justify-center gap-2 px-5 text-sm font-semibold sm:w-auto",
          className,
        )}
      >
        {variant === "inline" ? (
          <Pencil className="size-3.5 shrink-0 text-white" strokeWidth={2.25} />
        ) : (
          <>
            <UserCheck className="size-4" />
            Marquer revenue
          </>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[1.75rem] border border-white/80 bg-white/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-all duration-200 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-[1.75rem] bg-emerald-500" />

          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-xl font-extrabold tracking-tight text-slate-950">
                Marquer revenue
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-slate-500">
                Indiquez si{" "}
                <span className="font-semibold text-slate-700">{visitorName}</span>{" "}
                est revenue au culte.
              </Dialog.Description>
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

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`returned-choice-${visitorId}`} className="livento-label">
                Revenue au culte
              </Label>
              <select
                id={`returned-choice-${visitorId}`}
                value={returnedChoice}
                onChange={(event) =>
                  setReturnedChoice(event.target.value as "oui" | "non")
                }
                className="livento-input h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              >
                <option value="non">Non</option>
                <option value="oui">Oui</option>
              </select>
            </div>

            {returnedChoice === "oui" && (
              <div className="space-y-2">
                <Label htmlFor={`return-date-${visitorId}`} className="livento-label">
                  Date de retour
                </Label>
                <Input
                  id={`return-date-${visitorId}`}
                  type="date"
                  value={returnDate}
                  onChange={(event) => setReturnDate(event.target.value)}
                  className="livento-input h-11"
                />
              </div>
            )}
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
                />
              }
            >
              Annuler
            </Dialog.Close>
            <Button
              type="button"
              disabled={pending || (returnedChoice === "oui" && !returnDate)}
              onClick={handleConfirm}
              className="dash-btn-primary h-11 px-6 hover:scale-100"
            >
              {pending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
