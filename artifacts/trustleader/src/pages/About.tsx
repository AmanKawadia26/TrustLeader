import { Layout } from "@/components/Layout";

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
  return (
    <Layout>
      <section className="bg-[hsl(var(--brand-forest))] text-[hsl(var(--brand-cream))] py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">Building trust in a noisy world.</h1>
          <p className="text-lg text-white/85 leading-relaxed">
            TrustLeader helps people find honest, unfiltered information about businesses and pairs it with clear signals
            so you can decide with confidence.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 md:gap-16 items-start">
          <div>
            <h2 className="font-serif text-3xl font-bold text-[hsl(var(--brand-forest))] mb-6">Our story</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                We started TrustLeader to bring clarity to online reviews: not just stars, but context and protection
                when insurers partner with us.
              </p>
              <p>
                Businesses can claim their profiles; listings may also come from data partners or consumer first reviews.
                Every listing shows how it was added.
              </p>
              <p>
                Our traffic-light system reflects aggregate ratings and insurer-backed status—so you see risk and
                protection at a glance.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <p className="font-serif text-2xl font-bold text-[hsl(var(--brand-forest))]">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[hsl(var(--brand-cream))] border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-center text-[hsl(var(--brand-forest))] mb-3">What we stand for</h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            Principles that guide TrustLeader products and moderation.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm">
                <h3 className="font-semibold text-[hsl(var(--brand-forest))] mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
