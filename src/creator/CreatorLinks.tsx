import { useState } from "react";
import { Link2, Mail } from "lucide-react";
import { campaigns, creator, emailSnippets, nf, tools, videos } from "@/data/mock";
import { Card } from "@/components/ui/Card";
import { CopyButton } from "@/components/ui/CopyButton";
import { PageHeader, inputClass, labelClass } from "./CreatorLayout";

const materials = [
  { id: "kanal", label: "Cały kanał (wideo powitalne + materiał na start)" },
  ...videos.slice(1).map((v) => ({ id: v.id, label: `Wideo: ${v.title}` })),
  ...tools.map((t) => ({ id: t.id, label: `Narzędzie: ${t.title}` })),
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Linki i kampanie: generator linku do prywatnego materiału + gotowe CTA do maila. */
export default function CreatorLinks() {
  const [material, setMaterial] = useState("kanal");
  const [campaign, setCampaign] = useState("Newsletter 25 listopada");

  const path = material === "kanal" ? "" : `/${material}`;
  const source = slugify(campaign);
  const url = `https://impuls.app/k/${creator.slug}${path}${source ? `?z=${source}` : ""}`;

  return (
    <div>
      <PageHeader
        title="Linki i kampanie"
        lead="Odbiorcy trafiają do Impulsu wyłącznie przez Twój link. Wygeneruj go, wklej w maila i sprawdź, która kampania przyprowadziła najbardziej zaangażowanych."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Link2 className="size-5 text-violet-600" /> Generator linku
          </h2>
          <div className="mt-4 space-y-4">
            <label className={labelClass}>
              Co odbiorca dostaje po kliknięciu
              <select className={inputClass} value={material} onChange={(e) => setMaterial(e.target.value)}>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Nazwa kampanii
              <input className={inputClass} value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="np. Newsletter 25 listopada" />
              <span className="mt-1 block text-xs font-normal text-ink-400">Tylko dla Ciebie — po niej rozpoznasz źródło w statystykach.</span>
            </label>
          </div>
          <div className="mt-5 rounded-xl bg-ink-900 p-4">
            <p className="text-xs font-semibold text-ink-300">Twój link</p>
            <p className="mt-1 font-mono text-sm break-all text-volt-400">{url}</p>
            <div className="mt-3">
              <CopyButton text={url} label="Kopiuj link" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Mail className="size-5 text-violet-600" /> Tekst CTA do maila
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            Nie pisz „pobierz aplikację”. Obiecaj konkretny materiał — aplikacja jest tylko miejscem odbioru.
          </p>
          <ul className="mt-4 space-y-3">
            {emailSnippets.map((s) => (
              <li key={s.id} className="rounded-xl border border-line p-3.5">
                <p className="text-xs font-semibold text-ink-400">{s.label}</p>
                <p className="mt-1 text-[15px] font-medium">
                  <span className="text-violet-700 underline decoration-violet-300 underline-offset-4">{s.text}</span> →
                </p>
                <div className="mt-3">
                  <CopyButton text={`${s.text}: ${url}`} label="Kopiuj z linkiem" />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <h2 className="mt-9 mb-3 text-lg font-bold">Kampanie</h2>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs text-ink-400">
            <tr>
              <th className="px-5 py-3 font-semibold">Kampania</th>
              <th className="px-3 py-3 font-semibold">Materiał</th>
              <th className="px-3 py-3 text-right font-semibold">Kliknięcia</th>
              <th className="px-3 py-3 text-right font-semibold">Dołączyli</th>
              <th className="px-5 py-3 text-right font-semibold">Konwersja</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {campaigns.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-3">
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-ink-400">{c.date}</p>
                </td>
                <td className="px-3 py-3 text-ink-600">{c.material}</td>
                <td className="px-3 py-3 text-right tabular-nums">{nf.format(c.clicks)}</td>
                <td className="px-3 py-3 text-right tabular-nums">{nf.format(c.joined)}</td>
                <td className="px-5 py-3 text-right font-semibold tabular-nums">{Math.round((c.joined / c.clicks) * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
