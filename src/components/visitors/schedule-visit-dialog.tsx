"use client";

import { Dialog } from "@base-ui/react/dialog";
import { CalendarDays, Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { scheduleVisit } from "@/lib/visitors/actions";
import { todayLocalIsoDate } from "@/lib/culte-utils";
import { toDateInputValue, toTimeInputValue } from "@/lib/visitors/form-utils";
import { cn } from "@/lib/utils";

type ScheduleVisitDialogProps = {
  visitorId: string;
  visitorName: string;
  scheduledAt?: string | null;
  className?: string;
  variant?: "default" | "inline";
};

export function ScheduleVisitDialog({
  visitorId,
  visitorName,
  scheduledAt,
  className,
  variant = "default",
}: ScheduleVisitDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [visitDate, setVisitDate] = useState(
    toDateInputValue(scheduledAt) || todayLocalIsoDate(),
  );
  const [visitTime, setVisitTime] = useState(toTimeInputValue(scheduledAt));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setVisitDate(toDateInputValue(scheduledAt) || todayLocalIsoDate());
      setVisitTime(toTimeInputValue(scheduledAt));
      setError(null);
    }
  }, [open, scheduledAt]);

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await scheduleVisit(visitorId, visitDate, visitTime);
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

  const inlineLabel = scheduledAt
    ? "Modifier la visite programmée"
    : "Programmer une visite";

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label={variant === "inline" ? inlineLabel : undefined}
        className={cn(
          variant === "inline"
            ? inlineTriggerClass
            : "dash-btn-secondary inline-flex h-12 items-center justify-center gap-2 px-6 text-sm font-semibold sm:w-auto",
          className,
        )}
      >
        {variant === "inline" ? (
          <Pencil className="size-3.5 shrink-0 text-white" strokeWidth={2.25} />
        ) : (
          <>
            <CalendarDays className="size-4" />
            Programmer une visite
          </>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[1.75rem] border border-white/80 bg-white/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-all duration-200 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-[1.75rem] bg-[#0057d8]" />

          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-xl font-extrabold tracking-tight text-slate-950">
                Programmer une visite
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-slate-500">
                Choisissez la date et l&apos;heure de visite pour{" "}
                <span className="font-semibold text-slate-700">{visitorName}</span>
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

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`visit-date-${visitorId}`} className="livento-label">
                Date de visite
              </Label>
              <Input
                id={`visit-date-${visitorId}`}
                type="date"
                value={visitDate}
                onChange={(event) => setVisitDate(event.target.value)}
                className="livento-input h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`visit-time-${visitorId}`} className="livento-label">
                Heure de visite
              </Label>
              <Input
                id={`visit-time-${visitorId}`}
                type="time"
                value={visitTime}
                onChange={(event) => setVisitTime(event.target.value)}
                className="livento-input h-11"
              />
            </div>
            {scheduledAt && (
              <p className="text-xs text-slate-500 sm:col-span-2">
                Une visite est déjà programmée — vous pouvez modifier la date et
                l&apos;heure.
              </p>
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
              disabled={pending || !visitDate || !visitTime}
              onClick={handleConfirm}
              className="dash-btn-primary h-11 px-6 hover:scale-100"
            >
              {pending ? "Enregistrement…" : "Confirmer la visite"}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
