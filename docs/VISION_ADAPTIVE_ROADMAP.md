# Combat Lab — wizja i adaptacyjna roadmapa badawcza

**Status: kierunkowy dokument roboczy, 2026-10-10. Nie jest GDD, wyborem silnika, akceptacją prototypu ani nakazem implementacji.** Nowszy jawny Owner feedback ma pierwszeństwo. [RESEARCH_STATE](RESEARCH_STATE.md) zawiera aktualne dowody, a [CAMPAIGN_RUNBOOK](CAMPAIGN_RUNBOOK.md) reguluje wykonanie.

## 1. Gwiazda północna: czego naprawdę szukamy

**Combat Lab ma być miejscem, w którym Owner sam spontanicznie tworzy, zmienia i bezlitośnie testuje sytuacje, żeby odkrywać, co rozmaite fizyczne istoty *mogą zrobić* ze sobą, materią i otoczeniem.** Nie chodzi tylko o walkę, omijanie przeszkód, chodzenie ani piękne wizualizacje kontaktów. Szczególnie ważne są: niespodziewane, ale czytelne konsekwencje, odmienne ciała i możliwości, reakcje, interakcje grupowe, tłum, skala, kontrola i możliwość zepsucia eksperymentu.

Pętla dla Ownera: **zmieniam świat/ciało → uruchamiam → widzę przyczynę i skutek → prowokuję ekstremum lub nową sytuację → zmieniam i próbuję ponownie**. Ma być krótka, naturalna i odporna na nieprzewidziane ingerencje. Debugger służy rozumieniu, a nie zastępuje doświadczenia.

Długoterminowym horyzontem jest świat z fizycznie i funkcjonalnie różnymi istotami oraz możliwością rozwijania mechanik walki i żywych reakcji. Combat Lab może dostarczać donorów do innych projektów, lecz **nie staje się domyślnie architekturą AI, SPC, Feniksa, Character Controllera ani jednej gry**.

### Jaką pewność mają te twierdzenia

- **Owner-confirmed / odzyskane:** swoboda i realne testowanie ruchu, tłumu, reakcji oraz różnych sytuacji; krytyczne łamanie mechanik; dużo większa wizja niż „combat”; krótki koszt uwagi i samodzielne długie runy; pierwszeństwo Owner-observed FAIL przed machine PASS.
- **Synteza robocza agenta:** prawdopodobnym ograniczeniem jest *gęstość wartościowych możliwości i interakcji* w całym świecie, a nie brak kolejnego mechanicznego testu. To wyjaśnienie, **nie opinia potwierdzona przez Ownera**.
- **Otwarte:** docelowy wymiar świata, rodzaj fizyki, anatomia, locomotion/stance, inteligencja istot, zakres walki, skalowanie i estetyka. Żaden z S2/K1/Z1/Y1/X0 nie rozstrzyga ich sam.

## 2. Produktowe kryterium wartości — zanim powstanie następna podstawa

Kandydat na poważne laboratorium powinien umożliwiać kilka **jakościowo różnych, samodzielnie odkrywalnych działań lub pytań** w **jednym modyfikowalnym świecie**. Nie wymaga konkretnej liczby „czasowników”. Przykłady: jedno ciało zatrzymuje/przepuszcza inne z materialnego powodu; ktoś inaczej operuje przedmiotem lub strukturą zależnie od anatomii; przestawienie rzeczy zmienia możliwości kolejnej istoty; różne masy i opory tworzą odmienne decyzje; zbiorowy nacisk wywołuje inne odpowiedzi niż pojedyncza kolizja.

**Weto Ownera:** jeżeli po wejściu w działającą aplikację nadal ogląda głównie zakodowany pokaz, ruch bloków, korek albo panel parametrów — zielone testy nie są sukcesem. Historyczne R0/R1/L0 Owner FAIL pozostają FAIL. O nowym prototypie bez Owner testu zapisujemy **UNKNOWN / niezakwalifikowany**, nigdy PASS.

**Prawa eksperymentowania:** dziwne konfiguracje, nienaturalne masy, nieudane budowy, zablokowane mechanizmy, kolizje, wyjątkowe skale i destrukcyjne testy pozostają legalne, jeśli nie grożą rzeczywistą awarią procesu/danych. Nie ratować wybranej narracji przez teleporter, ukryty trigger, ghosting, silent clamp lub reset świata.

## 3. Aktualna baza wiedzy i lekcje negatywne

| Linia | Co naprawdę zostaje jako evidence/donor | Czego NIE wolno wywnioskować |
| --- | --- | --- |
| R0/R1/L0 (historyczne) | Rzeczywiste efekty nacisku i ograniczeń ciała; także surowy Owner feedback | Że model tłumu/sterowania został zaakceptowany |
| X0 | Przebudowa istniejącego fizycznego ciała; stawy; lokalna reakcja z kontaktu | Że to żywy, ciekawy organizm |
| Y1 | Zmiana dostępności kolejnej interakcji w relacyjnym świecie | Że efekt nie zależy od sztucznego uchwytu i ustawienia |
| Z1 | Bezpośredni kontakt może przestawić przedmiot, zawias i suwak; warunkowo przygotować drugi kontakt | Że to trzy różne umiejętności organizmu |
| K1 | Ramiona zmieniają fizyczny obrys w trakcie życia świata | Że blokowanie działa bez sztucznego podparcia — *brace-off* ten claim w dużej części obalił |
| **S2 (najnowsza)** | Prawdziwy normal/friction, obciążenie i utrata podłoża w 3D; tanie 2D umie przybliżyć część poślizgu | Że 3D jest niezbędne, ma lepszy feel/skaling, że to chód/stance albo udana gra |

Źródła i dokładne poprawki: [RESEARCH_STATE](RESEARCH_STATE.md), [S2 na gałęzi badawczej](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/ground-contact-s2/docs/S2_GROUND_CONTACT_CHECKPOINT_2026-10-10.md), [K1](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/posture-contact-k1/docs/K1_POSTURE_CONTACT_CHECKPOINT_2026-10-10.md), [OWNER_TRUTH](OWNER_TRUTH_RECONCILIATION_2026-10-09.md).

## 3a. Nowy priorytet Ownera: obejrzeć prawdziwy stan, zanim go dalej idealizujemy

Owner poprosił 2026-10-10 o dążenie do **szczerego pokazania tego, co już istnieje**. Dlatego [pierwszy przegląd Ownera](OWNER_FIRST_LOOK.md) staje się bezpośrednim celem operacyjnym następnej kampanii — **nie po osiągnięciu produktowego PASS, lecz po uzyskaniu realnie uruchamialnego i uczciwie opisanego preview**. Nie budować nowej mechaniki, by poprawić pierwsze wrażenie, zanim sprawdzimy istniejące. Wczesny Owner FAIL/feedback jest pełnowartościowym dowodem, nie porażką ceremonii pokazowej. Publiczne wdrożenie nadal wymaga odrębnej świadomej decyzji.

## 4. Roadmapa jako mapa decyzji — nie kolejka feature'ów

**Równolegle obowiązują dwa wymiary:** rośnie jakość *całościowego doświadczenia* i rośnie jakość *naszej wiedzy o mechanizmie*. Drugi bez pierwszego może uzasadniać donor, ale nie awans produktu. Poniższe kampanie to **warunkowy portfel**, nie obowiązkowa kolejność od góry.

| Kampania / pytanie | Co musi powstać lub zostać sprawdzone | Co odrzuca dotychczasową hipotezę | Kiedy ją wybrać |
| --- | --- | --- | --- |
| **W: sensowny „whole” warsztat** | Jedna swobodnie przebudowywana sytuacja z wieloma możliwymi interwencjami, różnymi ciałami i materialnymi następstwami | Wciąż jedynie osobne stacje, instrukcja „wykonaj sekwencję”, ruch brył bez jakościowo innych możliwości | **Domyślny strategiczny priorytet** po odzyskaniu S2; nie wymaga z góry 3D |
| **S: rzeczywiste podparcie vs tani model** | Ten sam wartościowy *problem działania* rozwiązany przez najprostsze wiarygodne 2D, contact-ground 3D lub model hybrydowy | Głębsza fizyka nie tworzy nowych użytecznych możliwości, a jest znacznie kosztowniejsza/trudniejsza | Gdy W ujawnia konkretną zależność od support, friction, height lub topology |
| **B: heterogeniczność ciał / ruchu** | Różne envelope, narządy i authority dają naprawdę inne manewry/działania, porównane z uczciwym rigid surrogate | Różnica sprowadza się do zmiany koloru, DPS, collider length lub tego samego motor push | Gdy świat oferuje okazje, których obecna anatomia nie umie wykorzystać |
| **C: reakcje, nacisk, tłum** | Współistnienie wielu ciał pod miejscowym naciskiem, minimalna percepcja i inicjatywa; zmiana odczuwalna w zwykłym środowisku | To powrót do traffic/crossing, jam counters lub sztucznego globalnego celu | Gdy istnieją różne dostępne działania i są konsekwencje lokalnych wyborów |
| **F: walka i eksperymenty materialne** | Zasięg, osłona, commitment, wypieranie, różne bronie/wyposażenie jako fizyczne decyzje | Tylko zmiana parametrów trafienia, DPS lub choreografia bez praw świata | Gdy realne body↔world możliwości uzasadniają walkę jako eksperyment |
| **P: koszt i skala (przekrojowo)** | Profilowanie prawdziwych zestawów kontaktów, liczby aktorów, stabilności, opóźnienia inputu, perf/quality tradeoff | Zielony stress test nie koreluje z czytelnością i feel, a uproszczenie niszczy ważne efekty | **Przy każdej decyzji zmieniającej koszt architektury**; nie dopiero na końcu |

**Reguła przejścia:** wybieramy kampanię, gdy konkretne evidence pokazuje, że jest *najbliższym ograniczeniem* celu. Nie przechodzimy z W do S, B, C ani F przez sam PASS lub ukończenie tabelki. Można wrócić, połączyć hipotezy albo je odrzucić.

### Pierwsza rekomendowana seria — podlega falsyfikacji na starcie każdego runu

1. **Run odbudowy i audytu:** odzyskać pełny Owner baseline, live heads, naprawione S2 i rzeczywiste zachowanie co najmniej jednego aktualnego kandydata; skonfrontować „głębsza fizyka” z realnym brakiem działań i z kosztem 3D. Nie otwierać automatycznie S3.
2. **Run doboru poważnego „whole”:** wybrać *jedną* znaczącą sytuację oferującą odmienne akcje ciał, nie nową serię trzech niezależnych testów. Uzasadnić czy przeszkodą jest wsparcie, anatomia, interakcja czy czytelność. Przygotować fair simpler-control i kryterium porzucenia.
3. **Długi run konstrukcji i obalania:** zbudować osobną całość adekwatną do pytania, poszukać pozytywnych i negatywnych konsekwencji, obejrzeć realny UI, przetestować ekstremalne ingerencje, zmienić kierunek jeśli nic się nie pojawia.
4. **Run Owner-worthy hardening, *tylko gdy uzasadniony*:** gameplay/controls/visual readability/odzyskiwalność scen i awarie najpierw agent; dopiero potem prośba o rzeczywisty Owner test, bez obiecywania PASS.

Te punkty określają **rodzaj kolejnych decyzji**, nie zobowiązanie do czterech nowych branchy ani czterech rozmów. Jeśli pierwsza faza odkryje mocny falsyfikator, dalszy plan zmieniamy.

## 5. Portfolio ryzyk i jawne „kill conditions”

- **Złudzenie postępu:** rosną testy/commity, nie rosną jakościowo dostępne działania → zatrzymać feature flow, pokazać porównanie z Owner baseline i skierować badanie wyżej.
- **Physics fetish / 3D gravity trap:** prawdziwszy solver bez wartości w operowanym świecie → zostawić jako donor albo wybrać prostszy model.
- **Powrót do traffic:** kolejny ruchomy aktor i lokalne unikanie generują tylko korki → przeprojektować całą sytuację, nie dopieszczać state machine.
- **Mechanizm w przebraniu mechaniki:** „manipulacja” możliwa wyłącznie przez magiczną tolerancyjną linkę → uczciwie wskazać aktor źródłowy, porównać kontakt i zamiennik.
- **Tymczasowe ograniczenia stają się prawem świata:** solver/prototyp i jego presety narzucają anatomię, UI lub ruch → oddzielić authored intent od konkretnej implementacji.
- **Koszt Ownera:** powtarzane pytania, częste „kontynuuj”, długa dokumentacja zamiast eksperymentu → agent sam utrzymuje stan i wraca do Ownera tylko przy ważnej granicy.

## 6. Czego ta roadmapa nie autoryzuje

Nie autoryzuje: merge eksperymentu do `main`, przesunięcia `rehearsal/current`, publikacji, wyboru technologii, uznania Owner PASS, importu AI/cognition ani automatycznej implementacji wszystkich kampanii. Każdy donor zachowuje własną prowieniencję, ograniczenia i testy. Bieżący Owner feedback może ten plan istotnie zmienić.

**Pytanie powrotne po każdej kampanii:** *„Czy zdobyliśmy inną, naprawdę użyteczną możliwość swobodnego działania w świecie — czy tylko lepsze potwierdzenie jednego mechanizmu?”*
