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
| Materiały | Wideo / Narzędzia / Pliki ze statystykami |
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
