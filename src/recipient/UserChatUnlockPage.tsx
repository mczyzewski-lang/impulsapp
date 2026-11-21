import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Lock, Send } from "lucide-react";
import { useProgress } from "@/state/progress";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";

/** Ekran odblokowania czatu — widoczny, dopóki warunki nie są spełnione. */
export default function UserChatUnlockPage() {
  const { channel, steps, stepsDone, answer, submitAnswer } = useProgress();
  const { creator, weeklyQuestion } = channel;
  const [draft, setDraft] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (draft.trim()) submitAnswer(draft.trim());
  }

  return (
    // Jeden kontener: nagłówek z postępem, a pod nim kroki jako wiersze tej samej karty.
    <div className="overflow-hidden rounded-3xl border border-line bg-white">
      <div className="p-5">
        <div className="flex items-center gap-4">
          <span className="relative">
            <Avatar name={creator.name} size="lg" />
            <span className="absolute -right-1 -bottom-1 inline-flex size-6 items-center justify-center rounded-full bg-volt-400 text-ink-950 ring-2 ring-white">
              <Lock className="size-3.5" strokeWidth={2.5} />
            </span>
          </span>
          <div>
            <h1 className="text-xl leading-tight font-bold">Odblokuj czat z {creator.firstNameIns}</h1>
            <p className="text-sm text-ink-500">{stepsDone}/{steps.length} kroków wykonane</p>
          </div>
        </div>
        <ProgressBar value={stepsDone} max={steps.length} className="mt-5 h-2.5" label="Postęp odblokowania czatu" />
        <p className="mt-4 text-sm text-ink-500">
          {creator.firstName} odpowiada osobom, które korzystają z materiałów. Wykonaj trzy kroki, a wyślesz swoją wiadomość.
        </p>
      </div>

      <ol className="divide-y divide-line border-t border-line">
        {steps.map((step, i) => (
          <li key={step.id} className="px-5 py-4">
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
              <Link to={step.to} className="mt-2 ml-11 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700">
                {step.id === "videos" ? "Przejdź do wideo" : "Przejdź do narzędzi"} <ArrowRight className="size-4" />
              </Link>
            )}

            {step.id === "answers" && !answer && (
              <form onSubmit={onSubmit} className="mt-3 rounded-xl bg-paper p-3">
                <p className="text-xs font-semibold text-violet-700">Pytanie od {creator.firstNameGen}</p>
                <p className="mt-1 font-display text-base leading-snug font-bold">{weeklyQuestion.text}</p>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={3}
                  aria-label="Twoja odpowiedź"
                  placeholder="Napisz jednym, dwoma zdaniami…"
                  className="mt-3 w-full resize-none rounded-xl border border-line bg-white p-3 text-base outline-none focus:border-ink-900"
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
