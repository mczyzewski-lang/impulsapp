import { useEffect, useState, type FormEvent } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Zap } from "lucide-react";
import { SOCIAL_PROOF_MIN, channelBySlug, type Creator, type SignupPage } from "@/data/mock";
import { useSignupPage } from "@/state/signupPage";
import { cn } from "@/lib/cn";
import { slide } from "./PublicSignupPage";

export interface EmbedOptions {
  theme: "dark" | "light";
  showHeadline: boolean;
}

/**
 * Sam kontener zapisu — bez nagłówka strony, awatara i tła.
 * Używany w osadzeniu (iframe) na stronie twórcy i w podglądzie w panelu.
 */
export function EmbedForm({ creator, page, options, interactive = true }: { creator: Creator; page: SignupPage; options: EmbedOptions; interactive?: boolean }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const dark = options.theme === "dark";

  function submit(e: FormEvent) {
    e.preventDefault();
    if (interactive) setDone(true);
  }

  return (
    <div className={cn("overflow-hidden rounded-3xl border p-5", dark ? "border-white/10 bg-ink-900 text-white" : "border-line bg-white text-ink-900")}>
      <AnimatePresence mode="wait" initial={false}>
      {done ? (
        <motion.div key="done" {...slide} className="text-center">
          <span className="inline-flex size-11 items-center justify-center rounded-full bg-volt-400 text-ink-950">
            <Check className="size-5" strokeWidth={3} />
          </span>
          <p className="mt-3 font-display text-xl font-bold">Sprawdź skrzynkę</p>
          <p className={cn("mt-1 text-sm", dark ? "text-ink-300" : "text-ink-500")}>
            Na adres <span className="font-semibold">{email}</span> wysłaliśmy link do materiału.
          </p>
          <a
            href={`/k/${creator.slug}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-volt-400 px-5 text-sm font-semibold text-ink-950 hover:bg-volt-300"
          >
            Rozszerz bezpłatnie o impulsy <ArrowRight className="size-4.5" />
          </a>
        </motion.div>
      ) : (
        <motion.form key="form" {...slide} onSubmit={submit}>
          {options.showHeadline && (
            <>
              <p className="font-display text-xl leading-tight font-bold text-balance">{page.headline}</p>
              <p className={cn("mt-1.5 mb-4 text-sm", dark ? "text-ink-300" : "text-ink-500")}>{page.lead}</p>
            </>
          )}
          <div className="flex flex-col gap-2.5 min-[430px]:flex-row">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Twój email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="Twój email"
                className={cn(
                  "h-12 w-full rounded-xl border px-4 text-base outline-none",
                  dark ? "border-white/15 bg-white/10 text-white placeholder:text-ink-400 focus:border-volt-400" : "border-line bg-paper placeholder:text-ink-400 focus:border-ink-900",
                )}
              />
            </label>
            <button type="submit" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-volt-400 px-5 text-sm font-semibold text-ink-950 hover:bg-volt-300">
              {page.buttonLabel || "Zapisz się"}
            </button>
          </div>
          <div className={cn("mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs", dark ? "text-ink-400" : "text-ink-400")}>
            <span>
              {creator.members > SOCIAL_PROOF_MIN ? `Dołącz do ${creator.members} osób. ` : ""}
              Wypiszesz się jednym kliknięciem.
            </span>
            <span className="inline-flex items-center gap-1">
              <Zap className="size-3 text-volt-500" fill="currentColor" strokeWidth={0} /> Impuls
            </span>
          </div>
        </motion.form>
      )}
      </AnimatePresence>
    </div>
  );
}

/** /e/:slug — strona ładowana w iframe na stronie twórcy. */
export default function EmbedSignupPage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const channel = channelBySlug(slug);
  const [page] = useSignupPage(channel);

  // W osadzeniu tło należy do strony twórcy, nie do Impulsu.
  useEffect(() => {
    const previous = document.body.style.background;
    document.body.style.background = "transparent";
    return () => {
      document.body.style.background = previous;
    };
  }, []);

  return (
    <div className="p-1">
      <EmbedForm
        creator={channel.creator}
        page={page}
        options={{ theme: params.get("motyw") === "jasny" ? "light" : "dark", showHeadline: params.get("naglowek") !== "0" }}
      />
    </div>
  );
}
