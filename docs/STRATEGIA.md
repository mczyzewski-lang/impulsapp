# Impuls — strategia UX, struktura i teksty

## 1. Strategia produktu

**Czym jest Impuls.** Prywatny kanał aktywacji najlepszych odbiorców. Email pozostaje kanałem dystrybucji;
Impuls to miejsce, do którego najbardziej zaangażowani „awansują” z listy emailowej.

**Trzy zasady, z których wynika cały UX:**

1. **Wejście tylko przez twórcę.** Nie ma discovery, feedu ani algorytmu. Pierwszym ekranem odbiorcy jest
   zaproszenie konkretnej osoby (`/k/:slug`), nie strona główna aplikacji. W profilu odbiorca widzi wyłącznie kanały,
   do których go zaproszono.
2. **Obiecujemy materiał, nie aplikację.** CTA zawsze nazywa to, co odbiorca dostaje
   („Odbierz materiał i dołącz do kanału”), nigdy „Pobierz aplikację”. Panel twórcy podpowiada to samo przy tekstach do maila.
3. **Interakcja jest nagrodą za działanie.** Czat odblokowuje się po 3 wideo, 1 narzędziu i 1 odpowiedzi.
   Postęp jest widoczny na starcie kanału, pod każdym wideo i w zakładce Czat. Po odblokowaniu to nadal nie messenger:
   jedna wiadomość na impuls, pytania twórcy, wybrane pytania publikowane dla wszystkich.

**Dwie drogi do kanału.** Twórca z własną listą wkleja link do kanału w swoje maile. Twórca bez listy (albo chcący ją
powiększyć) udostępnia stronę zapisu w Impulsie (`impuls.app/s/<twórca>`): zapisana osoba dostaje gotowe maile z linkiem
do kanału i krótkie zapowiedzi nowych impulsów („tu jest więcej materiału”). W obu przypadkach email dociera, a Impuls aktywuje.

**Dwie grupy, dwa hasła:**

- Odbiorca: „Impulsy do działania od ludzi, którym ufasz.”
- Twórca: „Zamień swoją listę emailową w kanał ambasadorów.”

**Pętla wartości:** mail z linkiem → zaproszenie → konto → wideo powitalne + obiecany materiał → impuls co tydzień
(wideo + narzędzie) → odblokowany czat → ambasador. Twórca widzi tę samą pętlę jako lejek i scoring
(zimny → ciepły → aktywny → ambasador).

## 2. Struktura landing page

| # | Sekcja | Cel | Główny komunikat |
| --- | --- | --- | --- |
| 1 | Hero | Pozycjonowanie + dwa CTA | „Zamień swoją listę emailową w kanał ambasadorów.” |
| 2 | Pasek | Kontrast w jednym zdaniu | „Email informuje. Impuls aktywuje.” |
| 3 | Jak to działa | Mechanizm w 3 krokach | „Od maila do ambasadora w trzech krokach” |
| 4 | Dla twórców | Korzyści biznesowe | „Twoi najlepsi odbiorcy zasługują na coś więcej niż kolejny mail.” |
| 5 | Email i Impuls | Rozbroić obawę „mam już newsletter” | „Nie rezygnujesz z emaila. Dajesz mu ciąg dalszy.” |
| 6 | Dla odbiorców | Korzyści odbiorcy | „Odbierz prywatny materiał od twórcy, któremu ufasz.” / „Nie obserwuj biernie. Wdrażaj.” |
| 7 | Przykładowy kanał | Pokazać produkt | „Wideo, narzędzia, pliki i kontrolowana interakcja w jednym miejscu.” |
| 8 | Odblokuj czat | Wyróżnik (interaktywne demo) | „Dostęp do twórcy dostają ci, którzy działają.” |
| 9 | Zastosowania | 6 use case’ów | „Jeden mechanizm, wiele sposobów użycia” |
| 10 | FAQ | Obiekcje | m.in. „Czy Impuls zastępuje mój newsletter?” |
| 11 | Final CTA | Domknięcie | „Daj odbiorcom powód, żeby wracali.” |

CTA twórcy: **„Stwórz kanał w Impulsie”**. CTA odbiorcy: **„Odbierz prywatny materiał”** (prowadzi do przykładowego zaproszenia).
Na stronie nie ma katalogu twórców, liczników użytkowników ani opinii — nic, co sugerowałoby marketplace.

## 3. Mapa ekranów — odbiorca

```
Link w mailu
  └─ Zaproszenie do kanału (/k/:slug)           kto zaprasza, co dostajesz, jedno CTA
       └─ Onboarding (/app/start)
            1. Konto (imię + email)
            2. Wideo powitalne
            3. Jak odblokować czat
            └─ Kanał (/app) — dolna nawigacja: Start · Wideo · Narzędzia · Pliki · Czat
                 ├─ Start         impuls tygodnia, narzędzie, postęp odblokowania, pytanie, bonus
                 ├─ Wideo         pionowy, pełnoekranowy feed (przesunięcie = kolejny materiał),
                 │                boczne akcje: Wnioski · Narzędzie · Dalej
                 ├─ Narzędzia     lista; checklista otwiera się w arkuszu nad ekranem
                 ├─ Pliki         materiały bonusowe i dokumenty
                 └─ Czat          zablokowany: 3 kroki + pytanie twórcy
                                  odblokowany: odpowiedź, jedna wiadomość, wybrane pytania
            Nagłówek: przełącznik kanałów (kanały + oczekujące zaproszenia) · Powiadomienia · Profil
```

## 4. Mapa ekranów — panel twórcy

| Ekran | Do czego służy |
| --- | --- |
| Dashboard | 7 KPI (zaproszeni → odblokowali czat), wykres aktywnych, lejek awansu, top odbiorcy, ostatnie odpowiedzi |
| Mój kanał | Nazwa i obietnica, wideo powitalne, warunki odblokowania czatu, tryb interakcji, podgląd zaproszenia na żywo |
| Dodaj impuls | Tytuł, opis, wideo, checklista, plik, CTA, powiadomienie — z podglądem u odbiorcy; po publikacji link do maila |
| Materiały | Wideo / Narzędzia / Pliki ze statystykami; nagrania z aplikacji mają przycisk „Studio wideo” |
| Nagraj wideo | Kamera z prompterem: własna treść w układzie hook + treść (czyta twórca) albo pytanie + treść (pytanie czyta lektor) |
| Studio wideo | Przycinanie, napisy z transkrypcji, infografiki w kolorach marki, oś czasu z podglądem |
| Odbiorcy | CRM: segmenty zimny / ciepły / aktywny / ambasador, wynik 0–100, wyszukiwarka |
| Ambasadorzy | Najbardziej zaangażowani, szybkie akcje, lista „blisko awansu” |
| Czat i interakcje | Aktualne pytanie, odpowiedzi (wyróżnianie), wiadomości (odpowiedz prywatnie / opublikuj), insighty |
| Analityka | Wskaźniki przejścia, aktywni w czasie, odblokowania, lejek, skuteczność impulsów |
| Strona zapisu | Własny landing twórcy: edycja treści z podglądem na żywo, adres do udostępnienia, trzy automatyczne maile, statystyki zapisów |
| Linki i kampanie | Generator linku do prywatnego materiału, gotowe CTA do maila, wyniki kampanii |
| Ustawienia | Profil twórcy, powiadomienia |

## 5. Styl wizualny

- **Baza:** granat `ink-900 #0B1020` (hero, sidebar, karty kluczowe), jasne tło `paper #F5F6FA`, biel kart.
- **Akcent energetyczny:** limonka `volt-400 #C8F542` — zarezerwowana dla głównego CTA, postępu i stanu „odblokowane”.
- **Akcent pomocniczy:** fiolet (linki, etykiety, wykresy), żeby limonka nie traciła znaczenia.
- **Typografia:** Bricolage Grotesque (nagłówki, liczby) + Inter (tekst). Fonty są w paczce — działają offline w Capacitorze.
- **Kształt:** duże zaokrąglenia (16–40 px), cienkie obramowania, minimalne cienie; subtelna siatka na ciemnych tłach.
- **Aplikacja odbiorcy jest ciemna** na wszystkich zakładkach (jak feed wideo); landing i panel twórcy pozostają jasne z ciemnymi akcentami.
- **Mobile-first:** aplikacja odbiorcy to jedna kolumna z dolną nawigacją (na desktopie w ramce telefonu);
  panel twórcy ma sidebar na desktopie i wysuwane menu na telefonie. Pola dotykowe ≥ 40 px, obsługa safe area.

## 6. Kluczowe teksty

**Landing**

- Nadtytuł: „Nie kolejny newsletter. Prywatny kanał aktywacji.”
- H1: „Zamień swoją listę emailową w kanał ambasadorów.”
- Lead: „Impuls to prywatny kanał dla Twoich najbardziej zaangażowanych odbiorców. Wideo, narzędzia, pliki
  i kontrolowana interakcja w jednym miejscu — zamiast kolejnego maila, który zginie w skrzynce.”
- Pod CTA: „Masz link od twórcy? Otwórz go — trafisz prosto do jego kanału.”
- Kroki: „Wysyłasz maila z jednym linkiem” → „Najbardziej zaangażowani awansują” → „Aktywność odblokowuje interakcję”.

**Aplikacja odbiorcy**

- Zaproszenie: „Marta Zielińska zaprasza Cię do kanału” · CTA „Odbierz materiał i dołącz do kanału” ·
  „Bez feedu i reklam. Widzisz tylko kanały, do których Cię zaproszono.”
- Onboarding: „Załóż konto, żeby odebrać materiał” · „Czat z Martą odblokujesz aktywnością”.
- Postęp: „Odblokuj czat z twórcą: 1/3 kroków wykonane”.
- Czat: „Masz jedną wiadomość na ten impuls. Zadaj pytanie, na którym najbardziej Ci zależy.” ·
  „To nie jest otwarty komunikator. Jedna przemyślana wiadomość na impuls sprawia, że Marta może przeczytać każdą.”

**Panel twórcy**

- Dashboard: „Tak wygląda awans z Twojej listy emailowej do kanału ambasadorów.”
- Dodaj impuls: „Impuls to jedna myśl i jedno działanie: krótkie wideo, narzędzie do wdrożenia i wyraźny następny krok.”
- Analityka: „Nie otwarcia, tylko działania: kto obejrzał, pobrał, odpowiedział i kliknął.”
- Linki: „Nie pisz »pobierz aplikację«. Obiecaj konkretny materiał — aplikacja jest tylko miejscem odbioru.”

**CTA do maila (gotowe do wklejenia)**

1. „Odbierz prywatne wideo i checklistę w Impulsie”
2. „Nagrałam dla Ciebie krótkie wideo i dołożyłam checklistę. Odbierz je w moim prywatnym kanale w Impulsie”
3. „Odbierz prywatny materiał i dołącz do kanału, w którym co tydzień wysyłam krótkie impulsy do działania”

## 7. Wizja: od promptu do własnej publiczności

Impuls jako jedna pętla dla twórcy, który rośnie organicznie:

| Krok | Co robi twórca | Stan w prototypie |
| --- | --- | --- |
| 1. Treść | Wyciąga wiedzę ze swoich rozmów z czatem AI i wkleja ją do Impulsu | jest (ekran „Treści”) |
| 2. Nagranie | Nagrywa z ręki z prompterem | jest |
| 3. Montaż | Napisy, plansze w stylu marki, przycięcie | jest (podgląd; bez eksportu pliku) |
| 4. Dystrybucja | Publikuje w social mediach i w kanale, z planowaniem | jest (social przez Upload-Post) |
| 5. Przechwycenie | Link w bio → strona zapisu → newsletter | jest strona zapisu i formularz do osadzenia |
| 6. Newsletter | Ciąg maili od dnia zapisu, z tych samych myśli co wideo | ciąg i jego ustawienia są; wysyłki jeszcze nie ma |
| 7. Awans | Po zapisie zaproszenie do kanału w Impulsie | jest |
| 8. Relacja | Impulsy, narzędzia, czat odblokowany aktywnością, scoring | jest |

Kroki 1–4 przyciągają twórców (darmowe narzędzie do organicznych zasięgów), kroki 5–8 dają im własną publiczność,
a Impulsowi — użytkowników po stronie odbiorców.

### Gdzie zarabiać

Publikowanie i wysyłanie maili to silnik wzrostu: każda publikacja i każdy mail przyprowadza nowych odbiorców do Impulsu.
Ograniczanie ich paywallem hamuje to, co ma rosnąć. Dlatego:

- **Nie pobierać opłat za**: nagrywanie, podstawowy montaż, publikację, stronę zapisu, kanał.
- **Zarabiać na pieniądzu, który przechodzi przez Impuls**: prowizja od sprzedaży w kanale (produkty cyfrowe, płatne
  kanały, konsultacje), opłata za kwalifikowanego leada dla firm B2B, CRM i automatyzacje dla zespołów.
- **Limity tylko tam, gdzie jest realny koszt krańcowy** — jako bezpiecznik, nie cennik: AI w montażu, wysyłka maili
  powyżej uczciwego progu, profil u dostawcy social.

Koszty, które trzeba pilnować w darmowym modelu:

- **Profil social kosztuje za sztukę**, niezależnie od aktywności (rząd 2 USD miesięcznie przy większych planach
  Upload-Post). Podpięcie kont warto odblokowywać po aktywacji, np. po pierwszym opublikowanym impulsie.
- **Email**: koszt wysyłki i reputacja domeny. Darmowy limit warto wiązać z zaangażowaniem listy, nie z jej rozmiarem.
- **AI**: napisy są tanie, obrazy i lektor droższe — stąd budżet miesięczny w panelu administratora.

### Dostawca publikacji w social mediach

Potrzebny model: jedna umowa platformy, wielu użytkowników podpina własne konta. Stan na listopad 2026, według stron
dostawców i porównań (ceny do potwierdzenia przed zakupem):

| Dostawca | Rozliczenie | Uwagi |
| --- | --- | --- |
| Upload-Post | za profil: ok. 50 USD / 25 profili, 147 USD / 75, 438 USD / 225 | white-label od planu Professional, link do podpięcia kont ważny 48 h; wybrany w prototypie |
| Ayrshare | za profil, od ok. 149 USD miesięcznie | najdłużej na rynku, najszersza lista platform, najdrożej |
| bundle.social | bez limitu kont, ok. 100 USD za 10 000 postów | rozdzielenie klientów przez „zespoły”; sprzeczne dane o cenie planów wieloużytkownikowych |
| Post for Me, Outstand | za post, konta bez limitu | tanie przy wielu mało aktywnych użytkownikach |

Przy modelu „jak najwięcej darmowych twórców” rozliczenie za post skaluje się lepiej niż za profil — warto to policzyć
przed podpisaniem dłuższej umowy.

## 8. Treści z czatu: jak twórca wnosi swoją wiedzę

Twórca ma już swoją wiedzę wypowiedzianą — w rozmowach z ChatGPT, Claude czy innym czatem. Zamiast budować własny
generator treści, Impuls korzysta z tego, że tamten czat zna jego rozmowy i język.

1. **Prompt z Impulsu.** Ekran „Treści” daje gotowy prompt w dwóch wersjach: „z całej historii” (dla czatów z pamięcią)
   i „z jednej rozmowy” (wklejany na końcu wątku). Twórca ustawia grupę docelową i liczbę myśli.
2. **Wymuszony format odpowiedzi.** Prompt każe zapisać każdą myśl jako blok `=== IMPULS n ===` z polami TEMAT, HOOK,
   PYTANIE, TREŚĆ, ZADANIE, MAIL_TEMAT, MAIL — i zabrania dopisywania faktów, których twórca nie podał.
3. **Wklejenie.** Impuls rozkłada odpowiedź na pola zwykłym parserem, bez wywołania AI. Toleruje pogrubienia, punktory
   i nagłówki, a zwykłe notatki dzieli akapitami.
4. **Jedna myśl, dwa zastosowania.** Każda karta ma scenariusz (do promptera: hook + treść albo pytanie + treść)
   i szkic maila z automatycznym dopiskiem „tu jest więcej — wideo i narzędzie czekają w kanale”.

Dlaczego tak: zero kosztu AI po stronie Impulsu, treść jest w języku twórcy (a nie generyczna), rozmowy zostają u niego
— Impuls dostaje tylko to, co sam wkleił — i działa to z każdym czatem.

Możliwe rozszerzenia: import pliku eksportu rozmów, dopracowanie myśli jednym kliknięciem przez OpenAI (klucz jest już
w panelu administratora), kolejka maili spięta z prawdziwą wysyłką i z terminem publikacji wideo.

## 9. Model: voucher na start i opłata za rolkę

Pomysł: nowy twórca dostaje voucher (250 albo 500 zł), w onboardingu faktycznie nagrywa i publikuje pierwszą rolkę,
a potem płaci za użycie — nagranie i montaż jednej rolki poniżej 50 zł netto.

Co przemawia za:

- **Płaci się za efekt, nie za dostęp.** „Gotowa, opublikowana rolka” jest zrozumiała i porównywalna z montażystą
  (zwykle 100–300 zł za rolkę), więc 30–50 zł ma punkt odniesienia.
- **Voucher wymusza aktywację.** 500 zł to około 10 rolek, czyli 2–3 tygodnie regularnego publikowania — tyle, ile trzeba,
  żeby zobaczyć pierwsze zapisy ze strony w bio.
- **Zgadza się z resztą modelu:** publikacja, strona zapisu, newsletter i kanał zostają bez opłat, bo to one przyprowadzają
  odbiorców.

Na co uważać:

- **Koszt własny rolki jest niski** (napisy, dwie plansze, lektor: rząd kilku złotych), więc marża jest duża — ale cena
  broni się tylko jakością montażu. Dziś studio nie eksportuje gotowego pliku; bez renderu nie ma czego wyceniać.
- **Naliczać przy publikacji albo eksporcie, nie przy nagraniu.** Próby i odrzucone ujęcia nie powinny zjadać salda.
- **Voucher w rolkach bywa czytelniejszy niż w złotych** („10 rolek na start”), ale kwota wygląda hojniej — warto sprawdzić oba.
- **Termin ważności** (np. 30 dni) i wypłata w transzach po kamieniach milowych (pierwsza publikacja, pierwszy zapis)
  ograniczają koszt vouchera u osób, które nie wystartują.
- **Stały koszt na twórcę** (profil u dostawcy social, wysyłka maili) trzeba pokryć także u tych, którzy przestaną
  kupować rolki — np. zawieszając podpięte konta po okresie bez aktywności.
