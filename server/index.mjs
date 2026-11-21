// Serwer Impulsu: serwuje zbudowany frontend (dist), pośredniczy w wywołaniach AI
// i udostępnia panel administratora (klucze API, limity, wydatki).
//
// Zmienne środowiskowe:
//   ADMIN_PASSWORD       hasło do panelu /admin — bez niego panel jest wyłączony
//   DATA_DIR             katalog na ustawienia i dziennik wydatków (domyślnie ./data);
//                        na hostingu z ulotnym dyskiem podłącz tu trwały wolumen
//   PORT                 port serwera (domyślnie 8080)
//
// Klucze można wpisać w panelu /admin albo podać jako zmienne (panel ma pierwszeństwo):
//   ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID, OPENAI_API_KEY, OPENAI_IMAGE_MODEL
//
// Uruchomienie: npm run build && npm start

import { createServer } from "node:http";
import { randomBytes, timingSafeEqual, createHash } from "node:crypto";
import { appendFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../dist", import.meta.url));
const DATA_DIR = process.env.DATA_DIR ?? fileURLToPath(new URL("../data", import.meta.url));
const SETTINGS_FILE = join(DATA_DIR, "settings.json");
const USAGE_FILE = join(DATA_DIR, "usage.jsonl");
const PORT = Number(process.env.PORT ?? 8080);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
const MAX_BODY = 60 * 1024 * 1024; // nagranie do transkrypcji

/* ───────────── Ustawienia ───────────── */

// Stawki służą wyłącznie do SZACOWANIA kosztu w panelu. Faktyczne ceny zależą od planu
// u dostawcy — administrator powinien wpisać własne.
const DEFAULT_RATES = { ttsPer1kChars: 0.3, sttPerMinute: 0.01, imagePerImage: 0.2 };

let settings = { elevenlabsKey: "", elevenlabsVoiceId: "", openaiKey: "", openaiImageModel: "", monthlyBudgetUsd: 20, rates: DEFAULT_RATES };
let persistent = true;

async function loadSettings() {
  try {
    const saved = JSON.parse(await readFile(SETTINGS_FILE, "utf8"));
    settings = { ...settings, ...saved, rates: { ...DEFAULT_RATES, ...saved.rates } };
  } catch {
    /* brak pliku — zostają wartości domyślne i zmienne środowiskowe */
  }
}

async function saveSettings() {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), { mode: 0o600 });
    persistent = true;
  } catch (error) {
    persistent = false; // ustawienia działają do restartu serwera
    console.error("Nie udało się zapisać ustawień:", error.message);
  }
}

/** Skuteczna konfiguracja: wartość z panelu, a gdy jej nie ma — ze zmiennej środowiskowej. */
function config() {
  return {
    elevenlabsKey: settings.elevenlabsKey || process.env.ELEVENLABS_API_KEY || "",
    elevenlabsVoiceId: settings.elevenlabsVoiceId || process.env.ELEVENLABS_VOICE_ID || "",
    openaiKey: settings.openaiKey || process.env.OPENAI_API_KEY || "",
    openaiImageModel: settings.openaiImageModel || process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
  };
}

/** Klucza nigdy nie odsyłamy do przeglądarki — tylko to, czy jest, skąd pochodzi i jego końcówkę. */
function describeKey(fromPanel, fromEnv) {
  const value = fromPanel || fromEnv || "";
  return { set: Boolean(value), hint: value ? `••••${value.slice(-4)}` : "", source: fromPanel ? "panel" : fromEnv ? "env" : null };
}

/* ───────────── Dziennik wydatków ───────────── */

/** @type {{at:string, service:string, operation:string, units:number, unit:string, costUsd:number}[]} */
let usage = [];

async function loadUsage() {
  try {
    usage = (await readFile(USAGE_FILE, "utf8"))
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch {
    usage = [];
  }
}

async function record(service, operation, units, unit, costUsd) {
  const entry = { at: new Date().toISOString(), service, operation, units: +units.toFixed(2), unit, costUsd: +costUsd.toFixed(4) };
  usage.push(entry);
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await appendFile(USAGE_FILE, JSON.stringify(entry) + "\n");
  } catch {
    persistent = false;
  }
}

const monthKey = (date) => date.slice(0, 7);

function monthSpend() {
  const now = monthKey(new Date().toISOString());
  return usage.filter((u) => monthKey(u.at) === now).reduce((sum, u) => sum + u.costUsd, 0);
}

function usageSummary() {
  const now = monthKey(new Date().toISOString());
  const thisMonth = usage.filter((u) => monthKey(u.at) === now);
  const byOperation = {};
  for (const u of thisMonth) {
    const row = (byOperation[u.operation] ??= { service: u.service, operation: u.operation, unit: u.unit, calls: 0, units: 0, costUsd: 0 });
    row.calls += 1;
    row.units += u.units;
    row.costUsd += u.costUsd;
  }
  const byDay = {};
  for (const u of thisMonth) byDay[u.at.slice(0, 10)] = (byDay[u.at.slice(0, 10)] ?? 0) + u.costUsd;
  return {
    month: now,
    totalUsd: +thisMonth.reduce((s, u) => s + u.costUsd, 0).toFixed(4),
    calls: thisMonth.length,
    byOperation: Object.values(byOperation).map((r) => ({ ...r, units: +r.units.toFixed(2), costUsd: +r.costUsd.toFixed(4) })),
    byDay: Object.entries(byDay).map(([day, costUsd]) => ({ day, costUsd: +costUsd.toFixed(4) })),
    recent: usage.slice(-25).reverse(),
  };
}

/* ───────────── Zabezpieczenia ───────────── */

const sessions = new Map(); // token → czas wygaśnięcia
const SESSION_MS = 12 * 60 * 60 * 1000;
const hits = new Map(); // klucz → znaczniki czasu

/** Prosty limit: najwyżej `max` wywołań z jednego adresu w oknie `windowMs`. */
function limited(key, max, windowMs) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  return list.length > max;
}

function clientIp(req) {
  return String(req.headers["x-forwarded-for"] ?? req.socket.remoteAddress ?? "").split(",")[0].trim();
}

function passwordMatches(candidate) {
  const a = createHash("sha256").update(String(candidate)).digest();
  const b = createHash("sha256").update(ADMIN_PASSWORD).digest();
  return timingSafeEqual(a, b);
}

function isAdmin(req) {
  const token = String(req.headers.authorization ?? "").replace(/^Bearer /, "");
  const expires = sessions.get(token);
  if (!expires || expires < Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
}

/* ───────────── Pomocnicze ───────────── */

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".mp4": "video/mp4",
  ".woff2": "font/woff2",
};

function json(res, status, body) {
  res.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw new Error("Za duże żądanie");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function readJson(req) {
  try {
    return JSON.parse((await readBody(req)).toString("utf8") || "{}");
  } catch {
    return {};
  }
}

/* ───────────── API: integracje AI ───────────── */

async function aiApi(req, res, path) {
  const cfg = config();

  if (path === "/api/health") {
    return json(res, 200, { elevenlabs: Boolean(cfg.elevenlabsKey && cfg.elevenlabsVoiceId), openai: Boolean(cfg.openaiKey) });
  }
  if (req.method !== "POST") return json(res, 405, { error: "Dozwolona metoda: POST" });

  // Te ścieżki są publiczne i każda kosztuje — stąd limit na adres i miesięczny budżet.
  if (limited(`ai:${clientIp(req)}`, 30, 10 * 60 * 1000)) return json(res, 429, { error: "Za dużo żądań. Spróbuj za kilka minut." });
  if (settings.monthlyBudgetUsd > 0 && monthSpend() >= settings.monthlyBudgetUsd) {
    return json(res, 429, { error: "Miesięczny limit wydatków na AI został wykorzystany." });
  }

  if (path === "/api/tts") {
    if (!cfg.elevenlabsKey || !cfg.elevenlabsVoiceId) return json(res, 503, { error: "ElevenLabs nie jest skonfigurowany" });
    const { text } = await readJson(req);
    if (typeof text !== "string" || !text.trim() || text.length > 600) return json(res, 400, { error: "Nieprawidłowy tekst" });
    const upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(cfg.elevenlabsVoiceId)}`, {
      method: "POST",
      headers: { "xi-api-key": cfg.elevenlabsKey, "content-type": "application/json", accept: "audio/mpeg" },
      body: JSON.stringify({ text, model_id: "eleven_multilingual_v2" }),
    });
    if (!upstream.ok) return json(res, 502, { error: "ElevenLabs odrzucił żądanie", status: upstream.status });
    await record("ElevenLabs", "Lektor", text.length, "znaki", (text.length / 1000) * settings.rates.ttsPer1kChars);
    res.writeHead(200, { "content-type": "audio/mpeg" });
    return res.end(Buffer.from(await upstream.arrayBuffer()));
  }

  if (path === "/api/transcribe") {
    if (!cfg.elevenlabsKey) return json(res, 503, { error: "ElevenLabs nie jest skonfigurowany" });
    // Formularz (plik + model_id) przekazujemy dalej bez zmian.
    const upstream = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: { "xi-api-key": cfg.elevenlabsKey, "content-type": req.headers["content-type"] ?? "" },
      body: await readBody(req),
    });
    if (!upstream.ok) return json(res, 502, { error: "ElevenLabs odrzucił żądanie", status: upstream.status });
    const data = await upstream.json();
    // Długość nagrania bierzemy z ostatniego rozpoznanego słowa.
    const seconds = Array.isArray(data.words) && data.words.length ? Number(data.words[data.words.length - 1].end) || 0 : 0;
    await record("ElevenLabs", "Napisy", seconds / 60, "min", (seconds / 60) * settings.rates.sttPerMinute);
    return json(res, 200, data);
  }

  if (path === "/api/infographic") {
    if (!cfg.openaiKey) return json(res, 503, { error: "OpenAI nie jest skonfigurowany" });
    const { prompt } = await readJson(req);
    if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 4000) return json(res, 400, { error: "Nieprawidłowy opis" });
    const upstream = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { authorization: `Bearer ${cfg.openaiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ model: cfg.openaiImageModel, prompt, size: "1024x1536" }),
    });
    if (!upstream.ok) return json(res, 502, { error: "OpenAI odrzucił żądanie", status: upstream.status });
    const data = await upstream.json();
    const item = data.data?.[0];
    const image = item?.b64_json ? `data:image/png;base64,${item.b64_json}` : item?.url;
    if (!image) return json(res, 502, { error: "Brak obrazu w odpowiedzi" });
    await record("OpenAI", "Infografika", 1, "obraz", settings.rates.imagePerImage);
    return json(res, 200, { image });
  }

  return json(res, 404, { error: "Nieznana ścieżka API" });
}

/* ───────────── API: panel administratora ───────────── */

function adminState() {
  const cfg = config();
  return {
    persistent,
    integrations: {
      elevenlabs: { key: describeKey(settings.elevenlabsKey, process.env.ELEVENLABS_API_KEY), voiceId: cfg.elevenlabsVoiceId },
      openai: { key: describeKey(settings.openaiKey, process.env.OPENAI_API_KEY), imageModel: cfg.openaiImageModel },
    },
    monthlyBudgetUsd: settings.monthlyBudgetUsd,
    rates: settings.rates,
    usage: usageSummary(),
  };
}

const cleanKey = (value) => (typeof value === "string" ? value.trim().slice(0, 300) : undefined);
const cleanNumber = (value, max) => (Number.isFinite(+value) && +value >= 0 ? Math.min(+value, max) : undefined);

async function adminApi(req, res, path) {
  if (!ADMIN_PASSWORD) {
    return json(res, 503, { error: "Panel administratora jest wyłączony. Ustaw zmienną środowiskową ADMIN_PASSWORD i uruchom serwer ponownie." });
  }

  if (path === "/api/admin/login" && req.method === "POST") {
    if (limited(`login:${clientIp(req)}`, 8, 15 * 60 * 1000)) return json(res, 429, { error: "Za dużo prób logowania. Spróbuj za 15 minut." });
    const { password } = await readJson(req);
    if (!passwordMatches(password ?? "")) return json(res, 401, { error: "Nieprawidłowe hasło" });
    const token = randomBytes(32).toString("hex");
    sessions.set(token, Date.now() + SESSION_MS);
    return json(res, 200, { token });
  }

  if (!isAdmin(req)) return json(res, 401, { error: "Zaloguj się ponownie" });

  if (path === "/api/admin/state" && req.method === "GET") return json(res, 200, adminState());

  if (path === "/api/admin/settings" && req.method === "PUT") {
    const body = await readJson(req);
    // Pole pominięte = bez zmian; pusty tekst = usuń wartość wpisaną w panelu.
    for (const field of ["elevenlabsKey", "elevenlabsVoiceId", "openaiKey", "openaiImageModel"]) {
      const value = cleanKey(body[field]);
      if (value !== undefined) settings[field] = value;
    }
    const budget = cleanNumber(body.monthlyBudgetUsd, 100000);
    if (budget !== undefined) settings.monthlyBudgetUsd = budget;
    if (body.rates && typeof body.rates === "object") {
      for (const rate of Object.keys(DEFAULT_RATES)) {
        const value = cleanNumber(body.rates[rate], 1000);
        if (value !== undefined) settings.rates = { ...settings.rates, [rate]: value };
      }
    }
    await saveSettings();
    return json(res, 200, adminState());
  }

  if (path === "/api/admin/test" && req.method === "POST") {
    const { service } = await readJson(req);
    const cfg = config();
    try {
      if (service === "elevenlabs") {
        if (!cfg.elevenlabsKey) return json(res, 200, { ok: false, message: "Brak klucza" });
        const upstream = await fetch("https://api.elevenlabs.io/v1/user/subscription", { headers: { "xi-api-key": cfg.elevenlabsKey } });
        if (!upstream.ok) return json(res, 200, { ok: false, message: `ElevenLabs odpowiedział kodem ${upstream.status}` });
        const data = await upstream.json();
        return json(res, 200, {
          ok: true,
          message: "Klucz działa",
          account: { plan: data.tier ?? null, used: data.character_count ?? null, limit: data.character_limit ?? null, resetsAt: data.next_character_count_reset_unix ?? null },
        });
      }
      if (service === "openai") {
        if (!cfg.openaiKey) return json(res, 200, { ok: false, message: "Brak klucza" });
        const upstream = await fetch("https://api.openai.com/v1/models", { headers: { authorization: `Bearer ${cfg.openaiKey}` } });
        return json(res, 200, upstream.ok ? { ok: true, message: "Klucz działa" } : { ok: false, message: `OpenAI odpowiedział kodem ${upstream.status}` });
      }
    } catch {
      return json(res, 200, { ok: false, message: "Nie udało się połączyć z usługą" });
    }
    return json(res, 400, { error: "Nieznana usługa" });
  }

  if (path === "/api/admin/voices" && req.method === "GET") {
    const cfg = config();
    if (!cfg.elevenlabsKey) return json(res, 200, { voices: [] });
    try {
      const upstream = await fetch("https://api.elevenlabs.io/v1/voices", { headers: { "xi-api-key": cfg.elevenlabsKey } });
      if (!upstream.ok) return json(res, 200, { voices: [], message: `ElevenLabs odpowiedział kodem ${upstream.status}` });
      const data = await upstream.json();
      return json(res, 200, { voices: (data.voices ?? []).map((v) => ({ id: v.voice_id, name: v.name })) });
    } catch {
      return json(res, 200, { voices: [], message: "Nie udało się pobrać listy głosów" });
    }
  }

  return json(res, 404, { error: "Nieznana ścieżka API" });
}

/* ───────────── Pliki statyczne ───────────── */

async function serveStatic(res, path) {
  const safe = normalize(path).replace(/^(\.\.[/\\])+/, "");
  let file = join(DIST, safe);
  try {
    if (!file.startsWith(DIST) || !(await stat(file)).isFile()) throw new Error("brak pliku");
  } catch {
    file = join(DIST, "index.html"); // routing po stronie klienta
  }
  const type = TYPES[extname(file)] ?? "application/octet-stream";
  res.writeHead(200, { "content-type": type, "cache-control": file.includes("/assets/") ? "public, max-age=31536000, immutable" : "no-cache" });
  res.end(await readFile(file));
}

await loadSettings();
await loadUsage();

createServer(async (req, res) => {
  const path = new URL(req.url ?? "/", "http://localhost").pathname;
  try {
    if (path.startsWith("/api/admin/")) await adminApi(req, res, path);
    else if (path.startsWith("/api/")) await aiApi(req, res, path);
    else await serveStatic(res, path);
  } catch (error) {
    console.error(error);
    // Najczęstsza przyczyna błędu w /api to brak połączenia z dostawcą (ElevenLabs, OpenAI).
    if (!res.headersSent) json(res, path.startsWith("/api/") ? 502 : 500, { error: path.startsWith("/api/") ? "Usługa zewnętrzna nie odpowiada" : "Błąd serwera" });
    else res.end();
  }
}).listen(PORT, () => {
  console.log(`Impuls: http://localhost:${PORT}`);
  if (!ADMIN_PASSWORD) console.log("Panel /admin jest wyłączony — ustaw ADMIN_PASSWORD, żeby go włączyć.");
});
