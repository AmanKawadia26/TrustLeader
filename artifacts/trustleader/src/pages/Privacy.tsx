import { Layout } from "@/components/Layout";
import { useTranslation } from "react-i18next";
import { SeoHead } from "@/components/SeoHead";
import { ROUTES } from "@/lib/routes";

export default function Privacy() {
  const { t } = useTranslation();
  return (
    <Layout>
      <SeoHead
        title={t("seo.privacy.title")}
        description={t("seo.privacy.description")}
        canonicalPath={ROUTES.privacy}
      />
      <div className="max-w-3xl mx-auto px-4 py-16 prose prose-neutral dark:prose-invert">
        <h1 className="font-serif text-3xl text-[hsl(var(--brand-navy))] mb-6">{t("legal.privacy.title")}</h1>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{t("legal.privacy.body")}</p>
      </div>
    </Layout>
  );
}
