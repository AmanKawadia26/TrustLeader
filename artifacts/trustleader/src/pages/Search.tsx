import { useMemo, useState } from "react";
import { useSearch, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { BusinessCard } from "@/components/BusinessCard";
import { useBusinessesQuery } from "@/hooks/use-businesses";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { SeoHead } from "@/components/SeoHead";
import { ROUTES } from "@/lib/routes";
import { useSessionPrefsStore } from "@/stores/session-prefs-store";

export default function SearchPage() {
  const { t } = useTranslation();
  const searchStr = useSearch();
  const initialQ = useMemo(() => new URLSearchParams(searchStr).get("q") || "", [searchStr]);
  const [qInput, setQInput] = useState(initialQ);
  const [submitted, setSubmitted] = useState(initialQ);
  const setLastSearchQuery = useSessionPrefsStore((s) => s.setLastSearchQuery);

  const { data, isLoading } = useBusinessesQuery({ q: submitted || undefined, page: 1, limit: 24 });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(qInput);
    setLastSearchQuery(qInput);
    const params = new URLSearchParams();
    if (qInput) params.set("q", qInput);
    const next = params.toString() ? `?${params.toString()}` : "";
    window.history.replaceState(null, "", `${window.location.pathname}${next}`);
  };

  const hasQuery = Boolean(submitted.trim());
  const emptyResults = !isLoading && data?.businesses?.length === 0;
  const showBigCta = emptyResults && hasQuery;

  const resultLine =
    data?.total != null
      ? data.total === 1
        ? t("explore.matchSingular", { count: data.total })
        : t("explore.matchPlural", { count: data.total })
      : "";

  return (
    <Layout>
      <SeoHead
        title={t("seo.explore.title")}
        description={t("seo.explore.description")}
        canonicalPath={ROUTES.exploreListings}
      />
      <section className="bg-[hsl(var(--brand-cream))] border-b border-border/50 py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[hsl(var(--brand-navy))] mb-2">
            {t("explore.heroTitle")}
          </h1>
          <p className="text-muted-foreground mb-8">{t("explore.heroSubtitle")}</p>
          <form onSubmit={onSubmit} className="relative flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder={t("explore.inputPlaceholder")}
                className="h-12 pl-10 rounded-xl border-border/80 bg-background"
              />
            </div>
            <Button
              type="submit"
              className="h-12 px-6 rounded-xl bg-[hsl(var(--brand-navy))] hover:bg-[hsl(var(--brand-navy))]/90 text-[hsl(var(--brand-cream))]"
            >
              {t("explore.submit")}
            </Button>
          </form>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground mb-6">{resultLine}</p>
          {isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-10 h-10 animate-spin text-[hsl(var(--brand-royal))]" />
              <span className="sr-only">{t("explore.loading")}</span>
            </div>
          ) : data?.businesses?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.businesses.map((business, i) => (
                <motion.div
                  key={business.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <BusinessCard business={business} />
                </motion.div>
              ))}
            </div>
          ) : showBigCta ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-full max-w-lg rounded-2xl border border-dashed border-border/80 bg-muted/20 p-8 md:p-10 text-center">
                <p className="text-lg font-semibold text-[hsl(var(--brand-navy))] mb-2">{t("explore.empty.noMatchTitle")}</p>
                <p className="text-muted-foreground mb-8">{t("explore.empty.noMatchBody")}</p>
                <p className="text-sm text-muted-foreground mb-6">{t("explore.cta.body")}</p>
                <Button
                  asChild
                  size="lg"
                  className="w-full max-w-md h-auto min-h-14 py-4 px-6 text-center whitespace-normal text-base font-semibold rounded-2xl bg-[hsl(var(--brand-royal))] hover:bg-[hsl(var(--brand-royal))]/90 text-white"
                >
                  <Link href={ROUTES.authRegisterBusiness}>{t("explore.cta.button")}</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 rounded-2xl border border-dashed border-border/80 bg-muted/20 max-w-2xl mx-auto px-4">
              <p className="text-lg font-medium text-[hsl(var(--brand-navy))]">{t("explore.empty.promptTitle")}</p>
              <p className="text-muted-foreground mt-2">{t("explore.empty.promptBody")}</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
