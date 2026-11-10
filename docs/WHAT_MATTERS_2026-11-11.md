# Combat Lab — co naprawdę warto odzyskać

**Wersja selektywna: 11 XI 2026.** To mapa znaczenia, nie kompletna kronika i nie automatyczna roadmapa. Następny agent powinien ją podważyć w świetle świeżych prób i bieżącej intencji Ownera.

## 1. Niezmienny problem badawczy (Owner intent)

Tworzyć światy, w których fizycznie różne ciała **naprawdę mają inne możliwości działania**: ruch, nacisk, reakcję, przesuwanie materii, współpracę i konflikt. Człowiek ma bezpośrednio zmieniać ciało/scenę, uruchamiać, przejmować sterowanie, obserwować konsekwencje, doprowadzać do awarii i poprawiać. Przypadki skrajne są pełnoprawnymi eksperymentami, nie błędami użytkownika.

**Nie:** kolejna elegancka scena kulek poruszających się do celu; ekspercki panel fizyki bez zabawy; drogi, wielostawowy aparat, który nie daje nowego działania; green CI podniesione do rangi aprobaty gry.

Ta wizja wciąż jest otwarta: 2D/3D, solver, modele ciał, AI i integracja z Jaskinią nie są wybrane na zawsze.

## 2. Najcenniejszy materiał: rzeczywiste próby Ownera

[Indeks trzech raportów odtworzonych z dawnych, usuniętych drzew Git](OWNER_EXPERIENCE_PRIMARY_EVIDENCE_2026-11-10.md). Raporty są **analizami agentów na podstawie prób**, nie zachowanymi surowymi filmami ani kompletnymi stenogramami rozmów.

- **B0 / 25 IX:** Owner eksperymentuje ze skrajnymi właściwościami; pole ruchu wpisane jako **42** zostało po cichu ucięte do **8**. Bez ostrzeżenia model świata odebrał mu sprawczość.
- **Tłum / 27 IX:** test nawet **256 ciał** nie był pomyłką. Wartość kierunku to eksploracja nacisku i emergencji, także gdy symulacja się klinuje.
- **L0 / 6 X:** **Owner FAIL mimo 238/238 testów maszynowych**. Powtórzono ograniczoną, mało interesującą zabawkę pod pozorem nowego fundamentu.

[Failure Scar](FAILURE_SCAR_2026-10-06.md): *tymczasowa proteza nie może stać się świętym centrum projektu tylko dlatego, że ma już dużo testów*. Jest to ważniejszy kontrakt współpracy niż dowolny historyczny kod.

## 3. Wybrane źródła do rozważenia — nie do bezmyślnego montażu

| Przypadek | Dlaczego warto znać | Czego nie uznawać za sukces |
| --- | --- | --- |
| **[B1 — materialny obrys ciała](https://github.com/Jozzpoly/Combat-Lab/blob/24bd930fb1bb83425ea43168660a9c9c75d5b7d6/docs/B1_PHYSICAL_ENVELOPE_DUAL_AFFORDANCE_2026-10-10.md)** | Złożenie/rozłożenie ciała zmienia realne możliwości. Tani collider rywalizuje z joints; prawdziwa różnica ujawnia się przy kolizji podczas rozkładania w ciasnej przestrzeni | Chód, „żyjące ciało”, zawsze lepsza skomplikowana anatomia |
| **[P7 — nacisk tłumu i obrońca](https://github.com/Jozzpoly/Combat-Lab/blob/0dcea7ab60cd1f811c4eb8ef72fd2f90482b0afc/docs/P7_CONTESTED_DOORWAY_CROWD_2026-10-11.md)** | Stance i nacisk w materialnej scenie; „brace” nie staje się magicznym nieruchomym blockerem. Zmiana reguł może dawać zaskakująco negatywne wyniki | Inteligentny tłum, prawdziwe stopy, dobry feel |
| **[P10b — ingerencja operatora](https://github.com/Jozzpoly/Combat-Lab/blob/72ac69af949c3c1e45a2af9128bc785f3cd1763d/docs/P10B_NATIVE_AFFORDANCE_AND_STRESS_2026-10-11.md)** | Pauza, bezpośrednie przesuwanie materii, kontakt, przebudowa przejść i obserwacja fizycznego afterstate | Gotowa gra, naturalne organizmy, dobry UX mobilny |
| **[Worldbench — rzeczywista granica Jaskinia/Lab](https://github.com/Jozzpoly/Combat-Lab/blob/f569b3127a884ddd5d1d46cd3a837ff3142272b6/docs/P10D_JASKINIA_WORLDBENCH_2026-11-06.md)** | Zachowane okno ≠ zachowany runtime; ukryta instancja może odpowiadać bez fizycznego postępu; odświeżenie może zresetować świat. Zabezpieczono stare polecenie przed zmianą nowej instancji | Uniwersalna architektura trwałości albo zaakceptowane studio |

**Tylko gdy pytanie naprawdę tego wymaga:** [W2 — wiele ciał](https://github.com/Jozzpoly/Combat-Lab/blob/ee90e37d7a794d3195fb23e6566186a5119c7255/docs/W2_INTEGRATED_MATERIAL_COMMONS.md), [E1 — lokalna inicjatywa](https://github.com/Jozzpoly/Combat-Lab/blob/55efe756ad79493b0c92c8a00360d77a14eef6ea/docs/E1_WHOLE_LOCAL_ENCOUNTER_CHECKPOINT_2026-10-10.md), [P12b — uśpienie ciała a pozorna strata pędu](https://github.com/Jozzpoly/Combat-Lab/blob/c345647b16472dfd62960cf2dd20c2e7eaa49fc4/docs/P12B_SLEEPING_MOMENTUM_CAUSE_2026-10-11.md). To wąskie źródła causal/technical, nie kandydaci uprzywilejowani.

## 4. Co można spokojnie ignorować

44 historyczne końcówki gałęzi **nie reprezentują 44 zadań**. Dawne kursory, plany pośrednie, dublujące się screeny, tanie warianty kodu i automatyczne tabele PASS mają domyślnie **zerowy koszt uwagi**. Nie usuwamy ich dziś przemocą z bazy obiektów Git, bo [jedna zwykła gałąź archiwalna](https://github.com/Jozzpoly/Combat-Lab/tree/archive/all-research-pre-provider-handoff-2026-11-10) utrzymuje historię na GitHubie bez mnożenia aktywnych gałęzi. To *cold storage*, nie roszczenie do wartości ani zbiór zobowiązań.

Jeśli kiedyś powstanie dowód, że fizyczne zmniejszenie historii jest potrzebne, można osobno zbadać selektywne tagi i zmianę granic retencji. **Nie przepisywać historii tylko po to, by usunąć kilka MB.**

## 5. Ważna luka: rozmowy

Historia konwersacji i pierwotne nagrania są często ważniejsze od kompilowanych 500 odmian tego samego kodu. **Pełnych rozmów nie umieszczono w tym publicznym repo; nie należy udawać, że już zostały ocalone.** Na GitHubie zachowujemy na razie tylko wybrane, jawne wnioski z materiałów źródłowych, z zaznaczeniem ich pochodzenia i niepewności. Dla pełnych logów właściwą przyszłą granicą jest osobna, świadomie wybrana prywatna przestrzeń, a nie automatyczny zrzut rozmów do publicznego Combat Lab.
