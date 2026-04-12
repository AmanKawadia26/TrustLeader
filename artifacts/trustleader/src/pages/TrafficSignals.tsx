import { Layout } from "@/components/Layout";
import { HrsTrafficIcon } from "@/components/HrsTrafficIcon";
import { useTranslation } from "react-i18next";
import { SeoHead } from "@/components/SeoHead";
import { ROUTES } from "@/lib/routes";

export default function TrafficSignals() {
  const { t } = useTranslation();

  return (
    <Layout>
      <SeoHead
        title={t("seo.traffic.title")}
        description={t("seo.traffic.description")}
        canonicalPath={ROUTES.trustSignals}
      />
      <section className="border-b border-border/70 bg-[hsl(var(--brand-cream))]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[hsl(var(--brand-navy))] mb-4">
            {t("traffic.page.title")}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{t("traffic.page.intro")}</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-center gap-6 md:gap-10 mb-14 overflow-x-auto pb-2">
          <div className="flex flex-col items-center gap-3 min-w-[7rem]">
            <HrsTrafficIcon status="green" size="lg" />
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{t("traffic.page.greenShort")}</span>
          </div>
          <div className="flex flex-col items-center gap-3 min-w-[7rem]">
            <HrsTrafficIcon status="orange" size="lg" />
            <span className="text-xs font-semibold uppercase tracking-wide text-amber-800">{t("traffic.page.orangeShort")}</span>
          </div>
          <div className="flex flex-col items-center gap-3 min-w-[7rem]">
            <HrsTrafficIcon status="red" size="lg" />
            <span className="text-xs font-semibold uppercase tracking-wide text-red-800">{t("traffic.page.redShort")}</span>
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground max-w-2xl mx-auto mb-16">{t("traffic.page.visualCaption")}</p>

        <div className="space-y-12">
          <article className="rounded-2xl border border-border/80 bg-card p-6 md:p-8 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-emerald-900 dark:text-emerald-200 mb-3">{t("traffic.page.greenTitle")}</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{t("traffic.page.greenBody")}</p>
          </article>
          <article className="rounded-2xl border border-border/80 bg-card p-6 md:p-8 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-amber-950 dark:text-amber-100 mb-3">{t("traffic.page.orangeTitle")}</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{t("traffic.page.orangeBody")}</p>
          </article>
          <article className="rounded-2xl border border-border/80 bg-card p-6 md:p-8 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-red-900 dark:text-red-200 mb-3">{t("traffic.page.redTitle")}</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{t("traffic.page.redBody")}</p>
          </article>
        </div>
      </section>
    </Layout>
  );
}
