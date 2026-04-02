import { useState } from "react";
import { Layout } from "@/components/Layout";
import { BusinessCard } from "@/components/BusinessCard";
import { RecentReviewCard } from "@/components/RecentReviewCard";
import { useBusinessesQuery } from "@/hooks/use-businesses";
import { useRecentReviewsQuery } from "@/hooks/use-recent-reviews";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Loader2,
  ChevronRight,
  Building2,
  Plane,
  Car,
  Bed,
  Gem,
  Shirt,
  Laptop,
  Dumbbell,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { FaApple, FaFacebookF, FaGoogle } from "react-icons/fa";

const CATEGORY_LINKS: { icon: typeof Building2; labelKey: string; href: string }[] = [
  { icon: Building2, labelKey: "home.cat.bank", href: "/search?q=bank" },
  { icon: Plane, labelKey: "home.cat.travel", href: "/search?q=travel" },
  { icon: Car, labelKey: "home.cat.car", href: "/search?q=car" },
  { icon: Bed, labelKey: "home.cat.furniture", href: "/search?q=furniture" },
  { icon: Gem, labelKey: "home.cat.jewelry", href: "/search?q=jewelry" },
  { icon: Shirt, labelKey: "home.cat.clothing", href: "/search?q=clothing" },
  { icon: Laptop, labelKey: "home.cat.tech", href: "/search?q=technology" },
  { icon: Dumbbell, labelKey: "home.cat.fitness", href: "/search?q=fitness" },
];

export default function Home() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  const businessesQuery = useBusinessesQuery({
    q: submittedSearch || undefined,
    limit: 8,
  });

  const { data, isLoading, isError } = businessesQuery;
  const recentQ = useRecentReviewsQuery();
  const apiDown = isError || recentQ.isError;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedSearch(search);
  };

  const showDiscovery = !submittedSearch;

  return (
    <Layout>
      {apiDown ? (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-950 px-4 py-3 text-center text-sm">
          {t("home.apiOffline")}
        </div>
      ) : null}

      <section className="relative overflow-hidden tl-hero-bg text-neutral-900">
        <div className="absolute inset-0 pointer-events-none tl-hero-gradient" aria-hidden />
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-yellow-300/35 blur-3xl" />
        <div className="pointer-events-none absolute -top-16 -right-20 h-80 w-80 rounded-full bg-emerald-400/25 blur-3xl" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-sans text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 text-neutral-900"
            >
              {t("home.hero.title")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-lg sm:text-xl text-neutral-700 mb-10"
            >
              {t("home.hero.subtitle")}
            </motion.p>

            <motion.form
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleSearch}
              className="relative max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 sm:items-center"
            >
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("home.hero.search")}
                  className="w-full pl-12 pr-4 py-6 text-lg rounded-2xl bg-white/95 border border-neutral-200 text-foreground shadow-md"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="sm:w-auto w-full rounded-xl px-8 h-12 bg-neutral-900 text-white hover:bg-neutral-800 font-semibold shadow-md"
              >
                {t("home.hero.searchButton")}
              </Button>
            </motion.form>

            {showDiscovery ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-8 flex justify-center px-2"
              >
                <Link href="/write-review/b0000001-0000-4000-8000-000000000001">
                  <span className="inline-flex rounded-full bg-gradient-to-r from-sky-200/90 via-emerald-100/95 to-amber-100/90 p-[1px] shadow-sm ring-1 ring-white/40">
                    <Button
                      variant="ghost"
                      className="h-auto rounded-full border-0 bg-white/75 px-4 py-2 sm:px-5 sm:py-2.5 text-sm font-semibold text-blue-800 shadow-none backdrop-blur-[2px] hover:bg-white/90 hover:text-blue-900"
                    >
                      {t("home.pillReview")}
                      <ChevronRight className="ml-1.5 h-4 w-4 shrink-0 opacity-80" />
                    </Button>
                  </span>
                </Link>
              </motion.div>
            ) : null}

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-sm text-neutral-800">
              <div>
                <p className="font-sans text-xl font-bold">2.4M+</p>
                <p className="text-neutral-600">{t("home.stats.reviews")}</p>
              </div>
              <div>
                <p className="font-sans text-xl font-bold">148K</p>
                <p className="text-neutral-600">{t("home.stats.businesses")}</p>
              </div>
              <div>
                <p className="font-sans text-xl font-bold">97%</p>
                <p className="text-neutral-600">{t("home.stats.checks")}</p>
              </div>
              <div>
                <p className="font-sans text-xl font-bold">4.8</p>
                <p className="text-neutral-600">{t("home.stats.score")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showDiscovery ? (
        <section className="py-12 bg-white border-y border-neutral-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <h2 className="font-sans text-2xl sm:text-3xl font-bold text-neutral-900">
                {t("home.categories.title")}
              </h2>
              <div className="flex items-center gap-2">
                <Link href="/categories">
                  <Button variant="outline" className="rounded-full border-blue-600 text-blue-700">
                    {t("home.categories.seemore")}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]">
              {CATEGORY_LINKS.map(({ icon: Icon, labelKey, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-center gap-2 min-w-[5.5rem] shrink-0 p-3 rounded-2xl border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 transition-colors"
                >
                  <Icon className="w-8 h-8 text-neutral-800 stroke-[1.5]" />
                  <span className="text-xs text-center text-neutral-700 leading-tight">{t(labelKey)}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {showDiscovery ? (
        <section className="py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto rounded-[2rem] bg-gradient-to-br from-pink-100 via-rose-50 to-pink-50 border border-pink-200/80 px-6 py-10 sm:px-10 sm:py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <p className="font-sans text-lg sm:text-xl font-medium text-neutral-900 max-w-2xl">
              {t("home.promo.title")}
            </p>
            <Link href="/auth/register/business">
              <Button className="rounded-full bg-neutral-900 text-white hover:bg-neutral-800 px-8 h-12 font-semibold shrink-0">
                {t("home.promo.cta")}
              </Button>
            </Link>
          </div>
        </section>
      ) : null}

      {showDiscovery ? (
        <section className="py-12 bg-[hsl(var(--brand-cream))]/50 border-y border-neutral-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-sans text-2xl font-bold text-neutral-900">{t("home.bestIn.title")}</h2>
              <Link href="/search" className="text-sm font-semibold text-blue-700 hover:underline">
                {t("home.categories.seemore")}
              </Link>
            </div>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-10 h-10 text-[hsl(var(--brand-forest))] animate-spin" />
              </div>
            ) : data?.businesses?.length ? (
              <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]">
                {data.businesses.slice(0, 4).map((business, i) => (
                  <motion.div
                    key={business.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="min-w-[260px] max-w-[280px] shrink-0"
                  >
                    <BusinessCard business={business} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-600 text-sm py-8">{t("home.recent.unavailable")}</p>
            )}
          </div>
        </section>
      ) : null}

      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-[hsl(var(--brand-cream))]/80">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-[2rem] bg-white/90 border border-neutral-200/80 shadow-sm overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-10 items-center p-8 lg:p-12">
              <div>
                <h2 className="font-sans text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
                  {t("home.cta.title")}
                </h2>
                <p className="text-neutral-700 text-lg mb-8 leading-relaxed">{t("home.cta.subtitle")}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Link href="/auth/login">
                    <Button
                      size="lg"
                      className="rounded-full bg-neutral-900 text-white hover:bg-neutral-800 px-8 h-12"
                    >
                      {t("home.cta.loginSignup")}
                    </Button>
                  </Link>
                  <div className="hidden sm:block h-10 w-px bg-neutral-300" aria-hidden />
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-neutral-600 sm:hidden">{t("home.cta.orContinue")}</span>
                    <Link href="/auth/login" aria-label="Google">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="rounded-full h-11 w-11 border-neutral-300 bg-white"
                      >
                        <FaGoogle className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/auth/login" aria-label="Facebook">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="rounded-full h-11 w-11 border-neutral-300 bg-white"
                      >
                        <FaFacebookF className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/auth/login" aria-label="Apple">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="rounded-full h-11 w-11 border-neutral-300 bg-white"
                      >
                        <FaApple className="h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <p className="mt-6 text-sm text-neutral-600">
                  {t("home.cta.noAccount")}{" "}
                  <Link href="/auth/register" className="font-semibold text-blue-700 underline">
                    {t("nav.register")}
                  </Link>
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 lg:gap-4">
                <div className="aspect-[3/4] rounded-2xl bg-gradient-to-b from-emerald-100 to-sky-100 border border-white shadow-inner" />
                <div className="aspect-[3/4] rounded-2xl bg-gradient-to-b from-rose-100 to-amber-50 border border-white shadow-inner mt-6" />
                <div className="aspect-[3/4] rounded-2xl bg-gradient-to-b from-violet-100 to-neutral-100 border border-white shadow-inner" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-sans text-3xl font-bold text-[hsl(var(--brand-forest))]">
              {submittedSearch ? t("home.featured.resultsFor", { q: submittedSearch }) : t("home.featured")}
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-[hsl(var(--brand-forest))] animate-spin" />
            </div>
          ) : data?.businesses?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {data.businesses.map((business, i) => (
                <motion.div
                  key={business.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <BusinessCard business={business} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">{t("home.featured.emptyTitle")}</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {isError ? t("home.apiOffline") : t("home.featured.emptyBody")}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-white border-t border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <h2 className="font-sans text-3xl font-bold text-neutral-900">{t("home.recent.title")}</h2>
            <p className="text-sm text-neutral-500">{t("home.recent.hint")}</p>
          </div>

          {recentQ.isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 text-[hsl(var(--brand-forest))] animate-spin" />
            </div>
          ) : recentQ.data?.reviews?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {recentQ.data.reviews.map((rev) => (
                <RecentReviewCard key={rev.id} review={rev} />
              ))}
            </div>
          ) : (
            <p className="text-center text-neutral-600 py-12 max-w-lg mx-auto">
              {recentQ.isError ? t("home.apiOffline") : t("home.recent.unavailable")}
            </p>
          )}
        </div>
      </section>
    </Layout>
  );
}
