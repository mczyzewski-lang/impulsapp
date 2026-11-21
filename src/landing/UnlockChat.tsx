import { useState } from "react";
import { Check, Lock, LockOpen } from "lucide-react";
import { cn } from "@/lib/cn";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Reveal, SectionHeading } from "./Reveal";

const conditions = ["Obejrzyj 3 materiały wideo", "Pobierz 1 narzędzie", "Odpowiedz na 1 pytanie od twórcy"];

/** Interaktywne demo mechaniki — kliknięcie kroku go odhacza. */
export function UnlockChat() {
  const [done, setDone] = useState<boolean[]>([true, false, false]);
  const count = done.filter(Boolean).length;
  const unlocked = count === conditions.length;

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Odblokuj czat przez aktywność"
            title="Dostęp do twórcy dostają ci, którzy działają."
            lead="Czat nie jest otwarty dla wszystkich od pierwszej minuty. Odblokowuje się, gdy odbiorca obejrzy, pobierze i odpowie. Dzięki temu rozmawiasz z ludźmi, którzy znają Twoje materiały."
          />
          <Reveal delay={0.1}>
            <ul className="mt-8 space-y-3 text-ink-600">
              {[
                "Twórca zadaje pytanie, odbiorcy odpowiadają.",
                "Po odblokowaniu odbiorca może wysłać jedną wiadomość.",
                "Najlepsze pytania wracają do kanału jako odpowiedź dla wszystkich.",
                "Warunki odblokowania ustawiasz sam.",
              ].map((line) => (
                <li key={line} className="flex gap-3">
                  <Check className="mt-0.5 size-5 shrink-0 text-violet-600" />
                  {line}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="mx-auto max-w-md rounded-[2rem] bg-ink-900 p-6 text-white shadow-2xl shadow-ink-900/30 sm:p-8">
            <div className="flex items-center gap-4">
              <span className={cn("inline-flex size-14 items-center justify-center rounded-2xl transition", unlocked ? "bg-volt-400 text-ink-950" : "bg-white/10 text-volt-400")}>
                {unlocked ? <LockOpen className="size-6" /> : <Lock className="size-6" />}
              </span>
              <div className="flex-1">
                <p className="font-display text-lg leading-tight font-bold">
                  {unlocked ? "Czat odblokowany" : "Odblokuj czat z twórcą"}
                </p>
                <p className="text-sm text-ink-300">{count}/3 kroków wykonane</p>
              </div>
            </div>
            <ProgressBar value={count} max={3} className="mt-5 h-2.5 bg-white/15" label="Postęp odblokowania czatu" />
            <ul className="mt-6 space-y-2.5">
              {conditions.map((label, i) => (
                <li key={label}>
                  <button
                    type="button"
                    aria-pressed={done[i]}
                    onClick={() => setDone((d) => d.map((v, idx) => (idx === i ? !v : v)))}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-[15px] font-medium transition",
                      done[i] ? "border-volt-400/40 bg-volt-400/10" : "border-white/10 bg-white/5 hover:bg-white/10",
                    )}
                  >
                    <span className={cn("inline-flex size-6 shrink-0 items-center justify-center rounded-full border transition", done[i] ? "border-volt-400 bg-volt-400 text-ink-950" : "border-white/30")}>
                      {done[i] && <Check className="size-4" strokeWidth={3} />}
                    </span>
                    {label}
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-center text-xs text-ink-400">Kliknij kroki, żeby zobaczyć, jak działa odblokowanie.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
