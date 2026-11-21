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
| `/tworcy` | `CreatorsLanding` — podstrona dla twórców: prompter i studio wideo |
| `/s/:slug` | `PublicSignupPage` — publiczna strona zapisu twórcy; po zapisie podgląd maila z linkiem do kanału |
| `/e/:slug` | `EmbedSignupPage` — sam formularz zapisu do osadzenia w iframe na stronie twórcy (`?motyw=jasny`, `?naglowek=0`) |
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
| `/studio/nagraj` | `CreatorRecorder` — nagrywanie z kamery z prompterem (hook + treść / pytanie + treść) |
| `/studio/montaz/:id` | `CreatorVideoStudio` — studio wideo: przycinanie, napisy, infografiki w stylu marki |
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

## Studio wideo i integracje AI

Nagrywanie (`/studio/nagraj`) używa prawdziwej kamery i mikrofonu przeglądarki (`getUserMedia` + `MediaRecorder`), więc wymaga
HTTPS albo `localhost`. Nagrania żyją w pamięci karty — po odświeżeniu znikają, bo nie ma backendu, który by je przechował.

Integracje działają przez serwer pośredniczący `server/index.mjs` (klucze API nie mogą trafić do przeglądarki):

| Ścieżka | Usługa | Do czego |
| --- | --- | --- |
| `POST /api/tts` | ElevenLabs Text to Speech | lektor czytający pytanie w prompterze |
| `POST /api/transcribe` | ElevenLabs Speech to Text | napisy z nagrania |
| `POST /api/infographic` | OpenAI Images | infografiki w stylu marki |
| `GET /api/health` | — | informuje frontend, które integracje są włączone |

```bash
npm run build
```

```bash
ADMIN_PASSWORD=twoje-haslo npm start
```

Serwer serwuje też zbudowany frontend (`dist`) z routingiem po stronie klienta. `railway.json` ustawia `npm start`
jako komendę startową. Jeśli frontend i serwer stoją pod różnymi adresami, ustaw `VITE_API_URL` przy budowaniu.

### Panel administratora (`/admin`)

Klucze API wpisuje się w panelu `/admin`, nie w kodzie. Panel działa tylko wtedy, gdy na serwerze jest ustawiona
zmienna `ADMIN_PASSWORD` — to hasło logowania.

- **Klucze:** ElevenLabs (klucz + głos lektora, listę głosów można pobrać z konta) i OpenAI (klucz + model obrazów).
  Serwer zapisuje je w `DATA_DIR/settings.json` i nigdy nie odsyła do przeglądarki — panel pokazuje tylko 4 ostatnie znaki.
  „Sprawdź połączenie” weryfikuje klucz u dostawcy; dla ElevenLabs pokazuje też zużycie kredytów na koncie.
- **Wydatki:** każde płatne wywołanie trafia do dziennika (`DATA_DIR/usage.jsonl`) z liczbą znaków, minut albo obrazów.
  Koszt to szacunek liczony ze stawek ustawianych w panelu — wartości startowe są orientacyjne i trzeba je zastąpić
  własnym cennikiem.
- **Limit miesięczny:** po jego przekroczeniu serwer przestaje wywoływać płatne usługi, a studio wraca do trybu demo.
  Dodatkowo każdy adres IP ma limit 30 wywołań AI na 10 minut.

| Zmienna | Znaczenie |
| --- | --- |
| `ADMIN_PASSWORD` | hasło do `/admin`; bez niego panel jest wyłączony |
| `DATA_DIR` | katalog na ustawienia i dziennik (domyślnie `./data`). Na hostingu z ulotnym dyskiem (np. Railway) podłącz trwały wolumen i wskaż go tutaj — inaczej klucze i dziennik znikną przy każdym wdrożeniu |
| `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `OPENAI_API_KEY`, `OPENAI_IMAGE_MODEL` | alternatywa dla panelu; wartość wpisana w panelu ma pierwszeństwo |

Ograniczenia: jest jedno hasło administratora (bez kont użytkowników), a endpointy AI są publiczne — chroni je limit
na adres IP i budżet, nie logowanie twórcy. Przed produkcją trzeba je powiązać z kontami.

Bez serwera albo bez kluczy studio działa w trybie demo: lektor mówi głosem systemowym przeglądarki, napisy powstają
z tekstu promptera rozłożonego równo na czas nagrania, a infografiki są składane lokalnie z treści scenariusza.
Wywołania do ElevenLabs i OpenAI nie były testowane na żywych kluczach.

Czego studio jeszcze nie robi: nie eksportuje zmontowanego pliku. Przycięcie, napisy i plansze widać w podglądzie,
ale „wypalenie” ich w wideo wymaga renderowania po stronie serwera.

## Co jest mockiem

- Kanał Marty ma prawdziwe pliki wideo (`public/videos`, 5 klipów po 6 sekund, bez dźwięku) i zdjęcie twórczyni
  (`public/creators`). Zdjęcie i klipy zostały wygenerowane przez AI — Marta jest postacią fikcyjną. Materiał liczy się
  jako obejrzany po odtworzeniu do końca. Kanał Piotra nie ma plików: tam odtwarzanie jest symulowane (5 sekund).
  Dopuszczalne formaty to 9:16, 1:1 i 16:9 (`Video.format`); pionowe wypełnia ekran, pozostałe są wyśrodkowane na rozmytym tle.
- Strona zapisu nie wysyła maili — po zapisie pokazuje podgląd wiadomości. Treść strony edytowana w panelu zapisuje się w `localStorage`.
- Awatar twórcy to zdjęcie z `public/creators`, a gdy go nie ma — ilustracja SVG (`components/ui/Avatar.tsx`).
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
- przygotuj ikonę i splash screen (`@capacitor/assets`),
- dodaj uprawnienia do kamery i mikrofonu dla nagrywania wideo: w `ios/App/App/Info.plist` klucze
  `NSCameraUsageDescription` i `NSMicrophoneUsageDescription`, a w `android/app/src/main/AndroidManifest.xml`
  uprawnienia `CAMERA`, `RECORD_AUDIO` i `MODIFY_AUDIO_SETTINGS`.
