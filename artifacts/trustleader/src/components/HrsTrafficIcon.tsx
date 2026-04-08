import type { TrafficLight } from "@workspace/api-client-react";
import { twMerge } from "tailwind-merge";

const srcByStatus: Record<TrafficLight, string> = {
  green: "hrs-green.svg",
  orange: "hrs-orange.svg",
  red: "hrs-red.svg",
};

const glowByStatus: Record<TrafficLight, string> = {
  green: "hrs-neon-glow-green",
  orange: "hrs-neon-glow-orange",
  red: "hrs-neon-glow-red",
};

const sizeToClass = {
  sm: "h-6 w-[3.25rem]",
  md: "h-7 w-[4.5rem]",
  lg: "h-9 w-[5.75rem]",
} as const;

export function HrsTrafficIcon({
  status,
  size = "md",
  className,
}: {
  status: TrafficLight;
  size?: keyof typeof sizeToClass;
  className?: string;
}) {
  const src = `${import.meta.env.BASE_URL}${srcByStatus[status]}`;

  return (
    <img
      src={src}
      alt=""
      width={112}
      height={48}
      className={twMerge(
        "object-contain object-left select-none pointer-events-none",
        glowByStatus[status],
        sizeToClass[size],
        className,
      )}
      draggable={false}
    />
  );
}
