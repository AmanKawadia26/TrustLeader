import { Link } from "wouter";
import type { Business } from "@workspace/api-client-react";
import { useTranslation } from "react-i18next";
import { TrafficLightBadge } from "./TrafficLightBadge";
import { StarRating } from "./StarRating";
import { ShieldCheck, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function BusinessCard({ business }: { business: Business }) {
  const { t } = useTranslation();
  const profileHref = `/business/${business.id}`;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group block h-full rounded-2xl bg-gradient-to-b from-neutral-100/95 to-neutral-200/50 p-[3px] shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="flex h-full flex-col rounded-[calc(1rem-1px)] bg-card border border-neutral-200/80 overflow-hidden">
        <div className="p-5 flex flex-col flex-1">
          <Link href={profileHref} className="block rounded-xl -m-1 p-1 outline-offset-2 hover:bg-muted/30 transition-colors">
            <div className="flex flex-col items-center text-center gap-3 mb-4">
              <div
                className="h-14 w-14 shrink-0 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-sm font-bold text-neutral-600"
                aria-hidden
              >
                {business.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="w-full flex justify-between items-start gap-3">
                <div className="min-w-0 flex-1 text-left">
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {business.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{business.domain}</p>
                </div>
                <TrafficLightBadge status={business.traffic_light} size="sm" showLabel={false} />
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[40px] text-center sm:text-left">
              {business.description || t("business.cardNoBlurb")}
            </p>
          </Link>

          <div className="flex items-center justify-end gap-2 mb-3">
            <StarRating rating={business.average_rating || 0} size="sm" />
            <span className="text-sm font-medium">{business.average_rating?.toFixed(1) || "0.0"}</span>
            <span className="text-sm text-muted-foreground">
              ({t("business.insightCountLabel", { count: business.review_count })})
            </span>
          </div>

          <div className="flex items-center gap-3 mt-auto pt-4 border-t border-neutral-200/80">
            <div className="min-w-0 flex-1">
              {business.insurance_proof && business.traffic_light === "green" && business.insurance ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={`/insurance/${business.insurance.slug}`}
                      className="flex min-w-0 max-w-full items-center gap-1.5 text-xs font-semibold text-[hsl(var(--brand-turquoise))] hover:underline"
                      title={business.insurance.name}
                    >
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span className="truncate">{business.insurance.name}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-sm">
                    <p>{business.insurance.name}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <span className="text-xs text-muted-foreground capitalize">
                  {business.listing_source.replace(/_/g, " ")}
                </span>
              )}
            </div>

            <Link
              href={profileHref}
              className="flex shrink-0 items-center text-sm font-medium text-primary hover:underline transition-transform group-hover:translate-x-0.5"
            >
              {t("business.viewListing")} <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
