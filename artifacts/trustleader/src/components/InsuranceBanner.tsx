import type { InsuranceCompanySummary } from "@workspace/api-client-react";
import { ShieldCheck } from "lucide-react";

export function InsuranceBanner({ insurance }: { insurance: InsuranceCompanySummary }) {
  return (
    <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/90 dark:bg-emerald-950/40 dark:border-emerald-800 p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-emerald-600/15 p-3 text-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-900 dark:text-emerald-200">
            Insurance-backed on TrustLeader
          </p>
          <h3 className="mt-1 font-serif text-xl text-emerald-950 dark:text-emerald-50">
            {insurance.name}
          </h3>
          {insurance.description ? (
            <p className="mt-2 text-sm text-emerald-900/85 dark:text-emerald-100/90">{insurance.description}</p>
          ) : null}
          {insurance.terms_url ? (
            <a
              href={insurance.terms_url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm font-medium text-emerald-800 underline underline-offset-4 hover:text-emerald-950 dark:text-emerald-200"
            >
              View insurer terms
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
