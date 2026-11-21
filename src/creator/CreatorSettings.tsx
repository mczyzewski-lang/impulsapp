import { useState } from "react";
import { Check } from "lucide-react";
import { creator } from "@/data/mock";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { PageHeader, inputClass, labelClass } from "./CreatorLayout";

const notificationOptions = [
  { id: "ambassador", label: "Nowy ambasador w kanale", initial: true },
  { id: "message", label: "Nowa wiadomość od odbiorcy", initial: true },
  { id: "weekly", label: "Cotygodniowe podsumowanie zaangażowania", initial: true },
  { id: "cold", label: "Odbiorca stał się zimny", initial: false },
];

export default function CreatorSettings() {
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(notificationOptions.map((o) => [o.id, o.initial])),
  );
  const [saved, setSaved] = useState(false);

  return (
    <div className="max-w-3xl">
      <PageHeader title="Ustawienia" lead="Konto, profil twórcy i powiadomienia." />

      <div className="space-y-5">
        <Card className="p-5">
          <h2 className="text-lg font-bold">Profil twórcy</h2>
          <div className="mt-4 flex items-center gap-4">
            <Avatar name={creator.name} size="lg" />
            <Button variant="outline" size="sm">Zmień zdjęcie</Button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Imię i nazwisko lub nazwa firmy
              <input className={inputClass} defaultValue={creator.name} />
            </label>
            <label className={labelClass}>
              Adres kanału
              <input className={inputClass} defaultValue={`impuls.app/k/${creator.slug}`} />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              Czym się zajmujesz
              <input className={inputClass} defaultValue={creator.role} />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              Bio
              <textarea className={inputClass} rows={3} defaultValue={creator.bio} />
            </label>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-bold">Powiadomienia</h2>
          <div className="mt-2 divide-y divide-line">
            {notificationOptions.map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-4 py-3">
                <span className="text-[15px] font-medium">{o.label}</span>
                <Toggle checked={toggles[o.id]} onChange={(v) => setToggles((t) => ({ ...t, [o.id]: v }))} label={o.label} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-bold">Lista emailowa</h2>
          <p className="mt-1 text-sm text-ink-500">
            Impuls nie wysyła maili za Ciebie. Nadal korzystasz ze swojego narzędzia do newslettera — tutaj tylko generujesz linki, które w nim wklejasz.
          </p>
        </Card>

        <Button variant="dark" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>
          {saved && <Check className="size-4.5" />}
          {saved ? "Zapisano" : "Zapisz ustawienia"}
        </Button>
      </div>
    </div>
  );
}
