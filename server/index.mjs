// Serwer Impulsu: serwuje zbudowany frontend (dist) i pośredniczy w wywołaniach AI,
// żeby klucze API nie trafiały do przeglądarki.
//
//   ELEVENLABS_API_KEY   lektor (Text to Speech) i napisy (Speech to Text)
//   ELEVENLABS_VOICE_ID  głos lektora (ID z biblioteki głosów ElevenLabs)
//   OPENAI_API_KEY       infografiki (Images API)
//   OPENAI_IMAGE_MODEL   model obrazów (domyślnie gpt-image-1)
//   PORT                 port serwera (domyślnie 8080)
//
// Uruchomienie: npm run build && npm run server
// Bez kluczy serwer działa, a /api/health zgłasza, że integracje są wyłączone.

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../dist", import.meta.url));
const PORT = Number(process.env.PORT ?? 8080);
const { ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID, OPENAI_API_KEY } = process.env;
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1";
const MAX_BODY = 60 * 1024 * 1024; // nagranie do transkrypcji

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
  res.writeHead(status, { "content-type": "application/json" });
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

async function api(req, res, path) {
  if (path === "/api/health") {
    return json(res, 200, { elevenlabs: Boolean(ELEVENLABS_API_KEY && ELEVENLABS_VOICE_ID), openai: Boolean(OPENAI_API_KEY) });
  }
  if (req.method !== "POST") return json(res, 405, { error: "Dozwolona metoda: POST" });

  if (path === "/api/tts") {
    if (!ELEVENLABS_API_KEY || !ELEVENLABS_VOICE_ID) return json(res, 503, { error: "ElevenLabs nie jest skonfigurowany" });
    const { text } = JSON.parse((await readBody(req)).toString("utf8"));
    if (typeof text !== "string" || !text.trim() || text.length > 600) return json(res, 400, { error: "Nieprawidłowy tekst" });
    const upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
      method: "POST",
      headers: { "xi-api-key": ELEVENLABS_API_KEY, "content-type": "application/json", accept: "audio/mpeg" },
      body: JSON.stringify({ text, model_id: "eleven_multilingual_v2" }),
    });
    if (!upstream.ok) return json(res, 502, { error: "ElevenLabs odrzucił żądanie", status: upstream.status });
    res.writeHead(200, { "content-type": "audio/mpeg" });
    return res.end(Buffer.from(await upstream.arrayBuffer()));
  }

  if (path === "/api/transcribe") {
    if (!ELEVENLABS_API_KEY) return json(res, 503, { error: "ElevenLabs nie jest skonfigurowany" });
    // Formularz (plik + model_id) przekazujemy dalej bez zmian.
    const upstream = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: { "xi-api-key": ELEVENLABS_API_KEY, "content-type": req.headers["content-type"] ?? "" },
      body: await readBody(req),
    });
    if (!upstream.ok) return json(res, 502, { error: "ElevenLabs odrzucił żądanie", status: upstream.status });
    return json(res, 200, await upstream.json());
  }

  if (path === "/api/infographic") {
    if (!OPENAI_API_KEY) return json(res, 503, { error: "OpenAI nie jest skonfigurowany" });
    const { prompt } = JSON.parse((await readBody(req)).toString("utf8"));
    if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 4000) return json(res, 400, { error: "Nieprawidłowy opis" });
    const upstream = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { authorization: `Bearer ${OPENAI_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ model: OPENAI_IMAGE_MODEL, prompt, size: "1024x1536" }),
    });
    if (!upstream.ok) return json(res, 502, { error: "OpenAI odrzucił żądanie", status: upstream.status });
    const data = await upstream.json();
    const item = data.data?.[0];
    const image = item?.b64_json ? `data:image/png;base64,${item.b64_json}` : item?.url;
    return image ? json(res, 200, { image }) : json(res, 502, { error: "Brak obrazu w odpowiedzi" });
  }

  return json(res, 404, { error: "Nieznana ścieżka API" });
}

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

createServer(async (req, res) => {
  const path = new URL(req.url ?? "/", "http://localhost").pathname;
  try {
    if (path.startsWith("/api/")) await api(req, res, path);
    else await serveStatic(res, path);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) json(res, 500, { error: "Błąd serwera" });
    else res.end();
  }
}).listen(PORT, () => console.log(`Impuls: http://localhost:${PORT}`));
