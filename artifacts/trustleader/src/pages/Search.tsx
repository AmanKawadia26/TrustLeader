import { useMemo, useState } from "react";
import { useSearch } from "wouter";
import { Layout } from "@/components/Layout";
import { BusinessCard } from "@/components/BusinessCard";
import { useBusinessesQuery } from "@/hooks/use-businesses";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function SearchPage() {
  const searchStr = useSearch();
  const initialQ = useMemo(() => new URLSearchParams(searchStr).get("q") || "", [searchStr]);
  const [qInput, setQInput] = useState(initialQ);
  const [submitted, setSubmitted] = useState(initialQ);

  const { data, isLoading } = useBusinessesQuery({ q: submitted || undefined, page: 1, limit: 24 });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(qInput);
    const params = new URLSearchParams();
    if (qInput) params.set("q", qInput);
    const next = params.toString() ? `?${params.toString()}` : "";
    window.history.replaceState(null, "", `${window.location.pathname}${next}`);
  };

  return (
    <Layout>
      <section className="bg-[hsl(var(--brand-cream))] border-b border-border/50 py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[hsl(var(--brand-forest))] mb-2">
            Search reviews
          </h1>
          <p className="text-muted-foreground mb-8">Find companies and read verified experiences.</p>
          <form onSubmit={onSubmit} className="relative flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder="Search companies..."
                className="h-12 pl-10 rounded-xl border-border/80 bg-background"
              />
            </div>
            <Button type="submit" className="h-12 px-6 rounded-xl bg-[hsl(var(--brand-forest))] hover:bg-[hsl(var(--brand-forest))]/90 text-[hsl(var(--brand-cream))]">
              Search
            </Button>
          </form>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground mb-6">
            {data?.total != null ? `${data.total} result${data.total === 1 ? "" : "s"}` : ""}
          </p>
          {isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-10 h-10 animate-spin text-[hsl(var(--brand-forest))]" />
            </div>
          ) : data?.businesses?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.businesses.map((business, i) => (
                <motion.div key={business.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <BusinessCard business={business} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 rounded-2xl border border-dashed border-border/80 bg-muted/20">
              <p className="text-lg font-medium">No businesses match your search.</p>
              <p className="text-muted-foreground mt-2">Try a shorter name or domain.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
