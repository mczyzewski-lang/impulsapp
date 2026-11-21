import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Check, KeyRound, Loader2, LogOut, RefreshCw, ShieldCheck, Wallet, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { inputClass, labelClass } from "@/creator/CreatorLayout";

const API = (import.meta.env.VITE_API_URL as string | undefined) ?? "";
const TOKEN_KEY = "impuls.admin.token";

/* ───────────── Kształt danych z serwera ───────────── */

interface KeyInfo {
  set: boolean;
  hint: string;
  source: "panel" | "env" | null;
}

interface Rates {
  ttsPer1kChars: number;
  sttPerMinute: number;
  imagePerImage: number;
}

interface UsageRow {
  service: string;
  operation: string;
  unit: string;
  calls: number;
  units: number;
  costUsd: number;
}

interface AdminState {
  persistent: boolean;
  integrations: {
    elevenlabs: { key: KeyInfo; voiceId: string };
    openai: { key: KeyInfo; imageModel: string };
    uploadPost: { key: KeyInfo };
  };
  monthlyBudgetUsd: number;
  rates: Rates;
  usage: {
    month: string;
    totalUsd: number;
    calls: number;
    byOperation: UsageRow[];
    byDay: { day: string; costUsd: number }[];
    recent: { at: string; service: string; operation: string; units: number; unit: string; costUsd: number }[];
  };
}

interface TestResult {
  ok: boolean;
  message: string;
  account?: { plan: string | null; used: number | null; limit: number | null; resetsAt: number | null };
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function call<T>(path: string, token: string | null, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API}/api/admin/${path}`, {
      ...init,
      headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
    });
  } catch {
    throw new ApiError("Brak połączenia z serwerem.", 0);
  }
  // Hosting statyczny odpowiada tu stroną HTML — to znak, że serwer Impulsu nie jest uruchomiony.
  if (!res.headers.get("content-type")?.includes("application/json")) {
    throw new ApiError("Serwer Impulsu nie jest uruchomiony. Ustaw komendę startową na „npm start”.", 0);
  }
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new ApiError(data.error ?? "Błąd serwera", res.status);
  return data;
}

const usd = (value: number) => `${value.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
const when = (iso: string) => new Date(iso).toLocaleString("pl-PL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/* ───────────── Elementy ───────────── */

function KeyStatus({ info }: { info: KeyInfo }) {
  if (!info.set) return <Badge tone="amber">Brak klucza</Badge>;
  return (
    <Badge tone="green">
      <Check className="size-3" strokeWidth={3} /> {info.hint} · {info.source === "panel" ? "wpisany w panelu" : "ze zmiennej środowiskowej"}
    </Badge>
  );
}

function Section({ icon, title, lead, children }: { icon: ReactNode; title: string; lead: string; children: ReactNode }) {
  return (
    <Card className="overflow-hidden p-5 sm:p-6">
      <h2 className="flex items-center gap-2.5 text-lg font-bold">
        {icon} {title}
      </h2>
      <p className="mt-1 text-sm text-ink-500">{lead}</p>
      {children}
    </Card>
  );
}

/**
 * Panel administratora: klucze API (ElevenLabs, OpenAI), limit miesięczny i wydatki.
 * Klucze są zapisywane wyłącznie na serwerze — przeglądarka nigdy nie dostaje ich z powrotem.
 */
export default function AdminPage() {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });
  const [state, setState] = useState<AdminState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  // Pola formularza. Klucze są puste, dopóki administrator nie wpisze nowych.
  const [elevenlabsKey, setElevenlabsKey] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [uploadPostKey, setUploadPostKey] = useState("");
  const [imageModel, setImageModel] = useState("");
  const [budget, setBudget] = useState("");
  const [rates, setRates] = useState<Record<keyof Rates, string>>({ ttsPer1kChars: "", sttPerMinute: "", imagePerImage: "" });
  const [voices, setVoices] = useState<{ id: string; name: string }[]>([]);
  const [tests, setTests] = useState<Record<string, TestResult>>({});
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* brak storage */
    }
    setToken(null);
    setState(null);
  }, []);

  const apply = useCallback((next: AdminState) => {
    setState(next);
    setVoiceId(next.integrations.elevenlabs.voiceId);
    setImageModel(next.integrations.openai.imageModel);
    setBudget(String(next.monthlyBudgetUsd));
    setRates({ ttsPer1kChars: String(next.rates.ttsPer1kChars), sttPerMinute: String(next.rates.sttPerMinute), imagePerImage: String(next.rates.imagePerImage) });
  }, []);

  const fail = useCallback(
    (e: unknown) => {
      if (e instanceof ApiError && e.status === 401) logout();
      setError(e instanceof Error ? e.message : "Błąd");
    },
    [logout],
  );

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      apply(await call<AdminState>("state", token));
      setError(null);
    } catch (e) {
      fail(e);
    }
  }, [token, apply, fail]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function login(e: FormEvent) {
    e.preventDefault();
    setBusy("login");
    try {
      const { token: next } = await call<{ token: string }>("login", null, { method: "POST", body: JSON.stringify({ password }) });
      try {
        sessionStorage.setItem(TOKEN_KEY, next);
      } catch {
        /* sesja tylko do zamknięcia karty */
      }
      setToken(next);
      setPassword("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd");
    }
    setBusy(null);
  }

  async function save(body: Record<string, unknown>, note: string) {
    setBusy("save");
    try {
      apply(await call<AdminState>("settings", token, { method: "PUT", body: JSON.stringify(body) }));
      setElevenlabsKey("");
      setOpenaiKey("");
      setUploadPostKey("");
      setSavedNote(note);
      setTimeout(() => setSavedNote(null), 2500);
      setError(null);
    } catch (e) {
      fail(e);
    }
    setBusy(null);
  }

  async function test(service: "elevenlabs" | "openai" | "uploadPost") {
    setBusy(`test-${service}`);
    try {
      const result = await call<TestResult>("test", token, { method: "POST", body: JSON.stringify({ service }) });
      setTests((t) => ({ ...t, [service]: result }));
    } catch (e) {
      fail(e);
    }
    setBusy(null);
  }

  async function loadVoices() {
    setBusy("voices");
    try {
      const data = await call<{ voices: { id: string; name: string }[]; message?: string }>("voices", token);
      setVoices(data.voices);
      if (!data.voices.length) setError(data.message ?? "Nie znaleziono głosów na tym koncie.");
    } catch (e) {
      fail(e);
    }
    setBusy(null);
  }

  /* ── Logowanie ── */
  if (!token) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-ink-900 p-5">
        <form onSubmit={login} className="w-full max-w-sm rounded-3xl bg-white p-6">
          <Logo tone="dark" />
          <h1 className="mt-5 text-2xl font-bold">Panel administratora</h1>
          <p className="mt-1 text-sm text-ink-500">Klucze API i wydatki na integracje.</p>
          <label className={cn(labelClass, "mt-5")}>
            Hasło administratora
            <input type="password" required autoFocus autoComplete="current-password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && (
            <p role="alert" className="mt-3 flex items-start gap-2 text-sm text-rose-700">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" /> {error}
            </p>
          )}
          <Button type="submit" variant="dark" size="lg" className="mt-5 w-full" disabled={busy === "login"}>
            {busy === "login" && <Loader2 className="size-4.5 animate-spin" />} Zaloguj
          </Button>
          <p className="mt-4 text-xs text-ink-400">Hasło ustawia się na serwerze zmienną środowiskową ADMIN_PASSWORD.</p>
        </form>
      </div>
    );
  }

  const el = state?.integrations.elevenlabs;
  const oa = state?.integrations.openai;
  const up = state?.integrations.uploadPost;
  const usage = state?.usage;
  const spent = usage?.totalUsd ?? 0;
  const limit = state?.monthlyBudgetUsd ?? 0;
  const overBudget = limit > 0 && spent >= limit;
  const maxDay = Math.max(0.0001, ...(usage?.byDay.map((d) => d.costUsd) ?? []));
  const account = tests.elevenlabs?.account;

  return (
    <div className="min-h-dvh bg-paper">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <Link to="/" className="flex items-center gap-3">
            <Logo tone="dark" className="text-lg" />
            <span className="rounded-full bg-ink-900 px-2.5 py-1 text-xs font-semibold text-white">Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => void refresh()}>
              <RefreshCw className="size-4" /> <span className="hidden sm:inline">Odśwież</span>
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="size-4" /> <span className="hidden sm:inline">Wyloguj</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 px-5 py-8">
        <div>
          <h1 className="text-3xl font-bold">Integracje i wydatki</h1>
          <p className="mt-1.5 max-w-2xl text-ink-500">
            Tu podłączasz ElevenLabs, OpenAI i Upload-Post oraz pilnujesz, ile kosztują. Klucze trafiają tylko na serwer — panel pokazuje ich cztery ostatnie znaki.
          </p>
        </div>

        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" /> {error}
            <button type="button" aria-label="Zamknij komunikat" onClick={() => setError(null)} className="ml-auto">
              <X className="size-4" />
            </button>
          </p>
        )}
        {state && !state.persistent && (
          <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            Serwer nie może zapisać danych na dysku. Ustawienia i dziennik wydatków znikną po restarcie — podłącz trwały wolumen i wskaż go zmienną DATA_DIR.
          </p>
        )}
        {savedNote && (
          <p role="status" className="flex items-center gap-2 rounded-xl bg-volt-200 px-4 py-3 text-sm font-semibold text-volt-700">
            <Check className="size-4" strokeWidth={3} /> {savedNote}
          </p>
        )}

        {!state ? (
          <p className="flex items-center gap-2 text-ink-500">
            <Loader2 className="size-4 animate-spin" /> Wczytywanie…
          </p>
        ) : (
          <>
            {/* ── Wydatki ── */}
            <Section icon={<Wallet className="size-5 text-violet-600" />} title="Wydatki w tym miesiącu" lead={`Szacunek z dziennika wywołań (${usage!.month}). Kwoty liczone są ze stawek poniżej — faktura od dostawcy może się różnić.`}>
              <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
                <div className="min-w-0">
                  <p className={cn("font-display text-4xl font-bold tabular-nums", overBudget && "text-rose-600")}>{usd(spent)}</p>
                  <p className="mt-1 text-sm text-ink-500">
                    {limit > 0 ? `z limitu ${usd(limit)}` : "bez limitu"} · {usage!.calls} wywołań
                  </p>
                  {limit > 0 && <ProgressBar value={Math.min(spent, limit)} max={limit} className="mt-3 h-2.5" barClassName={overBudget ? "bg-rose-500" : spent / limit > 0.8 ? "bg-amber-500" : "bg-volt-500"} label="Wykorzystanie limitu" />}
                  {overBudget && <p className="mt-2 text-sm font-semibold text-rose-700">Limit wykorzystany — studio działa w trybie demo do końca miesiąca.</p>}

                  <form
                    className="mt-5 flex items-end gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void save({ monthlyBudgetUsd: budget }, "Limit zapisany");
                    }}
                  >
                    <label className={cn(labelClass, "flex-1")}>
                      Limit miesięczny (USD)
                      <input className={inputClass} type="number" min={0} step="1" value={budget} onChange={(e) => setBudget(e.target.value)} />
                    </label>
                    <Button type="submit" variant="dark" disabled={busy === "save"}>
                      Zapisz
                    </Button>
                  </form>
                  <p className="mt-1.5 text-xs text-ink-400">Po przekroczeniu serwer przestaje wywoływać płatne usługi. Zero wyłącza limit.</p>
                </div>

                <div className="min-w-0">
                  <div className="overflow-x-auto rounded-xl border border-line">
                    <table className="w-full min-w-[380px] text-left text-sm">
                      <thead className="text-xs text-ink-400">
                        <tr>
                          <th className="px-3.5 py-2.5 font-semibold">Funkcja</th>
                          <th className="px-3 py-2.5 text-right font-semibold">Wywołania</th>
                          <th className="px-3 py-2.5 text-right font-semibold">Zużycie</th>
                          <th className="px-3.5 py-2.5 text-right font-semibold">Koszt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {usage!.byOperation.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-3.5 py-6 text-center text-ink-400">
                              Brak wywołań w tym miesiącu.
                            </td>
                          </tr>
                        )}
                        {usage!.byOperation.map((row) => (
                          <tr key={row.operation}>
                            <td className="px-3.5 py-2.5">
                              <p className="font-semibold">{row.operation}</p>
                              <p className="text-xs text-ink-400">{row.service}</p>
                            </td>
                            <td className="px-3 py-2.5 text-right tabular-nums">{row.calls}</td>
                            <td className="px-3 py-2.5 text-right tabular-nums">
                              {row.units.toLocaleString("pl-PL")} {row.unit}
                            </td>
                            <td className="px-3.5 py-2.5 text-right font-semibold tabular-nums">{usd(row.costUsd)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {usage!.byDay.length > 0 && (
                    <div className="mt-4 flex h-24 items-end gap-1.5" aria-label="Wydatki dzień po dniu">
                      {usage!.byDay.map((d) => (
                        <div key={d.day} className="flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${d.day}: ${usd(d.costUsd)}`}>
                          <div className="w-full max-w-10 rounded-t-md bg-violet-500" style={{ height: `${Math.max(4, (d.costUsd / maxDay) * 100)}%` }} />
                          <span className="text-[10px] text-ink-400">{d.day.slice(8)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <details className="mt-5 rounded-xl bg-paper p-4">
                <summary className="cursor-pointer text-sm font-semibold">Stawki do szacowania kosztu</summary>
                <p className="mt-2 text-xs text-ink-500">Wartości startowe są orientacyjne. Wpisz stawki ze swojego cennika u dostawcy, żeby szacunek zgadzał się z fakturą.</p>
                <form
                  className="mt-3 grid gap-3 sm:grid-cols-4 sm:items-end"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void save({ rates }, "Stawki zapisane");
                  }}
                >
                  {(
                    [
                      ["ttsPer1kChars", "Lektor: USD za 1000 znaków"],
                      ["sttPerMinute", "Napisy: USD za minutę"],
                      ["imagePerImage", "Infografika: USD za obraz"],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} className={labelClass}>
                      {label}
                      <input className={inputClass} type="number" min={0} step="0.001" value={rates[key]} onChange={(e) => setRates((r) => ({ ...r, [key]: e.target.value }))} />
                    </label>
                  ))}
                  <Button type="submit" variant="outline" disabled={busy === "save"}>
                    Zapisz stawki
                  </Button>
                </form>
              </details>
            </Section>

            {/* ── ElevenLabs ── */}
            <Section icon={<KeyRound className="size-5 text-violet-600" />} title="ElevenLabs" lead="Lektor czytający pytanie w prompterze i napisy z nagrania.">
              <div className="mt-3">
                <KeyStatus info={el!.key} />
              </div>
              <form
                className="mt-4 grid gap-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  void save({ ...(elevenlabsKey ? { elevenlabsKey } : {}), elevenlabsVoiceId: voiceId }, "Ustawienia ElevenLabs zapisane");
                }}
              >
                <label className={labelClass}>
                  Klucz API
                  <input className={inputClass} type="password" autoComplete="off" value={elevenlabsKey} onChange={(e) => setElevenlabsKey(e.target.value)} placeholder={el!.key.set ? "Wpisz nowy, żeby podmienić" : "Wklej klucz z ustawień ElevenLabs"} />
                </label>
                <div>
                  <label className={labelClass}>
                    Głos lektora (Voice ID)
                    {voices.length ? (
                      <select className={inputClass} value={voiceId} onChange={(e) => setVoiceId(e.target.value)}>
                        <option value="">Wybierz głos…</option>
                        {voices.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input className={inputClass} value={voiceId} onChange={(e) => setVoiceId(e.target.value)} placeholder="ID głosu z biblioteki ElevenLabs" />
                    )}
                  </label>
                  <button type="button" disabled={!el!.key.set || busy === "voices"} onClick={() => void loadVoices()} className="mt-1.5 text-xs font-semibold text-violet-700 disabled:opacity-40">
                    Pobierz listę głosów z konta
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 sm:col-span-2">
                  <Button type="submit" variant="dark" disabled={busy === "save"}>
                    Zapisz
                  </Button>
                  <Button variant="outline" disabled={!el!.key.set || busy === "test-elevenlabs"} onClick={() => void test("elevenlabs")}>
                    {busy === "test-elevenlabs" ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />} Sprawdź połączenie
                  </Button>
                  {el!.key.source === "panel" && (
                    <Button variant="ghost" onClick={() => void save({ elevenlabsKey: "" }, "Klucz ElevenLabs usunięty")}>
                      Usuń klucz
                    </Button>
                  )}
                </div>
              </form>
              {tests.elevenlabs && (
                <p className={cn("mt-3 text-sm font-semibold", tests.elevenlabs.ok ? "text-emerald-700" : "text-rose-700")}>
                  {tests.elevenlabs.message}
                  {account?.limit != null && account.used != null && (
                    <span className="ml-2 font-normal text-ink-500">
                      Konto{account.plan ? ` (${account.plan})` : ""}: zużyto {account.used.toLocaleString("pl-PL")} z {account.limit.toLocaleString("pl-PL")} kredytów
                      {account.resetsAt ? `, odnowienie ${new Date(account.resetsAt * 1000).toLocaleDateString("pl-PL")}` : ""}.
                    </span>
                  )}
                </p>
              )}
              {el!.key.set && !el!.voiceId && <p className="mt-3 text-sm text-amber-800">Lektor wymaga wybrania głosu. Napisy działają już teraz.</p>}
            </Section>

            {/* ── OpenAI ── */}
            <Section icon={<KeyRound className="size-5 text-violet-600" />} title="OpenAI" lead="Infografiki w stylu marki generowane z treści nagrania.">
              <div className="mt-3">
                <KeyStatus info={oa!.key} />
              </div>
              <form
                className="mt-4 grid gap-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  void save({ ...(openaiKey ? { openaiKey } : {}), openaiImageModel: imageModel }, "Ustawienia OpenAI zapisane");
                }}
              >
                <label className={labelClass}>
                  Klucz API
                  <input className={inputClass} type="password" autoComplete="off" value={openaiKey} onChange={(e) => setOpenaiKey(e.target.value)} placeholder={oa!.key.set ? "Wpisz nowy, żeby podmienić" : "Wklej klucz z platformy OpenAI"} />
                </label>
                <label className={labelClass}>
                  Model obrazów
                  <input className={inputClass} value={imageModel} onChange={(e) => setImageModel(e.target.value)} />
                </label>
                <div className="flex flex-wrap gap-2 sm:col-span-2">
                  <Button type="submit" variant="dark" disabled={busy === "save"}>
                    Zapisz
                  </Button>
                  <Button variant="outline" disabled={!oa!.key.set || busy === "test-openai"} onClick={() => void test("openai")}>
                    {busy === "test-openai" ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />} Sprawdź połączenie
                  </Button>
                  {oa!.key.source === "panel" && (
                    <Button variant="ghost" onClick={() => void save({ openaiKey: "" }, "Klucz OpenAI usunięty")}>
                      Usuń klucz
                    </Button>
                  )}
                </div>
              </form>
              {tests.openai && <p className={cn("mt-3 text-sm font-semibold", tests.openai.ok ? "text-emerald-700" : "text-rose-700")}>{tests.openai.message}</p>}
            </Section>

            {/* ── Upload-Post ── */}
            <Section
              icon={<KeyRound className="size-5 text-violet-600" />}
              title="Upload-Post"
              lead="Publikacja i planowanie wideo w social mediach. Ty kupujesz plan, a każdy twórca podpina własne konta do swojego profilu."
            >
              <div className="mt-3">
                <KeyStatus info={up!.key} />
              </div>
              <form
                className="mt-4 grid gap-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (uploadPostKey) void save({ uploadPostKey }, "Klucz Upload-Post zapisany");
                }}
              >
                <label className={labelClass}>
                  Klucz API
                  <input className={inputClass} type="password" autoComplete="off" value={uploadPostKey} onChange={(e) => setUploadPostKey(e.target.value)} placeholder={up!.key.set ? "Wpisz nowy, żeby podmienić" : "Wklej klucz z panelu Upload-Post"} />
                </label>
                <p className="self-end text-xs text-ink-500">
                  Plan dostawcy jest rozliczany od liczby profili, czyli od liczby twórców z podpiętymi kontami. Panel liczy tu publikacje; koszt planu sprawdzisz na fakturze od Upload-Post.
                </p>
                <div className="flex flex-wrap gap-2 sm:col-span-2">
                  <Button type="submit" variant="dark" disabled={busy === "save" || !uploadPostKey}>
                    Zapisz
                  </Button>
                  <Button variant="outline" disabled={!up!.key.set || busy === "test-uploadPost"} onClick={() => void test("uploadPost")}>
                    {busy === "test-uploadPost" ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />} Sprawdź połączenie
                  </Button>
                  {up!.key.source === "panel" && (
                    <Button variant="ghost" onClick={() => void save({ uploadPostKey: "" }, "Klucz Upload-Post usunięty")}>
                      Usuń klucz
                    </Button>
                  )}
                </div>
              </form>
              {tests.uploadPost && <p className={cn("mt-3 text-sm font-semibold", tests.uploadPost.ok ? "text-emerald-700" : "text-rose-700")}>{tests.uploadPost.message}</p>}
            </Section>

            {/* ── Dziennik ── */}
            <Section icon={<RefreshCw className="size-5 text-violet-600" />} title="Ostatnie wywołania" lead="25 najnowszych płatnych wywołań z serwera.">
              <div className="mt-4 overflow-x-auto rounded-xl border border-line">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead className="text-xs text-ink-400">
                    <tr>
                      <th className="px-3.5 py-2.5 font-semibold">Kiedy</th>
                      <th className="px-3 py-2.5 font-semibold">Usługa</th>
                      <th className="px-3 py-2.5 font-semibold">Funkcja</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Zużycie</th>
                      <th className="px-3.5 py-2.5 text-right font-semibold">Koszt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {usage!.recent.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3.5 py-6 text-center text-ink-400">
                          Jeszcze nic. Wywołania pojawią się po pierwszym użyciu lektora, napisów lub infografik.
                        </td>
                      </tr>
                    )}
                    {usage!.recent.map((u, i) => (
                      <tr key={u.at + i}>
                        <td className="px-3.5 py-2.5 whitespace-nowrap text-ink-500">{when(u.at)}</td>
                        <td className="px-3 py-2.5">{u.service}</td>
                        <td className="px-3 py-2.5 font-semibold">{u.operation}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {u.units.toLocaleString("pl-PL")} {u.unit}
                        </td>
                        <td className="px-3.5 py-2.5 text-right tabular-nums">{usd(u.costUsd)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          </>
        )}
      </main>
    </div>
  );
}
