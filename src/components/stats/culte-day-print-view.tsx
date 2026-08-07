"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Download } from "lucide-react";
import type { CulteDayStats } from "@/lib/visitors/month-stats";

type CulteDayPrintViewProps = {
  stats: CulteDayStats;
  generatedAt: string;
};

export function CulteDayPrintView({ stats, generatedAt }: CulteDayPrintViewProps) {
  useEffect(() => {
    document.body.classList.add("report-print-mode");
    return () => document.body.classList.remove("report-print-mode");
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 print:max-w-none print:px-0 print:py-0">
      <div className="print-hide mb-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="dash-btn-primary h-10 px-5"
        >
          <Download className="size-4" />
          Imprimer / Enregistrer en PDF
        </button>
        <Link
          href={`/dashboard/stats/${stats.yearMonth}/${stats.date}`}
          className="dash-btn-secondary h-10 px-5"
        >
          Retour au culte
        </Link>
      </div>

      <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="flex flex-col gap-5 border-b-2 border-blue-600 pb-5 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex shrink-0 justify-center sm:justify-start">
            <Image
              src="/cir-logo.png"
              alt="Communauté Internationale de la Rédemption"
              width={120}
              height={120}
              className="h-24 w-24 object-contain print:h-28 print:w-28"
              priority
            />
          </div>
          <div className="min-w-0 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
              CIR — Palais de Dieu · Cotonou
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
              Nouveaux venus — {stats.typeLabel}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {stats.dateLabel} · {stats.count} personne{stats.count > 1 ? "s" : ""} ·
              Généré le {generatedAt}
            </p>
          </div>
        </header>

        {stats.visitors.length === 0 ? (
          <p className="mt-8 text-sm text-slate-500">
            Aucune fiche enregistrée pour ce culte.
          </p>
        ) : (
          <table className="mt-8 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-2 py-2 text-left text-[11px] font-bold uppercase text-slate-500">
                  Nom
                </th>
                <th className="px-2 py-2 text-left text-[11px] font-bold uppercase text-slate-500">
                  Enregistré le
                </th>
                <th className="px-2 py-2 text-left text-[11px] font-bold uppercase text-slate-500">
                  Par
                </th>
                <th className="px-2 py-2 text-left text-[11px] font-bold uppercase text-slate-500">
                  Suivi
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.visitors.map((visitor) => (
                <tr key={visitor.id} className="border-b border-slate-100">
                  <td className="px-2 py-2.5 font-medium text-slate-900">{visitor.name}</td>
                  <td className="px-2 py-2.5 text-slate-600">{visitor.registeredAtLabel}</td>
                  <td className="px-2 py-2.5 text-slate-600">{visitor.registeredByName}</td>
                  <td className="px-2 py-2.5 text-xs text-slate-600">
                    {[
                      visitor.visited && "Visitée",
                      visitor.called && "Appelée",
                      visitor.returned && "Revenue",
                    ]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </article>
    </div>
  );
}
