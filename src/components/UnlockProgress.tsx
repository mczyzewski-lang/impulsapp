import { Link } from "react-router-dom";
import { Check, ChevronRight, Lock, LockOpen } from "lucide-react";
import { useProgress } from "@/state/progress";
import { cn } from "@/lib/cn";
import { ProgressBar } from "./ui/ProgressBar";

/** Karta postępu odblokowania czatu — sedno mechaniki aktywacji. */
export function UnlockProgress({ compact = false }: { compact?: boolean }) {
  const { steps, stepsDone, chatUnlocked } = useProgress();

  return (
    <div className="overflow-hidden rounded-2xl bg-ink-900 text-white">
      <Link to="/app/czat" className="flex items-center gap-3 p-4">
        <span className={cn("inline-flex size-10 shrink-0 items-center justify-center rounded-xl", chatUnlocked ? "bg-volt-400 text-ink-950" : "bg-white/10 text-volt-400")}>
          {chatUnlocked ? <LockOpen className="size-5" /> : <Lock className="size-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {chatUnlocked ? "Czat z twórcą odblokowany" : `Odblokuj czat z twórcą: ${stepsDone}/${steps.length} kroków wykonane`}
          </p>
          <ProgressBar value={stepsDone} max={steps.length} className="mt-2 bg-white/15" label="Postęp odblokowania czatu" />
        </div>
        <ChevronRight className="size-5 shrink-0 text-ink-300" />
      </Link>
      {!compact && (
        <ul className="border-t border-white/10">
          {steps.map((step) => (
            <li key={step.id}>
              <Link to={step.to} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5">
                <span
                  className={cn(
                    "inline-flex size-5 shrink-0 items-center justify-center rounded-full border",
                    step.done ? "border-volt-400 bg-volt-400 text-ink-950" : "border-white/30",
                  )}
                >
                  {step.done && <Check className="size-3.5" strokeWidth={3} />}
                </span>
                <span className={cn("flex-1", step.done && "text-ink-300 line-through")}>{step.label}</span>
                <span className="text-xs font-semibold text-ink-300 tabular-nums">
                  {step.current}/{step.target}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
