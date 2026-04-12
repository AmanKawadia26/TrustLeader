import { Layout } from "@/components/Layout";
import { useTranslation } from "react-i18next";
import { SeoHead } from "@/components/SeoHead";
import { ROUTES } from "@/lib/routes";

export default function Terms() {
  const { t } = useTranslation();
  return (
    <Layout>
      <SeoHead
        title={t("seo.terms.title")}
        description={t("seo.terms.description")}
        canonicalPath={ROUTES.terms}
      />
      <div className="max-w-3xl mx-auto px-4 py-16 prose prose-neutral dark:prose-invert">
        <h1 className="font-serif text-3xl text-[hsl(var(--brand-navy))] mb-6">{t("legal.terms.title")}</h1>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{t("legal.terms.body")}</p>
      </div>
    </Layout>
  );
}
