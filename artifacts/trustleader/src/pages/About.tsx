import { Layout } from "@/components/Layout";
import { useTranslation } from "react-i18next";
import { SeoHead } from "@/components/SeoHead";
import { ROUTES } from "@/lib/routes";

export default function About() {
  const { t } = useTranslation();

  const stats = [
    { value: t("about.stat1.value"), label: t("about.stat1.label") },
    { value: t("about.stat2.value"), label: t("about.stat2.label") },
    { value: t("about.stat3.value"), label: t("about.stat3.label") },
    { value: t("about.stat4.value"), label: t("about.stat4.label") },
  ];

  const values = [
    { title: t("about.value1.title"), body: t("about.value1.body") },
    { title: t("about.value2.title"), body: t("about.value2.body") },
    { title: t("about.value3.title"), body: t("about.value3.body") },
    { title: t("about.value4.title"), body: t("about.value4.body") },
    { title: t("about.value5.title"), body: t("about.value5.body") },
    { title: t("about.value6.title"), body: t("about.value6.body") },
  ];

  return (
    <Layout>
      <SeoHead
        title={t("seo.about.title")}
        description={t("seo.about.description")}
        canonicalPath={ROUTES.about}
      />
      <section className="bg-gradient-to-br from-[hsl(var(--brand-navy))] via-[hsl(222_47%_20%)] to-[hsl(var(--brand-royal))] text-white py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">{t("about.hero.title")}</h1>
          <p className="text-lg text-white/85 leading-relaxed">{t("about.hero.lead")}</p>
        </div>
      </section>

      <section className="py-16 md:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 md:gap-16 items-start">
          <div>
            <h2 className="font-serif text-3xl font-bold text-[hsl(var(--brand-navy))] mb-6">{t("about.story.title")}</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>{t("about.story.p1")}</p>
              <p>{t("about.story.p2")}</p>
              <p>{t("about.story.p3")}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <p className="font-serif text-2xl font-bold text-[hsl(var(--brand-navy))]">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[hsl(var(--brand-cream))] border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-center text-[hsl(var(--brand-navy))] mb-3">{t("about.values.title")}</h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">{t("about.values.lead")}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm">
                <h3 className="font-semibold text-[hsl(var(--brand-navy))] mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
