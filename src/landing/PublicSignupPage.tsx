import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Check, Inbox, Lock, Mail, Zap } from "lucide-react";
import { autoEmails, channelBySlug, type Creator, type SignupPage } from "@/data/mock";
import { APP_DOMAIN } from "@/config";
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

/**
 * Publiczna strona zapisu twórcy (/s/:slug).
 * Zapis → mail od Impulsu z linkiem → prywatny kanał.
 */
export default function PublicSignupPage() {
  const { slug } = useParams();
  const channel = channelBySlug(slug);
  const { creator } = channel;
  const [page] = useSignupPage(channel);
  const [email, setEmail] = useState<string | null>(null);
  const welcome = autoEmails[0];

  return (
    <div className="relative min-h-dvh overflow-hidden bg-ink-900 text-white">
      <div className="bg-grid absolute inset-0" />
      <div className="absolute -top-32 left-1/2 h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-violet-600/30 blur-[110px]" />

      <div className="pt-safe pb-safe relative mx-auto flex min-h-dvh max-w-2xl flex-col px-5">
        <header className="flex items-center justify-between py-5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-ink-300">
            <Lock className="size-3" /> {creator.channelName}
          </span>
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-400 hover:text-white">
            <Zap className="size-3.5 text-volt-400" fill="currentColor" strokeWidth={0} /> Strona w Impulsie
          </Link>
        </header>

        <main className="flex flex-1 flex-col justify-center py-8">
          {email === null ? (
            <SignupCard creator={creator} page={page} onSubmit={setEmail} />
          ) : (
            <div className="text-center">
              <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-volt-400 text-ink-950">
                <Inbox className="size-7" />
              </span>
              <h1 className="mt-5 text-3xl font-extrabold">Sprawdź skrzynkę</h1>
              <p className="mx-auto mt-2 max-w-sm text-ink-300">
                Na adres <span className="font-semibold text-white">{email}</span> wysłaliśmy maila z linkiem do materiału.
              </p>

              {/* Podgląd maila, który dostaje zapisana osoba */}
              <div className="mx-auto mt-8 max-w-md rounded-3xl bg-white p-5 text-left text-ink-900 shadow-2xl">
                <p className="flex items-center gap-2 text-xs font-semibold text-ink-400">
                  <Mail className="size-3.5" /> Tak wygląda mail (podgląd demo)
                </p>
                <div className="mt-3 flex items-center gap-3 border-b border-line pb-3">
                  <Avatar name={creator.name} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{creator.name}</p>
                    <p className="truncate text-xs text-ink-400">przez Impuls · {APP_DOMAIN}</p>
                  </div>
                </div>
                <p className="mt-3 font-display text-lg font-bold">{welcome.subject}</p>
                <p className="mt-1.5 text-[15px] text-ink-600">{welcome.body}</p>
                <Link to={`/k/${creator.slug}`} className={buttonClass("dark", "md", "mt-4 w-full")}>
                  {welcome.cta} <ArrowRight className="size-4.5" />
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
