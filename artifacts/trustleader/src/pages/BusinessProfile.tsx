import { useParams, Link } from "wouter";
import { Layout } from "@/components/Layout";
import { useBusinessQuery } from "@/hooks/use-businesses";
import { useBusinessReviewsQuery } from "@/hooks/use-reviews";
import { TrafficLightBadge } from "@/components/TrafficLightBadge";
import { InsuranceBanner } from "@/components/InsuranceBanner";
import { StarRating } from "@/components/StarRating";
import { ReviewCard } from "@/components/ReviewCard";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, PenLine } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function BusinessProfile() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  
  const { data: business, isLoading: businessLoading, error } = useBusinessQuery(id);
  const { data: reviewsData, isLoading: reviewsLoading } = useBusinessReviewsQuery(id, { limit: 20 });

  if (businessLoading) return (
    <Layout><div className="flex h-[60vh] items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div></Layout>
  );

  if (error || !business) return (
    <Layout><div className="flex h-[60vh] items-center justify-center text-destructive">Failed to load business profile.</div></Layout>
  );

  return (
    <Layout>
      <div className="bg-[hsl(var(--brand-cream))] border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <TrafficLightBadge status={business.traffic_light} size="lg" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground rounded-full border px-3 py-1 bg-background/80">
                  {business.listing_source.replace(/_/g, " ")}
                </span>
              </div>
              <h1 className="font-serif text-4xl font-bold tracking-tight text-[hsl(var(--brand-forest))] mb-2">{business.name}</h1>
              <a href={`https://${business.domain}`} target="_blank" rel="noreferrer" className="inline-flex items-center text-lg text-primary hover:underline mb-6">
                {business.domain} <ExternalLink className="w-4 h-4 ml-1.5" />
              </a>
              
              <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm inline-flex border border-border/50">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold">{business.average_rating?.toFixed(1) || '0.0'}</span>
                  <StarRating rating={business.average_rating || 0} size="sm" />
                </div>
                <div className="w-px h-10 bg-border mx-2"></div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold">{business.review_count}</span>
                  <span className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Reviews</span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto shrink-0 flex flex-col gap-4">
              <Link href={`/write-review/${business.id}`}>
                <Button size="lg" className="w-full md:w-auto text-lg h-14 rounded-xl shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-transform">
                  <PenLine className="w-5 h-5 mr-2" />
                  {t('business.writeReview')}
                </Button>
              </Link>
            </div>
          </div>

          {business.insurance_proof && business.traffic_light === "green" && business.insurance && (
            <div className="mt-8 max-w-3xl">
              <InsuranceBanner insurance={business.insurance} />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-8">{t('business.reviews')}</h2>
        
        {reviewsLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : reviewsData?.reviews?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviewsData.reviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed">
            <h3 className="text-lg font-medium text-foreground mb-2">No reviews yet.</h3>
            <p className="text-muted-foreground mb-6">Be the first to share your experience with {business.name}.</p>
            <Link href={`/write-review/${business.id}`}>
              <Button variant="outline">Write a Review</Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
