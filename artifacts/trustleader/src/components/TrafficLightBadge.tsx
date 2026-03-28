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
      label: "Strong Trust Signal"
    },
    orange: {
      bg: "bg-orange-100 dark:bg-orange-950",
      border: "border-orange-200 dark:border-orange-900",
      text: "text-orange-800 dark:text-orange-300",
      dot: "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]",
      label: "Caution"
    },
    red: {
      bg: "bg-red-100 dark:bg-red-950",
      border: "border-red-200 dark:border-red-900",
      text: "text-red-800 dark:text-red-300",
      dot: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]",
      label: "High Risk"
    }
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
