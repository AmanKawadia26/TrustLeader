import { twMerge } from "tailwind-merge";
import type { TrafficLight } from "@workspace/api-client-react";
import { HrsTrafficIcon } from "@/components/HrsTrafficIcon";

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
  size = "md",
}: TrafficLightBadgeProps) {
  const config = {
    green: {
      bg: "bg-emerald-50 dark:bg-emerald-950/80",
      border: "border-emerald-200/90 dark:border-emerald-800",
      text: "text-emerald-900 dark:text-emerald-200",
      dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.75)]",
      label: "Insurance-backed: eligible protections may apply",
    },
    orange: {
      bg: "bg-amber-50 dark:bg-amber-950/80",
      border: "border-amber-200 dark:border-amber-800",
      text: "text-amber-950 dark:text-amber-100",
      dot: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.75)]",
      label: "No insurer seal: proceed with caution",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-950/80",
      border: "border-red-200 dark:border-red-900",
      text: "text-red-900 dark:text-red-200",
      dot: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]",
      label: "We do not recommend (below 2★ average)",
    },
  }[status];

  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1.5",
    md: "px-3 py-1.5 text-sm gap-2",
    lg: "px-4 py-2 text-base gap-3",
  }[size];

  const dotSize = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-3 h-3",
  }[size];

  const iconSize = {
    sm: "sm" as const,
    md: "md" as const,
    lg: "lg" as const,
  }[size];

  const ariaLabel = `Protector signal: ${status} — ${config.label}`;

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={twMerge(
        "inline-flex items-center rounded-full border font-medium transition-all",
        config.bg,
        config.border,
        config.text,
        sizeClasses,
        className
      )}
    >
      <HrsTrafficIcon status={status} size={iconSize} className="shrink-0" />
      <div className={twMerge("rounded-full animate-pulse", config.dot, dotSize)} aria-hidden />
      {showLabel && <span>{config.label}</span>}
    </div>
  );
}
