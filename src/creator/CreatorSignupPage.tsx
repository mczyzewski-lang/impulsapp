import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, Mail, MousePointerClick, Send, UserPlus } from "lucide-react";
import { autoEmails, defaultChannel, nf } from "@/data/mock";
import { APP_DOMAIN } from "@/config";
import { useSignupPage } from "@/state/signupPage";
import { cn } from "@/lib/cn";
import { buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { Toggle } from "@/components/ui/Toggle";
import { EmbedForm, type EmbedOptions } from "@/landing/EmbedSignupPage";
import { SignupCard } from "@/landing/PublicSignupPage";
import { PageHeader, inputClass, labelClass } from "./CreatorLayout";

const tabs = ["Strona", "Osadź na swojej stronie", "Automatyczne maile"] as const;
type Tab = (typeof tabs)[number];

const stats = [
  { label: "Wejścia na stronę", value: 2140, icon: MousePointerClick },
  { label: "Zapisy", value: 612, icon: UserPlus },
  { label: "Dołączyli do kanału", value: 438, icon: Send },
];

/**
 * Strona zapisu: własny landing twórcy w Impulsie.
 * Zapisana osoba dostaje gotowe maile z linkiem do kanału — bez zewnętrznego narzędzia do newslettera.
 */
export default function CreatorSignupPage() {
  const channel = defaultChannel;
  const { creator } = channel;
  const [page, update] = useSignupPage(channel);
  const [tab, setTab] = useState<Tab>("Strona");
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ welcome: true, reminder: true, impulse: true });
  const [subjects, setSubjects] = useState<Record<string, string>>(Object.fromEntries(autoEmails.map((e) => [e.id, e.subject])));

  const [embed, setEmbed] = useState<EmbedOptions>({ theme: "dark", showHeadline: true });

  const url = `${APP_DOMAIN}/s/${creator.slug}`;
  const embedQuery = [embed.theme === "light" ? "motyw=jasny" : "", embed.showHeadline ? "" : "naglowek=0"].filter(Boolean).join("&");
  const embedUrl = `https://${APP_DOMAIN}/e/${creator.slug}${embedQuery ? `?${embedQuery}` : ""}`;
  const embedCode = `<iframe src="${embedUrl}" title="Zapis: ${creator.channelName}" width="100%" height="${embed.showHeadline ? 340 : 190}" style="border:0;max-width:520px" loading="lazy"></iframe>`;

  return (
    <div>
      <PageHeader
        title="Strona zapisu"
        lead="Nie masz jeszcze listy albo chcesz ją powiększyć? Udostępnij swoją stronę. Kto się zapisze, dostanie od Impulsu maila z linkiem do Twojego kanału."
        action={
          <Link to={`/s/${creator.slug}`} className={buttonClass("dark")}>
            Otwórz stronę <ExternalLink className="size-4" />
          </Link>
        }
      />

      <Card className="mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-ink-400">Adres Twojej strony</p>
          <p className="truncate font-mono text-sm font-medium">{url}</p>
        </div>
        <CopyButton text={`https://${url}`} label="Kopiuj adres" />
      </Card>

      <div className="mb-5 grid grid-cols-3 gap-3">
        {stats.map(({ label, value, icon: Icon }, i) => (
          <Card key={label} className="p-4">
            <Icon className="size-4.5 text-ink-400" />
            <p className="mt-2 font-display text-2xl font-bold tabular-nums">{nf.format(value)}</p>
            <p className="text-xs text-ink-500 sm:text-sm">
              {label}
              {i > 0 && <span className="ml-1 font-semibold text-emerald-600">{Math.round((value / stats[i - 1].value) * 100)}%</span>}
            </p>
          </Card>
        ))}
      </div>

      <div className="mb-4 inline-flex max-w-full overflow-x-auto rounded-xl bg-ink-900/5 p-1" role="tablist">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn("rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap transition", tab === t ? "bg-white text-ink-900 shadow-sm" : "text-ink-500")}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Strona" && (
        <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
          <Card className="min-w-0 self-start p-5">
            <h2 className="text-lg font-bold">Treść strony</h2>
            <p className="mt-1 text-sm text-ink-500">Obiecaj jeden konkretny materiał. Zdjęcie, imię i opis pochodzą z Twojego profilu.</p>
            <div className="mt-4 space-y-4">
              <label className={labelClass}>
                Nagłówek
                <input className={inputClass} value={page.headline} onChange={(e) => update({ headline: e.target.value })} />
              </label>
              <label className={labelClass}>
                Opis
                <textarea className={inputClass} rows={2} value={page.lead} onChange={(e) => update({ lead: e.target.value })} />
              </label>
              <div>
                <p className={labelClass}>Co dostaje zapisana osoba</p>
                {page.bullets.map((b, i) => (
                  <input
                    key={i}
                    aria-label={`Punkt ${i + 1}`}
                    className={inputClass}
                    value={b}
                    onChange={(e) => update({ bullets: page.bullets.map((v, idx) => (idx === i ? e.target.value : v)) })}
                  />
                ))}
              </div>
              <label className={labelClass}>
                Tekst przycisku
                <input className={inputClass} value={page.buttonLabel} onChange={(e) => update({ buttonLabel: e.target.value })} />
              </label>
            </div>
          </Card>

          <div className="min-w-0 lg:sticky lg:top-8 lg:self-start">
            <p className="mb-2 text-xs font-semibold tracking-wide text-ink-400 uppercase">Podgląd na żywo</p>
            <div className="pointer-events-none overflow-hidden rounded-3xl bg-ink-900 px-5 py-8 text-white select-none">
              <SignupCard creator={creator} page={page} />
            </div>
          </div>
        </div>
      )}

      {tab === "Osadź na swojej stronie" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="min-w-0 self-start p-5">
            <h2 className="text-lg font-bold">Formularz na Twojej stronie</h2>
            <p className="mt-1 text-sm text-ink-500">
              Kierujesz ruch na własną stronę? Wklej ten kod tam, gdzie ma się pojawić zapis. To sam kontener z polem email —
              reszta strony zostaje Twoja. Zapisane osoby dostają te same maile z linkiem do kanału.
            </p>

            <div className="mt-5 flex items-center justify-between gap-4">
              <span className="text-[15px] font-medium">Motyw</span>
              <div className="inline-flex rounded-xl bg-ink-900/5 p-1" role="radiogroup" aria-label="Motyw formularza">
                {(["dark", "light"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={embed.theme === t}
                    onClick={() => setEmbed((o) => ({ ...o, theme: t }))}
                    className={cn("rounded-lg px-3.5 py-1.5 text-sm font-semibold transition", embed.theme === t ? "bg-white shadow-sm" : "text-ink-500")}
                  >
                    {t === "dark" ? "Ciemny" : "Jasny"}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-4 border-t border-line pt-3">
              <span className="text-[15px] font-medium">Pokaż nagłówek i opis</span>
              <Toggle checked={embed.showHeadline} onChange={(v) => setEmbed((o) => ({ ...o, showHeadline: v }))} label="Pokaż nagłówek i opis" />
            </div>

            <div className="mt-5 rounded-xl bg-ink-900 p-4">
              <p className="text-xs font-semibold text-ink-300">Kod do wklejenia</p>
              <pre className="mt-2 font-mono text-[13px] leading-relaxed break-all whitespace-pre-wrap text-volt-400">{embedCode}</pre>
              <div className="mt-3">
                <CopyButton text={embedCode} label="Kopiuj kod" />
              </div>
            </div>
            <p className="mt-3 text-xs text-ink-400">Działa w WordPressie, Webflow, Carrd i każdym edytorze, który pozwala wkleić własny HTML.</p>
          </Card>

          <div className="min-w-0 lg:sticky lg:top-8 lg:self-start">
            <p className="mb-2 text-xs font-semibold tracking-wide text-ink-400 uppercase">Podgląd na Twojej stronie</p>
            {/* Umowna strona twórcy: szare bloki to jego własna treść */}
            <div className="rounded-3xl border border-line bg-white p-5">
              <div className="h-3 w-24 rounded-full bg-ink-900/10" />
              <div className="mt-5 h-5 w-3/4 rounded-full bg-ink-900/10" />
              <div className="mt-2.5 h-3 w-full rounded-full bg-ink-900/5" />
              <div className="mt-2 h-3 w-5/6 rounded-full bg-ink-900/5" />
              <div className="my-5">
                <EmbedForm creator={creator} page={page} options={embed} interactive={false} />
              </div>
              <div className="h-3 w-full rounded-full bg-ink-900/5" />
              <div className="mt-2 h-3 w-2/3 rounded-full bg-ink-900/5" />
            </div>
          </div>
        </div>
      )}

      {tab === "Automatyczne maile" && (
        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0 space-y-4">
            {autoEmails.map((mail, i) => (
              <Card key={mail.id} className={cn("p-5 transition-opacity", !enabled[mail.id] && "opacity-60")}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-violet-700">
                      Mail {i + 1} · {mail.when}
                    </p>
                    <p className="mt-0.5 flex items-center gap-2 font-display text-lg font-bold">
                      <Mail className="size-4.5 text-ink-400" /> {subjects[mail.id]}
                    </p>
                  </div>
                  <Toggle checked={enabled[mail.id]} onChange={(v) => setEnabled((s) => ({ ...s, [mail.id]: v }))} label={`Mail: ${mail.when}`} />
                </div>
                <label className={cn(labelClass, "mt-4")}>
                  Temat
                  <input className={inputClass} value={subjects[mail.id]} onChange={(e) => setSubjects((s) => ({ ...s, [mail.id]: e.target.value }))} />
                </label>
                <div className="mt-4 rounded-xl bg-paper p-4">
                  <p className="text-[15px] text-ink-600">{mail.body}</p>
                  <span className="mt-3 inline-flex items-center gap-2 rounded-lg bg-ink-900 px-3.5 py-2 text-sm font-semibold text-white">
                    {mail.cta} <ArrowRight className="size-4" />
                  </span>
                </div>
              </Card>
            ))}
          </div>

          <Card className="self-start p-5">
            <h2 className="text-base font-bold">Jak to działa</h2>
            <ol className="mt-3 space-y-3 text-sm text-ink-600">
              {[
                "Ktoś zapisuje się na Twojej stronie.",
                "Impuls wysyła mu maila z linkiem do kanału.",
                "Po kliknięciu trafia na zaproszenie i odbiera materiał.",
                "O każdym nowym impulsie dostaje krótkiego maila: „tu jest więcej materiału”.",
              ].map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-ink-900 text-xs font-bold text-white">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
            <p className="mt-4 border-t border-line pt-4 text-xs text-ink-400">
              Masz już listę w innym narzędziu? Nic nie zmieniasz — wklejasz tam linki z zakładki „Linki i kampanie”.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
