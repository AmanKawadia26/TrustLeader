import { Link } from "wouter";
import type { Business } from "@workspace/api-client-react";
import { TrafficLightBadge } from "./TrafficLightBadge";
import { StarRating } from "./StarRating";
import { ShieldCheck, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export function BusinessCard({ business }: { business: Business }) {
  return (
    <Link href={`/business/${business.id}`}>
      <motion.div 
        whileHover={{ y: -4 }}
        className="group block h-full bg-card rounded-2xl border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden cursor-pointer"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4 gap-4">
            <div>
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {business.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{business.domain}</p>
            </div>
            <TrafficLightBadge status={business.traffic_light} size="sm" showLabel={false} />
          </div>

          <div className="flex items-center gap-2 mb-4">
            <StarRating rating={business.average_rating || 0} size="sm" />
            <span className="text-sm font-medium">{business.average_rating?.toFixed(1) || '0.0'}</span>
            <span className="text-sm text-muted-foreground">({business.review_count} reviews)</span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-6 min-h-[40px]">
            {business.description || "No description provided."}
          </p>

          <div className="flex items-center justify-between mt-auto pt-4 border-t">
            {business.green_insurance_eligible && business.traffic_light === 'green' ? (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Markel Eligible</span>
              </div>
            ) : (
              <div /> // empty placeholder for flex layout
            )}
            
            <div className="flex items-center text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
              View Profile <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
