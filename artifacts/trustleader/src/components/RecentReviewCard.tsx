import { Link } from "wouter";
import { Star } from "lucide-react";
import type { RecentReviewPublic } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

function TrustStars({ rating }: { rating: number }) {
  const low = rating <= 2;
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < rating;
        return (
          <Star
            key={i}
            className={cn(
              "w-4 h-4",
              filled
                ? low
                  ? "text-red-500 fill-red-500"
                  : "text-emerald-600 fill-emerald-600"
                : "text-neutral-300 fill-none"
            )}
          />
        );
      })}
    </div>
  );
}

function initials(name: string) {
  const p = name.trim().split(/\s+/).slice(0, 2);
  return p.map((s) => s[0]?.toUpperCase() ?? "").join("") || "?";
}

export function RecentReviewCard({ review }: { review: RecentReviewPublic }) {
  const label = review.reviewer_label || "Reviewer";
  return (
    <article className="flex flex-col h-full rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-800"
          aria-hidden
        >
          {initials(label)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-neutral-900 truncate">{label}</p>
          <TrustStars rating={review.rating} />
        </div>
      </div>
      <p className="text-sm text-neutral-700 line-clamp-4 flex-1 leading-relaxed">{review.text}</p>
      <div className="mt-4 pt-3 border-t border-neutral-200">
        <Link
          href={`/business/${review.business_id}`}
          className="group block min-w-0"
        >
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 shrink-0 rounded bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-600">
              {review.business_name.slice(0, 1)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-900 truncate group-hover:underline">
                {review.business_name}
              </p>
              <p className="text-xs text-neutral-500 truncate">{review.business_domain}</p>
            </div>
          </div>
        </Link>
      </div>
    </article>
  );
}
