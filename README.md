# Impuls

Frontend aplikacji **Impuls** — prywatnych kanałów aktywacji od twórców, ekspertów i firm.
Email informuje. Impuls aktywuje.

React 19 · TypeScript · Tailwind CSS 4 · Vite · React Router · framer-motion · lucide-react · Capacitor 8.
Bez backendu — wszystkie dane to mock (`src/data/mock.ts`), a aktywność odbiorcy zapisuje się w `localStorage`.

Strategia produktu, mapa ekranów i kluczowe teksty: [`docs/STRATEGIA.md`](docs/STRATEGIA.md).

## Uruchomienie

```bash
npm install
npm run dev
```

```bash
npm run build
```

## Trasy

| Trasa | Widok |
| --- | --- |
| `/` | `LandingPage` |
| `/k/:slug` | `CreatorInvitePage` — zaproszenie do kanału (wejście z linku twórcy) |
| `/app/start` | `OnboardingPage` — konto → wideo powitalne → zasady odblokowania czatu |
| `/app` | `UserChannelHome` |
| `/app/wideo`, `/app/wideo/:id` | `UserVideosPage`, `UserVideoPage` |
| `/app/narzedzia`, `/app/narzedzia/:id` | `UserToolsPage`, `UserToolPage` |
| `/app/pliki` | `UserFilesPage` |
| `/app/czat` | `UserChatUnlockPage` lub `UserChatPage` (zależnie od aktywności) |
| `/app/profil`, `/app/powiadomienia` | `UserProfilePage`, `UserNotificationsPage` |
| `/studio` | `CreatorDashboard` |
| `/studio/kanal` | `CreatorChannelSettings` |
| `/studio/impuls` | `CreatorCreateImpulse` |
| `/studio/materialy` | `CreatorMaterials` |
| `/studio/odbiorcy`, `/studio/ambasadorzy` | `CreatorAudience`, `CreatorAmbassadors` |
| `/studio/interakcje` | `CreatorInteractions` |
| `/studio/analityka` | `CreatorAnalytics` |
| `/studio/linki` | `CreatorLinks` |
| `/studio/ustawienia` | `CreatorSettings` |

Do `/app` nie da się wejść bez zaproszenia — niezalogowany odbiorca jest przekierowany na `/k/marta-zielinska`.
Demo resetuje się w Profilu („Zresetuj demo”).

## Struktura

```
src/
  landing/      landing page (sekcje jako osobne komponenty)
  recipient/    aplikacja odbiorcy
  creator/      panel twórcy (ładowany leniwie)
  components/   współdzielone UI (Button, Card, Badge, ProgressBar, UnlockProgress…)
  state/        progress.tsx — aktywność odbiorcy i reguły odblokowania czatu
  data/         mock.ts — dane przykładowe
```

Tokeny designu (kolory `ink-*`, `volt-*`, fonty) są w `src/index.css` w bloku `@theme`.

## Co jest mockiem

- Odtwarzacz wideo jest symulowany: „odtwarzanie” trwa 5 sekund i zalicza materiał jako obejrzany.
- Pobieranie narzędzi/plików, upload w kreatorze impulsu, zapisy ustawień i wysyłka wiadomości zmieniają tylko stan lokalny.
- Liczby w panelu twórcy oraz persona „Marta Zielińska” są fikcyjne.

## Capacitor (iOS / Android)

Projekt jest przygotowany pod Capacitor: `capacitor.config.ts` (`webDir: dist`), `viewport-fit=cover`,
utilities `pt-safe` / `pb-safe` dla notcha i paska gestów, brak zależności od hovera, routing po stronie klienta.
Natywne projekty nie są w repo — generuje się je lokalnie (iOS wymaga macOS + Xcode, Android — Android Studio):

```bash
npx cap add ios
```

```bash
npx cap add android
```

```bash
npm run cap:ios
```

```bash
npm run cap:android
```

Przed publikacją w sklepach:

- podmień `appId` w `capacitor.config.ts` na docelowy bundle identifier,
- skonfiguruj Universal Links / App Links dla `/k/:slug`, żeby link z maila otwierał kanał w aplikacji,
- dodaj `@capacitor/push-notifications` (nowe impulsy) i `@capacitor/app` (obsługa deep linków i przycisku wstecz),
- w aplikacji natywnej ustaw trasę startową na `/app` zamiast landing page.
