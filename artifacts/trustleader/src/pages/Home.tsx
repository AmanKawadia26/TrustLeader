import { useState } from "react";
import { Layout } from "@/components/Layout";
import { BusinessCard } from "@/components/BusinessCard";
import { useBusinessesQuery } from "@/hooks/use-businesses";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export default function Home() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  const { data, isLoading } = useBusinessesQuery({ 
    q: submittedSearch || undefined, 
    limit: 6 
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedSearch(search);
  };

  return (
    <Layout>
      {/* landing page hero abstract professional trust platform */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="Abstract Trust Background" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/80 to-slate-900"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6"
            >
              {t('home.hero.title')}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg sm:text-xl text-slate-300 mb-10"
            >
              {t('home.hero.subtitle')}
            </motion.p>
            
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onSubmit={handleSearch} 
              className="relative max-w-2xl mx-auto flex items-center"
            >
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('home.hero.search')}
                  className="w-full pl-12 pr-4 py-6 text-lg rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus-visible:ring-primary focus-visible:border-primary backdrop-blur-sm"
                />
              </div>
              <Button type="submit" size="lg" className="absolute right-2 rounded-xl px-6 h-10">
                Search
              </Button>
            </motion.form>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold">{submittedSearch ? `Results for "${submittedSearch}"` : t('home.featured')}</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : data?.businesses?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {data.businesses.map((business, i) => (
                <motion.div
                  key={business.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <BusinessCard business={business} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No businesses found</h3>
              <p className="text-muted-foreground">Try adjusting your search query.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
