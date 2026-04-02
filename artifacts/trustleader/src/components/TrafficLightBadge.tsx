import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { TrafficLight } from "@workspace/api-client-react";

interface TrafficLightBadgeProps {
  status: TrafficLight;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function TrafficLightBadge({ 
  status, 
  className, 
  showLabel = true,
  size = "md" 
}: TrafficLightBadgeProps) {
  const config = {
    green: {
      bg: "bg-green-100 dark:bg-green-950",
      border: "border-green-200 dark:border-green-900",
      text: "text-green-800 dark:text-green-300",
      dot: "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]",
      label: "Insurance-backed: eligible protections may apply",
    },
    orange: {
      bg: "bg-amber-100 dark:bg-amber-950",
      border: "border-amber-200 dark:border-amber-900",
      text: "text-amber-900 dark:text-amber-200",
      dot: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.75)]",
      label: "No insurer seal: proceed with caution",
    },
    red: {
      bg: "bg-red-100 dark:bg-red-950",
      border: "border-red-200 dark:border-red-900",
      text: "text-red-800 dark:text-red-300",
      dot: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]",
      label: "We do not recommend (below 2★ average)",
    },
  }[status];

  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1.5",
    md: "px-3 py-1.5 text-sm gap-2",
    lg: "px-4 py-2 text-base gap-3"
  }[size];

  const dotSize = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-3 h-3"
  }[size];

  return (
    <div 
      className={twMerge(
        "inline-flex items-center rounded-full border font-medium transition-all",
        config.bg, config.border, config.text, sizeClasses,
        className
      )}
    >
      <div className={twMerge("rounded-full animate-pulse", config.dot, dotSize)} />
      {showLabel && <span>{config.label}</span>}
    </div>
  );
}
