import { Play } from "lucide-react";
import { cn } from "@/lib/cn";

interface VideoPosterProps {
  poster: string;
  duration?: string;
  className?: string;
  playSize?: "sm" | "lg";
  watched?: boolean;
}

/** Zastępnik miniatury wideo (mock — bez prawdziwych plików). */
export function VideoPoster({ poster, duration, className, playSize = "sm", watched }: VideoPosterProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-linear-to-br", poster, className)}>
      <div className="bg-grid absolute inset-0 opacity-60" />
      <div className="absolute -top-8 -right-8 size-28 rounded-full bg-white/15 blur-2xl" />
      <span
        className={cn(
          "absolute top-1/2 left-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-ink-900 shadow-lg",
          playSize === "lg" ? "size-16" : "size-9",
        )}
      >
        <Play className={playSize === "lg" ? "size-6" : "size-3.5"} fill="currentColor" />
      </span>
      {duration && (
        <span className="absolute right-2 bottom-2 rounded-md bg-ink-950/70 px-1.5 py-0.5 text-[11px] font-semibold text-white">
          {duration}
        </span>
      )}
      {watched && (
        <span className="absolute top-2 left-2 rounded-md bg-volt-400 px-1.5 py-0.5 text-[11px] font-bold text-ink-950">
          Obejrzane
        </span>
      )}
    </div>
  );
}
