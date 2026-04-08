import { Layout } from "@/components/Layout";
import { useTranslation } from "react-i18next";

const stats = [
  { value: "2024", label: "Founded" },
  { value: "2.4M+", label: "Reviews" },
  { value: "148K", label: "Businesses" },
  { value: "43", label: "Team members" },
];

const values = [
  { title: "Integrity first", body: "We publish genuine feedback and enforce clear moderation standards." },
  { title: "Full transparency", body: "Traffic-light signals and insurer disclosures are shown upfront." },
  { title: "Fair for all", body: "Consumers and businesses both get tools to respond and verify." },
  { title: "Community", body: "Reviews help everyone make better decisions together." },
  { title: "Rigorous verification", body: "We combine automated checks with human review where needed." },
  { title: "Consumer advocacy", body: "Your voice matters when something goes wrong." },
];

export default function About() {
  const { t } = useTranslation();

  return (
    <Layout>
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
