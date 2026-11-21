import { Zap } from "lucide-react";
import { platforms, type Destination } from "@/state/publishing";
import { cn } from "@/lib/cn";

/** Znacznik miejsca publikacji: kanał Impulsu albo platforma social. */
export function PlatformChip({ id, size = "md" }: { id: Destination; size?: "sm" | "md" }) {
  const box = size === "sm" ? "size-6 rounded-md text-[9px]" : "size-10 rounded-xl text-xs";
  if (id === "impuls") {
    return (
      <span className={cn("inline-flex shrink-0 items-center justify-center bg-volt-400 text-ink-950", box)} title="Kanał w Impulsie">
        <Zap className={size === "sm" ? "size-3" : "size-4.5"} fill="currentColor" strokeWidth={0} />
      </span>
    );
  }
  const platform = platforms.find((p) => p.id === id)!;
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center font-bold text-white", box)} style={{ background: platform.color }} title={platform.name}>
      {platform.short}
    </span>
  );
}
