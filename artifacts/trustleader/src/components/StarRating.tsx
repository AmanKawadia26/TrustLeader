import { Star } from "lucide-react";
import { twMerge } from "tailwind-merge";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({ 
  rating, 
  max = 5, 
  size = "md", 
  interactive = false, 
  onRatingChange,
  className 
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-8 h-8"
  }[size];

  return (
    <div className={twMerge("flex items-center gap-1", className)}>
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        const filled = rating >= starValue;
        
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange?.(starValue)}
            className={twMerge(
              "transition-all duration-200",
              interactive ? "hover:scale-110 cursor-pointer" : "cursor-default",
              filled ? "text-amber-400 drop-shadow-[0_0_2px_rgba(251,191,36,0.5)]" : "text-gray-300 dark:text-gray-600"
            )}
          >
            <Star className={sizeClasses} fill={filled ? "currentColor" : "none"} />
          </button>
        );
      })}
    </div>
  );
}
