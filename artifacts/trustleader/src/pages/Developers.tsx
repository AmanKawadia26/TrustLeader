import { Layout } from "@/components/Layout";
import { useTranslation } from "react-i18next";
import { SeoHead } from "@/components/SeoHead";
import { ROUTES } from "@/lib/routes";

export default function Developers() {
  const { t } = useTranslation();
  return (
    <Layout>
      <SeoHead
        title={t("seo.developers.title")}
        description={t("seo.developers.description")}
        canonicalPath={ROUTES.developers}
      />
      <div className="max-w-3xl mx-auto px-4 py-16 prose prose-neutral dark:prose-invert">
        <h1 className="font-serif text-3xl text-[hsl(var(--brand-navy))] mb-6">{t("legal.developers.title")}</h1>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{t("legal.developers.body")}</p>
      </div>
    </Layout>
  );
}
