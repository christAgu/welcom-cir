"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  searchVisitorsAction,
  type VisitorSearchResult,
} from "@/lib/visitors/search-action";
import { cn } from "@/lib/utils";

type VisitorSearchDialogProps = {
  triggerClassName?: string;
};

export function VisitorSearchDialog({ triggerClassName }: VisitorSearchDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VisitorSearchResult[]>([]);
  const [pending, startTransition] = useTransition();

  const runSearch = useCallback((value: string) => {
    startTransition(async () => {
      if (value.trim().length < 2) {
        setResults([]);
        return;
      }

      const matches = await searchVisitorsAction(value);
      setResults(matches);
    });
  }, []);

  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => {
      runSearch(query);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [open, query, runSearch]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleSelect(id: string) {
    setOpen(false);
    router.push(`/dashboard/personnes/${id}`);
  }

  function handleViewAll() {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    setOpen(false);
    router.push(`/dashboard/personnes?q=${encodeURIComponent(trimmed)}`);
  }

  const trimmed = query.trim();
  const showHint = trimmed.length > 0 && trimmed.length < 2;
  const showEmpty =
    trimmed.length >= 2 && !pending && results.length === 0;
  const showResults = trimmed.length >= 2 && results.length > 0;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className={cn("livento-action-btn livento-action-btn-icon", triggerClassName)}
        aria-label="Rechercher une personne"
      >
        <Search className="size-[19px]" strokeWidth={1.75} />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed top-[12vh] left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-[1.75rem] border border-white/80 bg-white/95 p-0 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-all duration-200 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-[1.75rem] bg-[#0057d8]" />

          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
            <Search className="size-5 shrink-0 text-slate-400" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nom, prénom, téléphone…"
              className="h-11 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
              onKeyDown={(event) => {
                if (event.key === "Enter" && results[0]) {
                  event.preventDefault();
                  handleSelect(results[0].id);
                }
              }}
            />
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

          <div className="max-h-[50vh] overflow-y-auto p-2">
            {showHint && (
              <p className="px-3 py-6 text-center text-sm text-slate-500">
                Saisissez au moins 2 caractères.
              </p>
            )}

            {!showHint && trimmed.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-slate-500">
                Recherchez par nom, prénom ou numéro de téléphone.
                <span className="mt-2 block text-xs text-slate-400">
                  Raccourci : ⌘K ou Ctrl+K
                </span>
              </p>
            )}

            {pending && trimmed.length >= 2 && (
              <p className="px-3 py-6 text-center text-sm text-slate-500">
                Recherche…
              </p>
            )}

            {showEmpty && (
              <p className="px-3 py-6 text-center text-sm text-slate-500">
                Aucun résultat pour « {trimmed} ».
              </p>
            )}

            {showResults && (
              <ul className="space-y-0.5">
                {results.map((result) => (
                  <li key={result.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(result.id)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
                    >
                      <div className="livento-avatar shrink-0">
                        {result.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {result.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {result.culteTypeLabel} · {result.culteDateLabel}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {showResults && (
            <div className="border-t border-slate-100 px-4 py-3">
              <button
                type="button"
                onClick={handleViewAll}
                className="text-sm font-semibold text-blue-600 hover:underline"
              >
                Voir tous les résultats dans Personnes
              </button>
            </div>
          )}

          <Dialog.Title className="sr-only">Rechercher une personne</Dialog.Title>
          <Dialog.Description className="sr-only">
            Recherche par nom, prénom ou téléphone dans les fiches enregistrées.
          </Dialog.Description>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
