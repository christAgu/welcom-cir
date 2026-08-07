"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ExportDateFormProps = {
  from: string;
  to: string;
  error?: string | null;
};

export function ExportDateForm({ from, to, error }: ExportDateFormProps) {
  const router = useRouter();
  const [fromDate, setFromDate] = useState(from);
  const [toDate, setToDate] = useState(to);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setFromDate(from);
    setToDate(to);
  }, [from, to]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(() => {
      router.push(
        `/dashboard/export?from=${encodeURIComponent(fromDate)}&to=${encodeURIComponent(toDate)}`,
      );
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bento-card">
      <div className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#0057d8] text-white shadow-md shadow-blue-500/20">
          <CalendarRange className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-slate-900">Plage de dates</h2>
          <p className="mt-1 text-sm text-slate-500">
            Filtre sur la date de culte (première visite).
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="export-from" className="livento-label">
                Du
              </Label>
              <Input
                id="export-from"
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="livento-input h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="export-to" className="livento-label">
                Au
              </Label>
              <Input
                id="export-to"
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="livento-input h-11"
                required
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mt-5">
            <Button
              type="submit"
              disabled={pending || !fromDate || !toDate}
              className="dash-btn-primary h-11 px-6 hover:scale-100"
            >
              {pending ? "Chargement…" : "Appliquer la plage"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
