import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckSquare, Gift, Lock, MessageCircle, Play, ShieldCheck, Zap } from "lucide-react";
import { creator } from "@/data/mock";
import { useProgress } from "@/state/progress";
import { Avatar } from "@/components/ui/Avatar";
import { buttonClass } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { PhoneFrame } from "./RecipientLayout";

const perks = [
  { icon: Play, title: "Wideo powitalne", body: "2 minuty o tym, jak korzystać z kanału." },
  { icon: Gift, title: "Prywatny materiał", body: "Mapa rozmowy sprzedażowej — tylko dla osób z kanału." },
  { icon: CheckSquare, title: "Checklista do wdrożenia", body: "Rozmowa sprzedażowa w 7 krokach." },
  { icon: Zap, title: "Nowe impulsy do działania", body: creator.cadence + ". Krótko i konkretnie." },
  { icon: MessageCircle, title: "Możliwość odblokowania czatu", body: "Oglądaj i wdrażaj, a napiszesz bezpośrednio do Marty." },
];

/** Ekran, na który trafia odbiorca po kliknięciu linku od twórcy. */
export default function CreatorInvitePage() {
  const { joined } = useProgress();

  return (
    <PhoneFrame className="bg-ink-900 text-white">
      <div className="bg-grid absolute inset-0" />
      <div className="absolute -top-24 left-1/2 size-80 -translate-x-1/2 rounded-full bg-violet-600/40 blur-[90px]" />

      <div className="pt-safe relative flex flex-1 flex-col px-5 pb-6">
        <div className="flex items-center justify-between py-4">
          <Link to="/" aria-label="Impuls">
            <Logo className="text-lg" />
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-ink-300">
            <Lock className="size-3" /> Prywatne zaproszenie
          </span>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-center">
          <Avatar name={creator.name} size="xl" className="ring-4 ring-white/10" />
          <p className="mt-4 text-sm text-ink-300">
            <span className="font-semibold text-white">{creator.name}</span> zaprasza Cię do kanału
          </p>
          <h1 className="mt-1 text-[2rem] leading-tight font-extrabold">{creator.channelName}</h1>
          <p className="mx-auto mt-3 max-w-xs text-[15px] text-ink-300">{creator.promise}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-7 rounded-3xl border border-white/10 bg-white/5 p-2 backdrop-blur"
        >
          <p className="px-3 pt-3 pb-1 text-xs font-semibold tracking-wide text-volt-400 uppercase">Co dostajesz</p>
          <ul>
            {perks.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex items-start gap-3 px-3 py-2.5">
                <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-volt-400">
                  <Icon className="size-4.5" />
                </span>
                <div>
                  <p className="text-[15px] font-semibold">{title}</p>
                  <p className="text-sm text-ink-300">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>

        <div className="mt-auto pt-6">
          <Link to={joined ? "/app" : "/app/start"} className={buttonClass("primary", "lg", "w-full")}>
            {joined ? "Wróć do kanału" : "Odbierz materiał i dołącz do kanału"}
            <ArrowRight className="size-5" />
          </Link>
          <p className="pb-safe mt-4 flex items-center justify-center gap-2 text-xs text-ink-400">
            <ShieldCheck className="size-4" />
            Bez feedu i reklam. Widzisz tylko kanały, do których Cię zaproszono.
          </p>
        </div>
      </div>
    </PhoneFrame>
  );
}
