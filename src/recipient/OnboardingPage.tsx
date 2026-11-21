import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Mail } from "lucide-react";
import { creator, videos } from "@/data/mock";
import { useProgress } from "@/state/progress";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { UnlockProgress } from "@/components/UnlockProgress";
import { PhoneFrame } from "./RecipientLayout";
import { VideoPlayer } from "./VideoPlayer";

const welcome = videos[0];

/** Onboarding: konto → wideo powitalne → zasady odblokowania czatu. */
export default function OnboardingPage() {
  const navigate = useNavigate();
  const { joined, join, markWatched, watched } = useProgress();
  const [wasJoined] = useState(joined);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  if (wasJoined) return <Navigate to="/app" replace />;

  function createAccount(e: FormEvent) {
    e.preventDefault();
    join(name.trim() || "Gość");
    setStep(1);
  }

  return (
    <PhoneFrame className="bg-white">
      <div className="pt-safe flex flex-1 flex-col px-5 pb-6">
        <div className="flex items-center gap-2 py-5" aria-label={`Krok ${step + 1} z 3`}>
          {[0, 1, 2].map((i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-ink-900" : "bg-ink-900/10"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="flex flex-1 flex-col"
          >
            {step === 0 && (
              <form onSubmit={createAccount} className="flex flex-1 flex-col">
                <div className="flex items-center gap-3 rounded-2xl bg-paper p-3">
                  <Avatar name={creator.name} />
                  <p className="text-sm text-ink-600">
                    Dołączasz do kanału <span className="font-semibold text-ink-900">{creator.channelName}</span>
                  </p>
                </div>
                <h1 className="mt-6 text-[1.75rem] leading-tight font-bold">Załóż konto, żeby odebrać materiał</h1>
                <p className="mt-2 text-ink-500">Zajmie to pół minuty. Materiał czeka w kanale.</p>

                <label className="mt-6 block text-sm font-semibold">
                  Imię
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="given-name"
                    placeholder="np. Kasia"
                    className="mt-1.5 h-12 w-full rounded-xl border border-line bg-white px-4 text-base font-normal outline-none focus:border-ink-900"
                  />
                </label>
                <label className="mt-4 block text-sm font-semibold">
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="ten sam, na który dostajesz maile od Marty"
                    className="mt-1.5 h-12 w-full rounded-xl border border-line bg-white px-4 text-base font-normal outline-none focus:border-ink-900"
                  />
                </label>

                <div className="mt-auto pt-6">
                  <Button type="submit" variant="dark" size="lg" className="w-full">
                    <Mail className="size-5" />
                    Załóż konto i wejdź do kanału
                  </Button>
                  <p className="mt-3 text-center text-xs text-ink-400">
                    Masz już konto? Wpisz swój email — zalogujemy Cię linkiem.
                  </p>
                </div>
              </form>
            )}

            {step === 1 && (
              <div className="flex flex-1 flex-col">
                <p className="text-sm font-semibold text-violet-600">Witaj w kanale{name ? `, ${name}` : ""}</p>
                <h1 className="mt-1 text-[1.75rem] leading-tight font-bold">Zacznij od krótkiego wideo od Marty</h1>
                <p className="mt-2 text-ink-500">{welcome.description}</p>
                <VideoPlayer video={welcome} className="mt-5" onComplete={() => markWatched(welcome.id)} />
                <ul className="mt-5 space-y-2.5">
                  {welcome.takeaways.map((t) => (
                    <li key={t} className="flex gap-2.5 text-[15px] text-ink-600">
                      <Check className="mt-0.5 size-4.5 shrink-0 text-violet-600" />
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-6">
                  <Button variant="dark" size="lg" className="w-full" onClick={() => setStep(2)}>
                    {watched.includes(welcome.id) ? "Dalej" : "Obejrzę później"}
                    <ArrowRight className="size-5" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-1 flex-col">
                <p className="text-sm font-semibold text-violet-600">Jeszcze jedno</p>
                <h1 className="mt-1 text-[1.75rem] leading-tight font-bold">Czat z Martą odblokujesz aktywnością</h1>
                <p className="mt-2 text-ink-500">
                  Nie musisz nic kupować. Wystarczy, że obejrzysz, pobierzesz i odpowiesz. Dzięki temu Marta rozmawia
                  z ludźmi, którzy naprawdę korzystają z materiałów.
                </p>
                <div className="pointer-events-none mt-6">
                  <UnlockProgress />
                </div>
                <div className="mt-auto pt-6">
                  <Button size="lg" className="w-full" onClick={() => navigate("/app")}>
                    Przejdź do kanału
                    <ArrowRight className="size-5" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </PhoneFrame>
  );
}
