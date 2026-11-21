import { useEffect, useState, type FormEvent } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Mail } from "lucide-react";
import { channelBySlug } from "@/data/mock";
import { useProgress } from "@/state/progress";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { UnlockProgress } from "@/components/UnlockProgress";
import { PhoneFrame, ScreenScroll } from "./RecipientLayout";
import { VideoPlayer } from "./VideoPlayer";

/**
 * Onboarding do kanału: konto → wideo powitalne → zasady odblokowania czatu.
 * Osoba, która ma już konto (dołącza do kolejnego kanału), pomija pierwszy krok.
 */
export default function OnboardingPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { joined, joinedSlugs, name: savedName, join, markWatched, watched } = useProgress();

  const { creator, videos } = channelBySlug(params.get("k") ?? undefined);
  const welcome = videos[0];

  const [wasInChannel] = useState(joinedSlugs.includes(creator.slug));
  const [hadAccount] = useState(joined);
  const [step, setStep] = useState(hadAccount ? 1 : 0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Istniejące konto: dołączenie do kanału nie wymaga ponownej rejestracji.
  useEffect(() => {
    if (hadAccount && !wasInChannel) join(creator.slug);
  }, [hadAccount, wasInChannel, join, creator.slug]);

  if (wasInChannel) return <Navigate to="/app" replace />;

  function createAccount(e: FormEvent) {
    e.preventDefault();
    join(creator.slug, name.trim() || "Gość");
    setStep(1);
  }

  const displayName = savedName || name;
  const steps = hadAccount ? [1, 2] : [0, 1, 2];

  return (
    <PhoneFrame className="bg-white">
      <div className="pt-safe flex shrink-0 items-center gap-2 px-5 pt-5 pb-1" aria-label={`Krok ${steps.indexOf(step) + 1} z ${steps.length}`}>
        {steps.map((i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-ink-900" : "bg-ink-900/10"}`} />
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex min-h-0 flex-1 flex-col">
          {step === 0 && (
            <form onSubmit={createAccount} className="flex min-h-0 flex-1 flex-col">
              <ScreenScroll className="px-5 pt-4 pb-4">
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
                    placeholder="ten sam, na który przyszło zaproszenie"
                    className="mt-1.5 h-12 w-full rounded-xl border border-line bg-white px-4 text-base font-normal outline-none focus:border-ink-900"
                  />
                </label>
              </ScreenScroll>
              <Footer>
                <Button type="submit" variant="dark" size="lg" className="w-full">
                  <Mail className="size-5" />
                  Załóż konto i wejdź do kanału
                </Button>
                <p className="mt-3 text-center text-xs text-ink-400">Masz już konto? Wpisz swój email — zalogujemy Cię linkiem.</p>
              </Footer>
            </form>
          )}

          {step === 1 && (
            <>
              <ScreenScroll className="px-5 pt-4 pb-4">
                <p className="text-sm font-semibold text-violet-600">Witaj w kanale{displayName ? `, ${displayName}` : ""}</p>
                <h1 className="mt-1 text-[1.75rem] leading-tight font-bold">Zacznij od krótkiego wideo od {creator.firstNameGen}</h1>
                <p className="mt-2 text-ink-500">{welcome.description}</p>
                <VideoPlayer video={welcome} className="mt-5 aspect-square" onComplete={() => markWatched(welcome.id)} />
                <ul className="mt-5 space-y-2.5">
                  {welcome.takeaways.map((t) => (
                    <li key={t} className="flex gap-2.5 text-[15px] text-ink-600">
                      <Check className="mt-0.5 size-4.5 shrink-0 text-violet-600" />
                      {t}
                    </li>
                  ))}
                </ul>
              </ScreenScroll>
              <Footer>
                <Button variant="dark" size="lg" className="w-full" onClick={() => setStep(2)}>
                  {watched.includes(welcome.id) ? "Dalej" : "Obejrzę później"}
                  <ArrowRight className="size-5" />
                </Button>
              </Footer>
            </>
          )}

          {step === 2 && (
            <>
              <ScreenScroll className="px-5 pt-4 pb-4">
                <p className="text-sm font-semibold text-violet-600">Jeszcze jedno</p>
                <h1 className="mt-1 text-[1.75rem] leading-tight font-bold">Czat z {creator.firstNameIns} odblokujesz aktywnością</h1>
                <p className="mt-2 text-ink-500">
                  Nie musisz nic kupować. Wystarczy, że obejrzysz, pobierzesz i odpowiesz. Dzięki temu {creator.firstName} rozmawia
                  z ludźmi, którzy naprawdę korzystają z materiałów.
                </p>
                <div className="pointer-events-none mt-6">
                  <UnlockProgress />
                </div>
              </ScreenScroll>
              <Footer>
                <Button size="lg" className="w-full" onClick={() => navigate("/app")}>
                  Przejdź do kanału
                  <ArrowRight className="size-5" />
                </Button>
              </Footer>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </PhoneFrame>
  );
}

/** Główny przycisk kroku — zawsze w tym samym miejscu na dole ekranu. */
function Footer({ children }: { children: React.ReactNode }) {
  return <div className="pb-safe-4 shrink-0 border-t border-line bg-white px-5 pt-4">{children}</div>;
}
