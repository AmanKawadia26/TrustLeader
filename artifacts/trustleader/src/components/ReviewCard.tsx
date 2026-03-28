import { format } from "date-fns";
import { StarRating } from "./StarRating";
import type { Review } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { MessageSquare } from "lucide-react";

interface ReviewCardProps {
  review: Review;
  showStatus?: boolean;
  onEdit?: (review: Review) => void;
}

export function ReviewCard({ review, showStatus = false, onEdit }: ReviewCardProps) {
  const { t } = useTranslation();

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800"
  };

  return (
    <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <StarRating rating={review.rating} size="sm" />
            <span className="text-sm text-muted-foreground">
              {format(new Date(review.created_at), "MMM d, yyyy")}
            </span>
          </div>
          {review.business_name && (
            <div className="text-sm font-medium mt-1">
              For: {review.business_name}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showStatus && (
            <Badge variant="outline" className={statusColors[review.status]}>
              {t(`review.${review.status}`)}
            </Badge>
          )}
          {onEdit && (
            <button 
              onClick={() => onEdit(review)}
              className="text-sm text-primary hover:underline font-medium"
            >
              {t('dash.consumer.edit')}
            </button>
          )}
        </div>
      </div>
      
      <p className="text-foreground text-sm sm:text-base whitespace-pre-wrap">
        {review.text}
      </p>

      {review.company_response && (
        <div className="mt-5 bg-muted/50 rounded-lg p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-2 text-sm font-semibold">
            <MessageSquare className="w-4 h-4 text-primary" />
            {t('review.companyResponse')}
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {review.company_response}
          </p>
        </div>
      )}
    </div>
  );
}
