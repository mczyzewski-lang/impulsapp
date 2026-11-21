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
| `/s/:slug` | `PublicSignupPage` — publiczna strona zapisu twórcy; po zapisie podgląd maila z linkiem do kanału |
| `/k/:slug` | `CreatorInvitePage` — zaproszenie do kanału (wejście z linku twórcy) |
| `/app/start` | `OnboardingPage` — konto → wideo powitalne → zasady odblokowania czatu |
| `/app` | `UserChannelHome` |
| `/app/wideo`, `/app/wideo/:id` | `UserVideosPage` — pełnoekranowy feed (najświeższe na górze) z przełącznikiem na listę; `:id` otwiera feed od wskazanego materiału |
| `/app/narzedzia`, `/app/narzedzia/:id` | `UserToolsPage`; narzędzie otwiera się w arkuszu `ToolSheet` nad bieżącym ekranem |
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
| `/studio/strona` | `CreatorSignupPage` — edytor strony zapisu i automatycznych maili |
| `/studio/linki` | `CreatorLinks` |
| `/studio/ustawienia` | `CreatorSettings` |

Do `/app` nie da się wejść bez zaproszenia — niezalogowany odbiorca jest przekierowany na `/k/marta-zielinska`.
Odbiorca może należeć do wielu kanałów: nagłówek kanału to przełącznik, a drugi kanał demo (`/k/piotr-malec`) czeka w nim jako zaproszenie.
Aktywność i odblokowanie czatu liczą się osobno dla każdego kanału.

Aplikacja odbiorcy jest w całości ciemna (klasa `theme-dark` w `src/index.css` podmienia wartości tokenów kolorów,
a `theme-base` przywraca je na wideo i kolorowych kartach), więc nagłówek i nawigacja wyglądają tak samo na każdej zakładce.

Aplikacja odbiorcy ma stałą powłokę: nagłówek i dolna nawigacja stoją w miejscu, przewija się tylko treść
(na desktopie wewnątrz ramki telefonu). Szczegóły — narzędzie, wnioski z wideo, lista kanałów — otwierają się jako warstwy
nad ekranem, zamiast przenosić użytkownika do innej zakładki.
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

- Wideo jest symulowane: aktywny materiał w feedzie „gra” 5 sekund i wtedy liczy się jako obejrzany.
  Dopuszczalne formaty to 9:16, 1:1 i 16:9 (`Video.format`); pionowe wypełnia ekran, pozostałe są wyśrodkowane na rozmytym tle.
- Strona zapisu nie wysyła maili — po zapisie pokazuje podgląd wiadomości. Treść strony edytowana w panelu zapisuje się w `localStorage`.
- Awatary twórców to ilustracje SVG (`components/ui/Avatar.tsx`); docelowo zastąpi je zdjęcie wgrane przez twórcę.
- Pobieranie narzędzi/plików, upload w kreatorze impulsu, zapisy ustawień i wysyłka wiadomości zmieniają tylko stan lokalny.
- Liczby w panelu twórcy oraz persona „Marta Zielińska” są fikcyjne.

## Domena

Strona i aplikacja webowa działają pod **impuls.app** (stała w `src/config.ts`). Linki do kanałów mają postać
`https://impuls.app/k/<twórca>`. Hosting musi przekierowywać nieznane ścieżki na `index.html` (routing po stronie klienta),
inaczej bezpośrednie wejście na `/k/...` z maila zwróci 404.

## Capacitor (iOS / Android)

Co jest przygotowane:

- `capacitor.config.ts` (`webDir: dist`, `appId: app.impuls.mobile`), zależności `@capacitor/core`, `ios`, `android`, `app`;
- `src/native/NativeBridge.tsx`: link `https://impuls.app/...` otwarty na telefonie prowadzi do właściwego ekranu,
  a systemowy „wstecz” na Androidzie cofa w historii zamiast zamykać aplikację;
- w aplikacji natywnej trasa `/` od razu przechodzi do `/app` (bez strony marketingowej);
- stała powłoka aplikacji (`h-dvh`, przewija się tylko treść), `viewport-fit=cover` i utilities `pt-safe` / `pb-safe`;
- pola formularzy mają 16 px na telefonie, więc iOS nie przybliża ekranu przy wpisywaniu;
- fonty i wszystkie zasoby są w paczce — aplikacja nie pobiera nic z zewnętrznych serwerów.

Sprawdzone: `npx cap add android`, `npx cap add ios` i `npx cap sync` przechodzą na tym repo (zasoby webowe i wtyczka
`@capacitor/app` trafiają do obu projektów). Kompilacja natywna nie była uruchamiana — wymaga Xcode i Android Studio.

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

- potwierdź `appId` w `capacitor.config.ts` (`app.impuls.mobile`) — po pierwszej publikacji nie da się go zmienić,
- skonfiguruj Universal Links / App Links dla `https://impuls.app/k/*`, żeby link z maila otwierał kanał w aplikacji:
  na serwerze `impuls.app` muszą być dostępne `/.well-known/apple-app-site-association` (iOS)
  i `/.well-known/assetlinks.json` (Android), a w projektach natywnych — Associated Domains `applinks:impuls.app`
  oraz intent-filter z `android:autoVerify="true"`,
- dodaj `@capacitor/push-notifications` (nowe impulsy),
- przenieś stan z `localStorage` do `@capacitor/preferences` lub na backend — iOS może czyścić `localStorage` przy braku miejsca,
- przygotuj ikonę i splash screen (`@capacitor/assets`).
