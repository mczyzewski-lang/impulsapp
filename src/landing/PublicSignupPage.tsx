import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ArrowRight, Check, Lock, X, Zap } from "lucide-react";
import { SOCIAL_PROOF_MIN, channelBySlug, type Creator, type SignupPage } from "@/data/mock";
import { useSignupPage } from "@/state/signupPage";
import { Avatar } from "@/components/ui/Avatar";
import { Button, buttonClass } from "@/components/ui/Button";

/** Treść strony zapisu — współdzielona przez stronę publiczną i podgląd w panelu twórcy. */
export function SignupCard({ creator, page, onSubmit }: { creator: Creator; page: SignupPage; onSubmit?: (email: string) => void }) {
  const [email, setEmail] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    onSubmit?.(email);
  }

  return (
    <div className="text-center">
      <Avatar name={creator.name} size="xl" className="ring-4 ring-white/10" />
      <p className="mt-4 text-sm text-ink-300">
        <span className="font-semibold text-white">{creator.name}</span> · {creator.role}
      </p>
      <h1 className="mx-auto mt-4 max-w-lg text-3xl leading-[1.1] font-extrabold text-balance sm:text-[2.6rem]">{page.headline}</h1>
      <p className="mx-auto mt-4 max-w-md text-[17px] text-ink-300">{page.lead}</p>

      <ul className="mx-auto mt-7 max-w-sm space-y-2.5 text-left">
        {page.bullets.filter(Boolean).map((b) => (
          <li key={b} className="flex gap-3 text-[15px]">
            <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-volt-400 text-ink-950">
              <Check className="size-3.5" strokeWidth={3} />
            </span>
            {b}
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="mx-auto mt-8 max-w-sm space-y-3">
        <label className="block">
          <span className="sr-only">Twój email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="Twój email"
            className="h-13 w-full rounded-2xl border border-white/15 bg-white/10 px-4 text-base text-white outline-none placeholder:text-ink-400 focus:border-volt-400"
          />
        </label>
        <Button type="submit" size="lg" className="w-full">
          {page.buttonLabel || "Zapisz się"}
          <ArrowRight className="size-5" />
        </Button>
        <p className="text-xs text-ink-400">Zapisujesz się na maile od {creator.firstNameGen}. Wypiszesz się jednym kliknięciem.</p>
      </form>
    </div>
  );
}

/** Przejście „jak w quizie”: bieżący ekran wyjeżdża w lewo, kolejny wjeżdża z prawej. */
export const slide = {
  initial: { x: 80, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -80, opacity: 0 },
  transition: { duration: 0.28, ease: "easeOut" },
} as const;

const stages = ["Zapis", "Rozszerzenie", "Kanał"];

/**
 * Publiczna strona zapisu twórcy (/s/:slug).
 * Krok 1: zapis na maile → krok 2: bezpłatne rozszerzenie o kanał → krok 3: zaproszenie do kanału.
 */
export default function PublicSignupPage() {
  const { slug } = useParams();
  const channel = channelBySlug(slug);
  const { creator } = channel;
  const [page] = useSignupPage(channel);
  const [email, setEmail] = useState<string | null>(null);
  const step = email === null ? 0 : 1;

  const access = [
    { label: "Newsletter: impulsy e-mailem", included: true },
    { label: "Wideo", included: false },
    { label: "Narzędzia i checklisty", included: false },
    { label: "Pliki bonusowe", included: false },
    { label: `Czat z ${creator.firstNameIns}`, included: false },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-dvh overflow-hidden bg-ink-900 text-white">
        <div className="bg-grid absolute inset-0" />
        <div className="absolute -top-32 left-1/2 h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-violet-600/30 blur-[110px]" />

        <div className="pt-safe pb-safe relative mx-auto flex min-h-dvh max-w-2xl flex-col px-5">
          <header className="py-5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-ink-300">
                <Lock className="size-3" /> {creator.channelName}
              </span>
              <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-400 hover:text-white">
                <Zap className="size-3.5 text-volt-400" fill="currentColor" strokeWidth={0} /> Strona w Impulsie
              </Link>
            </div>

            {/* Pasek etapów — widać, że to droga do przodu, a nie koniec */}
            <ol className="mx-auto mt-6 flex max-w-sm gap-2" aria-label={`Krok ${step + 1} z ${stages.length}`}>
              {stages.map((label, i) => (
                <li key={label} className="flex-1">
                  <span className="block h-1.5 overflow-hidden rounded-full bg-white/15">
                    <motion.span className="block h-full rounded-full bg-volt-400" initial={false} animate={{ width: i <= step ? "100%" : "0%" }} transition={{ duration: 0.35 }} />
                  </span>
                  <span className={`mt-1.5 block text-center text-[11px] font-semibold ${i <= step ? "text-white" : "text-ink-400"}`}>{label}</span>
                </li>
              ))}
            </ol>
          </header>

          <main className="flex flex-1 flex-col justify-center py-6">
            <AnimatePresence mode="wait" initial={false}>
              {email === null ? (
                <motion.div key="signup" {...slide}>
                  <SignupCard creator={creator} page={page} onSubmit={setEmail} />
                </motion.div>
              ) : (
                <motion.div key="upgrade" {...slide} className="text-center">
                  <p className="mx-auto inline-flex max-w-full items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-sm">
                    <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-volt-400 text-ink-950">
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                    <span className="truncate">
                      Zapisano. Link wysłaliśmy na <span className="font-semibold">{email}</span>
                    </span>
                  </p>
                  <h1 className="mx-auto mt-5 max-w-md text-3xl leading-[1.1] font-extrabold text-balance sm:text-[2.6rem]">
                    Maile już masz. Odbierz resztę.
                  </h1>
                  <p className="mx-auto mt-3 max-w-sm text-ink-300">
                    W kanale {creator.firstNameGen} czeka wszystko, czego nie da się zmieścić w mailu.
                  </p>

                  <div className="mx-auto mt-7 max-w-sm rounded-3xl bg-white p-4 text-left text-ink-900 shadow-2xl">
                    <ul className="divide-y divide-line rounded-2xl border border-line text-[15px]">
                      {access.map(({ label, included }) => (
                        <li key={label} className="flex items-center gap-3 px-3.5 py-2.5">
                          <span
                            className={
                              included
                                ? "inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-volt-400 text-ink-950"
                                : "inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-ink-900/8 text-ink-400"
                            }
                          >
                            {included ? <Check className="size-3.5" strokeWidth={3} /> : <X className="size-3.5" strokeWidth={3} />}
                          </span>
                          <span className={included ? "font-semibold" : "text-ink-500"}>{label}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to={`/k/${creator.slug}`} className={buttonClass("primary", "lg", "mt-4 w-full")}>
                      Rozszerz bezpłatnie o impulsy <ArrowRight className="size-5" />
                    </Link>
                    {creator.members > SOCIAL_PROOF_MIN && (
                      <p className="mt-3 text-center text-sm text-ink-500">
                        Dołącz do <span className="font-semibold text-ink-900">{creator.members} osób</span> w kanale
                      </p>
                    )}
                  </div>
                  <p className="mx-auto mt-5 max-w-xs text-xs text-ink-400">Wolisz później? Ten sam link znajdziesz w mailu.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </MotionConfig>
  );
}
