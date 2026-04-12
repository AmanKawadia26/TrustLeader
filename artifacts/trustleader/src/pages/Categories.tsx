import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { CATEGORIES } from "@/config/categories";
import { SeoHead } from "@/components/SeoHead";
import { ROUTES } from "@/lib/routes";

export default function Categories() {
  const { t } = useTranslation();

  return (
    <Layout>
      <SeoHead
        title={t("seo.sectors.title")}
        description={t("seo.sectors.description")}
        canonicalPath={ROUTES.browseSectors}
      />
      <section className="bg-background py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[hsl(var(--brand-navy))] mb-3">
            {t("categories.page.title")}
          </h1>
          <p className="text-muted-foreground text-lg mb-10 max-w-2xl">{t("categories.page.lead")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((c) => {
              const Icon = c.browseIcon;
              return (
                <Link
                  key={c.id}
                  href={`${ROUTES.exploreListings}?q=${encodeURIComponent(c.searchQuery)}`}
                  className="group block rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition hover:shadow-md hover:border-neutral-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-neutral-100 p-3 text-neutral-800 group-hover:bg-neutral-200/80">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-lg text-foreground group-hover:text-neutral-950 mb-1">
                        {c.browseName}
                      </h2>
                      <p className="text-sm text-muted-foreground">{t("categories.cardCount", { count: c.reviews })}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}
