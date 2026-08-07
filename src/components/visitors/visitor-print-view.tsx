"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Download } from "lucide-react";
import type { VisitorPrintData } from "@/lib/visitors/visitor-print-data";

type VisitorPrintViewProps = {
  data: VisitorPrintData;
  visitorId: string;
};

function PrintSection({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <section className="mt-6 break-inside-avoid">
      <h2 className="border-b border-slate-200 pb-2 text-sm font-bold uppercase tracking-wider text-slate-700">
        {title}
      </h2>
      <table className="mt-3 w-full border-collapse text-sm">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-slate-100">
              <th className="w-[38%] px-2 py-2.5 text-left align-top text-xs font-semibold text-slate-500">
                {row.label}
              </th>
              <td className="px-2 py-2.5 font-medium text-slate-900">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function VisitorPrintView({ data, visitorId }: VisitorPrintViewProps) {
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
          href={`/dashboard/personnes/${visitorId}`}
          className="dash-btn-secondary h-10 px-5"
        >
          Retour à la fiche
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
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              Fiche de contact des nouveaux venus
            </h1>
            <p className="mt-2 text-lg font-bold text-slate-800">{data.displayName}</p>
            <p className="mt-1 text-sm text-slate-500">
              Culte {data.culteTypeLabel.toLowerCase()} · {data.culteDateLabel} ·
              Enregistrée le {data.registeredAtLabel} · Généré le {data.generatedAt}
            </p>
          </div>
        </header>

        <div className="mt-5 grid gap-3 sm:grid-cols-3 print:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Culte
            </p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {data.culteTypeLabel} · {data.culteDateLabel}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Enregistrée le
            </p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {data.registeredAtLabel}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Enregistré par
            </p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {data.registeredByName}
            </p>
          </div>
        </div>

        <PrintSection title="Identité" rows={data.identity} />
        <PrintSection title="Contact & adresse" rows={data.contact} />
        <PrintSection title="Vie spirituelle" rows={data.spiritual} />
        <PrintSection title="Invité par" rows={data.sponsor} />

        <section className="mt-6 break-inside-avoid">
          <h2 className="border-b border-slate-200 pb-2 text-sm font-bold uppercase tracking-wider text-slate-700">
            Questions personnelles
          </h2>
          <table className="mt-3 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-2 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Question
                </th>
                <th className="w-24 px-2 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Réponse
                </th>
              </tr>
            </thead>
            <tbody>
              {data.questions.map((item) => (
                <tr key={item.label} className="border-b border-slate-100 align-top">
                  <td className="px-2 py-2.5">
                    <p className="font-medium text-slate-900">{item.label}</p>
                    {item.note && (
                      <p className="mt-1 text-xs text-slate-600">{item.note}</p>
                    )}
                  </td>
                  <td className="px-2 py-2.5 font-bold text-slate-900">{item.answer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <PrintSection title="Suivi pastoral" rows={data.followUp} />

        {data.remarques && (
          <section className="mt-6 break-inside-avoid">
            <h2 className="border-b border-slate-200 pb-2 text-sm font-bold uppercase tracking-wider text-slate-700">
              Remarques
            </h2>
            <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-800">
              {data.remarques}
            </p>
          </section>
        )}
      </article>
    </div>
  );
}
