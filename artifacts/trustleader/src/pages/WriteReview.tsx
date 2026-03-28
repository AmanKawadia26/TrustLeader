import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { useBusinessQuery } from "@/hooks/use-businesses";
import { useCreateReviewMutation } from "@/hooks/use-reviews";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function WriteReview() {
  const { businessId } = useParams<{ businessId: string }>();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  
  const { data: business, isLoading: businessLoading } = useBusinessQuery(businessId);
  const createMutation = useCreateReviewMutation();

  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || text.length < 10) return;

    createMutation.mutate({
      data: {
        business_id: businessId,
        rating,
        text
      }
    }, {
      onSuccess: () => {
        setLocation(`/business/${businessId}`);
      }
    });
  };

  if (businessLoading) return (
    <Layout><div className="flex h-screen items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div></Layout>
  );

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href={`/business/${businessId}`} className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to profile
        </Link>

        <div className="bg-card border rounded-3xl p-8 shadow-xl shadow-black/5">
          <h1 className="text-3xl font-bold mb-2">Write a review</h1>
          <p className="text-muted-foreground mb-8 text-lg">for <span className="font-semibold text-foreground">{business?.name}</span></p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-medium mb-4">{t('review.rating')}</label>
              <StarRating 
                rating={rating} 
                onRatingChange={setRating} 
                interactive 
                size="lg" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('review.text')}</label>
              <Textarea 
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Share your experience..."
                className="min-h-[160px] text-base resize-y p-4 rounded-xl bg-muted/20 focus-visible:bg-background"
              />
              <p className="text-xs text-muted-foreground mt-2 text-right">
                {text.length}/10 {t('review.minChars')}
              </p>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full h-14 text-lg rounded-xl"
              disabled={rating === 0 || text.length < 10 || createMutation.isPending}
            >
              {createMutation.isPending && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
              {t('review.submit')}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
