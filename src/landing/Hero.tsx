import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Gift, Mail, Sparkles, TrendingUp } from "lucide-react";
import { creator } from "@/data/mock";
import { buttonClass } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { PhoneMock } from "./PhoneMock";

export function LandingNav() {
  return (
    <header className="pt-safe absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link to="/" aria-label="Impuls — strona główna">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-300 md:flex">
          <a href="#jak-to-dziala" className="hover:text-white">Jak to działa</a>
          <a href="#dla-tworcow" className="hover:text-white">Dla twórców</a>
          <a href="#dla-odbiorcow" className="hover:text-white">Dla odbiorców</a>
          <a href="#faq" className="hover:text-white">FAQ</a>
        </nav>
        <Link to="/studio" className={buttonClass("glass", "sm")}>
          Stwórz kanał
        </Link>
      </div>
    </header>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink-900 text-white">
      <div className="bg-grid absolute inset-0" />
      <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-violet-600/25 blur-[120px]" />
      <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-volt-400/10 blur-[100px]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pt-32 pb-20 lg:grid-cols-[1.1fr_0.9fr] lg:pt-40 lg:pb-28">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-ink-300">
            <Sparkles className="size-4 text-volt-400" />
            Nie kolejny newsletter. Prywatny kanał aktywacji.
          </p>
          <h1 className="mt-6 text-[2.6rem] leading-[1.02] font-extrabold text-balance sm:text-6xl lg:text-[4.2rem]">
            Zamień swoją listę emailową w&nbsp;<span className="text-volt-400">kanał ambasadorów.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-pretty text-ink-300">
            Impuls to prywatny kanał dla Twoich najbardziej zaangażowanych odbiorców. Wideo, narzędzia, pliki
            i kontrolowana interakcja w jednym miejscu — zamiast kolejnego maila, który zginie w skrzynce.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/studio" className={buttonClass("primary", "lg")}>
              Stwórz kanał w Impulsie
              <ArrowRight className="size-5" />
            </Link>
            <Link to={`/k/${creator.slug}`} className={buttonClass("glass", "lg")}>
              <Gift className="size-5" />
              Odbierz prywatny materiał
            </Link>
          </div>
          <p className="mt-4 text-sm text-ink-400">
            Masz link od twórcy? Otwórz go — trafisz prosto do jego kanału. Tu zobaczysz przykładowy.
          </p>
        </motion.div>

        <motion.div
          className="relative mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <PhoneMock />
          <motion.div
            className="absolute top-28 -left-32 hidden w-56 rounded-2xl border border-white/10 bg-ink-800/90 p-3.5 shadow-xl backdrop-blur sm:block"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <p className="flex items-center gap-2 text-xs font-semibold text-ink-300">
              <Mail className="size-3.5" /> Z maila do kanału
            </p>
            <p className="mt-1.5 text-sm font-semibold text-white">„Odbierz moje prywatne wideo i checklistę w Impulsie”</p>
          </motion.div>
          <motion.div
            className="absolute -right-24 bottom-28 hidden w-52 rounded-2xl bg-volt-400 p-3.5 text-ink-950 shadow-xl sm:block"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <p className="flex items-center gap-2 text-xs font-bold">
              <TrendingUp className="size-3.5" /> Awans z listy emailowej
            </p>
            <p className="mt-1 text-sm font-semibold">Kasia odblokowała czat i została ambasadorką</p>
          </motion.div>
        </motion.div>
      </div>

      <div className="relative border-t border-white/10">
        <p className="mx-auto max-w-6xl px-5 py-6 text-center font-display text-xl font-bold sm:text-2xl">
          Email informuje. <span className="text-volt-400">Impuls aktywuje.</span>
        </p>
      </div>
    </section>
  );
}
