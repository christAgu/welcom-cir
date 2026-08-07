"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Download } from "lucide-react";
import type { ReportPeriodStats } from "@/lib/visitors/report-stats";

type ReportPrintViewProps = {
  period: ReportPeriodStats;
  generatedAt: string;
};

export function ReportPrintView({ period, generatedAt }: ReportPrintViewProps) {
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
        <Link href="/dashboard/rapports" className="dash-btn-secondary h-10 px-5">
          Retour aux rapports
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
              Rapport des nouveaux venus
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {period.title} · {period.rangeHint} · Généré le {generatedAt}
            </p>
          </div>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 print:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total accueillis
            </p>
            <p className="mt-1 text-4xl font-extrabold text-slate-950">
              {period.count}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Période
            </p>
            <p className="mt-2 text-lg font-bold text-slate-900">
              {period.rangeHint}
            </p>
          </div>
        </div>

        <div className="mt-8">
          {period.visitors.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
              Aucun nouveau venu sur cette période.
            </p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    #
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Nom
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Culte
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Date de culte
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Enregistré le
                  </th>
                </tr>
              </thead>
              <tbody>
                {period.visitors.map((visitor, index) => (
                  <tr key={visitor.id} className="border-b border-slate-100">
                    <td className="px-3 py-2.5 text-slate-500">{index + 1}</td>
                    <td className="px-3 py-2.5 font-semibold text-slate-900">
                      {visitor.name}
                    </td>
                    <td className="px-3 py-2.5">{visitor.culteTypeLabel}</td>
                    <td className="px-3 py-2.5">{visitor.culteDateLabel}</td>
                    <td className="px-3 py-2.5">{visitor.registeredAtLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </article>
    </div>
  );
}
