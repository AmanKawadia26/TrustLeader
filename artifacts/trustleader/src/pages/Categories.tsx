import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { Laptop, Home, Landmark, Plane, Car, Pill, UtensilsCrossed, Shirt, BookOpen, Wrench, Shield, Satellite } from "lucide-react";

const categories = [
  { name: "Electronics & Tech", icon: Laptop, reviews: "4,280" },
  { name: "Home & Garden", icon: Home, reviews: "3,150" },
  { name: "Banking & Finance", icon: Landmark, reviews: "2,890" },
  { name: "Travel & Holidays", icon: Plane, reviews: "2,640" },
  { name: "Motors & Automotive", icon: Car, reviews: "1,920" },
  { name: "Health & Wellness", icon: Pill, reviews: "1,780" },
  { name: "Food & Dining", icon: UtensilsCrossed, reviews: "3,420" },
  { name: "Fashion & Beauty", icon: Shirt, reviews: "2,100" },
  { name: "Education & Courses", icon: BookOpen, reviews: "1,340" },
  { name: "Professional Services", icon: Wrench, reviews: "2,560" },
  { name: "Insurance", icon: Shield, reviews: "1,650" },
  { name: "Telecoms & Broadband", icon: Satellite, reviews: "1,890" },
];

export default function Categories() {
  return (
    <Layout>
      <section className="bg-background py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[hsl(var(--brand-forest))] mb-3">Browse categories</h1>
          <p className="text-muted-foreground text-lg mb-10 max-w-2xl">
            Explore reviews across industries. Use search to find a specific company—category totals are illustrative until
            category filters ship in the API.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((c) => {
              const Icon = c.icon;
              return (
                <Link
                  key={c.name}
                  href={`/search?q=${encodeURIComponent(c.name.split(" ")[0])}`}
                  className="group block rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition hover:shadow-md hover:border-[hsl(var(--brand-forest))]/25"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-[hsl(var(--brand-forest))]/10 p-3 text-[hsl(var(--brand-forest))] group-hover:bg-[hsl(var(--brand-forest))]/15">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-lg text-foreground group-hover:text-[hsl(var(--brand-forest))] mb-1">
                        {c.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">{c.reviews} reviews</p>
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
