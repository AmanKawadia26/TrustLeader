import { useParams, Link } from "wouter";
import { Layout } from "@/components/Layout";
import { BusinessCard } from "@/components/BusinessCard";
import {
  useGetInsuranceCompany,
  useListInsuranceCompanyBusinesses,
  getGetInsuranceCompanyQueryKey,
  getListInsuranceCompanyBusinessesQueryKey,
} from "@workspace/api-client-react";
import { Loader2, ExternalLink, Building2, MessageSquare, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function InsuranceProfile() {
  const { slug } = useParams<{ slug: string }>();

  const listParams = { page: 1, limit: 24 } as const;

  const { data, isLoading, error } = useGetInsuranceCompany(slug ?? "", {
    query: {
      enabled: !!slug,
      queryKey: getGetInsuranceCompanyQueryKey(slug ?? ""),
    },
  });

  const { data: businessesData, isLoading: businessesLoading } = useListInsuranceCompanyBusinesses(
    slug ?? "",
    listParams,
    {
      query: {
        enabled: !!slug,
        queryKey: getListInsuranceCompanyBusinessesQueryKey(slug ?? "", listParams),
      },
    },
  );

  if (!slug) {
    return (
      <Layout>
        <div className="flex h-[50vh] items-center justify-center text-muted-foreground">Invalid URL.</div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="flex h-[60vh] items-center justify-center text-destructive">
          Insurance company not found.
        </div>
      </Layout>
    );
  }

  const { insurance, stats } = data;

  return (
    <Layout>
      <section className="bg-[hsl(var(--brand-cream))] border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Insurance partner
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-[hsl(var(--brand-navy))] mb-4">
            {insurance.name}
          </h1>
          {insurance.description ? (
            <p className="text-lg text-muted-foreground max-w-3xl mb-6">{insurance.description}</p>
          ) : null}
          {insurance.terms_url ? (
            <a
              href={insurance.terms_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center text-primary font-medium hover:underline"
            >
              View insurer terms <ExternalLink className="w-4 h-4 ml-1.5" />
            </a>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
            <div className="rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-1">
                <Building2 className="w-4 h-4" />
                Partner businesses
              </div>
              <p className="text-3xl font-bold text-[hsl(var(--brand-navy))]">{stats.partner_businesses}</p>
              <p className="text-xs text-muted-foreground mt-1">Active listings with verified insurance proof</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-1">
                <MessageSquare className="w-4 h-4" />
                Total reviews
              </div>
              <p className="text-3xl font-bold text-[hsl(var(--brand-navy))]">{stats.total_reviews}</p>
              <p className="text-xs text-muted-foreground mt-1">Approved reviews across partner businesses</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-1">
                <Star className="w-4 h-4" />
                Average rating
              </div>
              <p className="text-3xl font-bold text-[hsl(var(--brand-navy))]">
                {stats.average_rating != null ? stats.average_rating.toFixed(1) : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">From approved reviews (no claim data tracked)</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[hsl(var(--brand-navy))] mb-2">Partner businesses</h2>
          <p className="text-muted-foreground mb-8">
            Companies listed with this insurer on My Protector.
          </p>

          {businessesLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-10 h-10 animate-spin text-[hsl(var(--brand-navy))]" />
            </div>
          ) : businessesData?.businesses?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {businessesData.businesses.map((business, i) => (
                <motion.div
                  key={business.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <BusinessCard business={business} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl border border-dashed border-border/80 bg-muted/20">
              <p className="text-muted-foreground">No partner businesses listed yet.</p>
              <Link href="/explore-listings" className="inline-block mt-4 text-primary font-medium hover:underline">
                Browse all businesses
              </Link>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
