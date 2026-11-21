import { Zap } from "lucide-react";
import { cn } from "@/lib/cn";

export function Logo({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-display text-xl font-bold tracking-tight", tone === "light" ? "text-white" : "text-ink-900", className)}>
      <span className="inline-flex size-8 items-center justify-center rounded-[10px] bg-volt-400 text-ink-950">
        <Zap className="size-4.5" fill="currentColor" strokeWidth={0} />
      </span>
      Impuls
    </span>
  );
}
