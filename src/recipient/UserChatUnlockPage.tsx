import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Lock, Send } from "lucide-react";
import { creator, weeklyQuestion } from "@/data/mock";
import { useProgress } from "@/state/progress";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";

/** Ekran odblokowania czatu — widoczny, dopóki warunki nie są spełnione. */
export default function UserChatUnlockPage() {
  const { steps, stepsDone, answer, submitAnswer } = useProgress();
  const [draft, setDraft] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (draft.trim()) submitAnswer(draft.trim());
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-ink-900 p-5 text-white">
        <div className="flex items-center gap-4">
          <span className="relative">
            <Avatar name={creator.name} size="lg" />
            <span className="absolute -right-1 -bottom-1 inline-flex size-6 items-center justify-center rounded-full bg-volt-400 text-ink-950 ring-2 ring-ink-900">
              <Lock className="size-3.5" strokeWidth={2.5} />
            </span>
          </span>
          <div>
            <h1 className="text-xl leading-tight font-bold">Odblokuj czat z twórcą</h1>
            <p className="text-sm text-ink-300">{stepsDone}/{steps.length} kroków wykonane</p>
          </div>
        </div>
        <ProgressBar value={stepsDone} max={steps.length} className="mt-5 h-2.5 bg-white/15" label="Postęp odblokowania czatu" />
        <p className="mt-4 text-sm text-ink-300">
          Marta odpowiada osobom, które korzystają z materiałów. Wykonaj trzy kroki, a napiszesz do niej bezpośrednio.
        </p>
      </div>

      <ol className="space-y-2.5">
        {steps.map((step, i) => (
          <li key={step.id} className={cn("rounded-2xl border bg-white p-4", step.done ? "border-volt-500/50" : "border-line")}>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "inline-flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  step.done ? "bg-volt-400 text-ink-950" : "bg-ink-900/5 text-ink-600",
                )}
              >
                {step.done ? <Check className="size-4.5" strokeWidth={3} /> : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn("text-[15px] font-semibold", step.done && "text-ink-400 line-through")}>{step.label}</p>
                <p className="text-xs text-ink-400">{step.done ? "Zrobione" : step.hint}</p>
              </div>
              <span className="text-sm font-semibold text-ink-500 tabular-nums">
                {step.current}/{step.target}
              </span>
            </div>

            {!step.done && step.id !== "answers" && (
              <Link to={step.to} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700">
                {step.id === "videos" ? "Przejdź do wideo" : "Przejdź do narzędzi"} <ArrowRight className="size-4" />
              </Link>
            )}

            {step.id === "answers" && !answer && (
              <form onSubmit={onSubmit} className="mt-3 rounded-xl bg-paper p-3">
                <p className="text-xs font-semibold text-violet-700">Pytanie od Marty</p>
                <p className="mt-1 font-display text-base leading-snug font-bold">{weeklyQuestion.text}</p>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={3}
                  aria-label="Twoja odpowiedź"
                  placeholder="Napisz jednym, dwoma zdaniami…"
                  className="mt-3 w-full resize-none rounded-xl border border-line bg-white p-3 text-[15px] outline-none focus:border-ink-900"
                />
                <p className="mt-1.5 text-xs text-ink-400">{weeklyQuestion.context}</p>
                <Button type="submit" variant="dark" className="mt-3 w-full" disabled={!draft.trim()}>
                  <Send className="size-4" /> Wyślij odpowiedź
                </Button>
              </form>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
