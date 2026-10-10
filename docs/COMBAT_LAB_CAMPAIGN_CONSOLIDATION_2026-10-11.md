# Combat Lab — skonsolidowany stan kampanii i handoff (2026-10-11)

**Rodzaj dokumentu:** snapshot rzeczywistych decyzji i dowodów po kampaniach E1/B1, zaprojektowany do bootstrapu kolejnego Browser GPT. **Nie jest GDD, planem obowiązkowych prac, specyfikacją silnika, zamknięciem wizji ani nową „foundation”**. W razie rozbieżności nadrzędne są nowsze wypowiedzi Ownera, aktualny kod źródłowy i wyniki konkretnego SHA, a dla ocen gameplayowych obserwacje Ownera (nie zielone CI). Repo i opisy nie mają prawa anulować jawnego Owner FAIL.

## W skrócie — prawdziwy cel i frontier

Combat Lab jest otwartym warsztatem R&D do **odkrywania możliwości wynikających z fizycznej budowy organizmów, sposobów ruchu, wspólnej materialnej rzeczywistości, nacisku, reakcji, interakcji z tłumem i ostatecznie walki**. Owner chce stale eksperymentować, przebudowywać świat, psuć mechanizmy, obserwować konsekwencje, przejmować sterowanie; nie chce sterowanego pokazu kul, systemu tras, oddzielonych stacji testowych ani „wirtualnej ekologii” istniejącej tylko w licznikach.

Historyczny product-level R0/R1/L0 **Owner FAIL nadal obowiązuje**. Ostatni Owner feedback akceptuje *dłuższe samodzielne runy z realną pracą*, szybki i czytelny kompas postępu, częstsze zmiany rozmów oraz **wizualne surowe klatki jako kotwicę rzeczywistości**. Owner nie wydał teraz zgody na publiczną publikację ani nie potwierdził feelu E1/B1. Powiązany research percepcji/Visual Truth pozostaje w ReflexBrain; nie wprowadzać na siłę brainu ani raster vision do Combat Lab.

**Strategicznie postawione pytanie:** czy możemy stworzyć rzeczywiście odmienne *możliwości działania ciał*, których konsekwencje powstają w jednym interaktywnie edytowalnym świecie i są wartościowe dla Ownera — a nie tylko odmienną szatę graficzną, stan sterownika albo liczbę jointów? Prostszym rozwiązaniom trzeba dać uczciwą szansę.

## Live source snapshot zweryfikowany przy przygotowaniu

| Rola | Identyfikator / stan w chwili kontroli | Granica |
| --- | --- | --- |
| `main` | neutralne repo, historyczne i aktualne dokumenty badawcze; od E1 tylko zmiany dokumentacji | ŻADNA wybrana działająca implementacja organizmów |
| `rehearsal/current` | `cb4b44d417db612f3333fe515e6f6afffa3e56d8` | Publiczny pokaz nietknięty |
| E1 | `experiment/e1-local-encounter-whole`, source HEAD `55efe756ad79493b0c92c8a00360d77a14eef6ea`; [CI 38091544155](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38091544155) PASS; [PR #9](https://github.com/Jozzpoly/Combat-Lab/pull/9) Draft | Kandydat „whole”, nie zaakceptowany runtime |
| B1 | `experiment/b1-physical-envelope-gate`, source HEAD `24bd930fb1bb83425ea43168660a9c9c75d5b7d6`; [CI 38093724125](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38093724125) PASS; [PR #10](https://github.com/Jozzpoly/Combat-Lab/pull/10) Draft | Kandydat zdolności ciała, nie merge do E1 |
| G0 | `experiment/g0-physical-ground-reaction`; zamknięty bez merge PR #8; [Chromium CI 38089508879](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38089508879) | Wąski zamknięty kalibrator źródła siły |

**Ważne:** powyższe SHA to kotwice historyczne, nie stale żywe wskaźniki. Nowy agent ma zweryfikować realne HEAD/CI. PR #1/#2/#4 pozostają kwarantanną, nie automatycznymi ancestorami. Nie scalać izolowanych gałęzi dla porządku i nie modyfikować publicznego pointera.

## Kampania naukowa — co rzeczywiście zostało wykazane

| Próba | Obronne evidence | Czego NIE dowodzi |
| --- | --- | --- |
| M0 | Sztywne, trzyczłonowe i sprężyste konstrukcje pod naciskiem mają różne topologie kontaktu; niektóre wyniki taniego rigid rival podobne | Ruchu pozyskiwanego przez kończyny; jakości żywego organizmu |
| G0 | W rzeczywistym Rapier3D kołowy joint drive translatuje układ przez fizyczną reakcję podłoża; zero friction / brak podłogi / brak aktywnego napędu redukują COM do ~0. Bezpośredni root proxy na lodzie nadal porusza układ | Chodu, przyczepności stóp i przewagi 3D dla gameplayu |
| **E1** | 18 materialnych aktorów działa samodzielnie przez ograniczone lokalne sygnały i poprzedni kontakt w jednym świecie; wyłączenie inicjatywy eliminuje autopopych. Paired worlds: kontakt powoduje pierwszą różnicę sterowania w tick 34 przy 10.20286 N·s, edycja *wyłącznie sygnału* dopiero przy odczycie tick 162 | NPC cognition, sensory vision, ciekawych niezależnych umiejętności anatomii, naturalnego tłumu ani Owner feel |
| **B1** | Jedno 125kg ciało z realnymi front-mounted hinge wings i przeciwstawnymi bounded torque impulses zmienia rzeczywisty obrys ~3.86m→0.90m, przechodzi 1.24m materialny tunel (całe ciało mija koniec ok. tick 402), potem rozkłada się i rozsuwa dwie 40kg bryły (~0.925/0.877m w X, ~1.39/1.36m na zewnątrz w Y) | Naturalnej lokomocji/mięśni; że koszt wieloczłonowej anatomii opłaca się w pełnym świecie |
| **B1 cheap rival** | Jedna 125kg bryła z naiwnie zmienianym profilem collidera **także** przechodzi i rozsuwa materię. Podczas rozkładania *w ciasnym tunelu* powoduje patologiczne impulsy (~21,438 / 156,010 N·s) vs fizyczne joint wings ~23.3 N·s | Że wszystkie proste collider-profile modele muszą zawieść; brak zaimplementowanego collision-aware cheap rival |

**Niezwykle ważne FAIL i falsyfikacje:**
- G0: joint z włączoną konfiguracją silnika i późniejszym limitem siły = 0 NIE zachowywał się jak hinge nigdy nieposiadający silnika; wcześniejsze „passive” wykazywało pozorną mobilność. Poprawny null jest osobno bez napędu.
- B1: pierwotna anatomia nie składała się, mimo liczonych impulsów aktuatora. Ostatni argument `createImpulseJoint(..., false)` to `wakeUp`, nie ustawienie kolizji połączonych części. Wyłączenie kontaktu self pozwalało nawet „rozłożonemu” ciału przejść biernie. Naprawa była *geometrią zawiasu* i wystarczającą, ale skończoną siłą; finalny eksperyment **zachowuje self-contact**.
- E1: ruszenie fizycznego źródła sygnału zmieniało decyzję **przed** ponownym sensing; to nie był dowód reakcji na percepcję. Osobny signal-only counterfactual rozdzielił przyczynę.
- B1: **dwa efekty nie dają monopolistycznego argumentu za jointami**. Tani zewnętrznie zmieniany collider również generuje podobne afterstates poza przeszkodą. Problemem jest jego brak fizycznego respektowania zajętej przestrzeni, a nie samo uproszczenie.
- Żadna liczba kontaktów solvera = liczba odrębnych zdarzeń ani jakość crowd. Brak wiarygodnego measured end-user FPS; mierzenie w wirtualnym czasie headless Chromium dało mylące zero i zostało odrzucone.

## Wizualna prawda i najistotniejsze źródła

**E1**: [szczegółowy checkpoint](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/e1-local-encounter-whole/docs/E1_WHOLE_LOCAL_ENCOUNTER_CHECKPOINT_2026-10-10.md), [rzeczywisty start](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/e1-local-encounter-whole/docs/media/e1-actual-t0.png), [to samo materialne otoczenie, tick 480](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/e1-local-encounter-whole/docs/media/e1-actual-t480.png). Widać autentyczne przesunięcia ciał i materii, ale nadal głównie prostokąty, koraliki, segmenty i zbiegające się skupiska.

**B1**: [pełny raport z surowymi kontrolami](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/b1-physical-envelope-gate/docs/B1_PHYSICAL_ENVELOPE_DUAL_AFFORDANCE_2026-10-10.md), [rozłożone](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/b1-physical-envelope-gate/docs/media/b1-source-t0.png) → [złożone](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/b1-physical-envelope-gate/docs/media/b1-folded-t180.png) → [rozłożone i kontakt](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/b1-physical-envelope-gate/docs/media/b1-redeployed-t580.png) → [po kontakcie](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/b1-physical-envelope-gate/docs/media/b1-post-physical-contact-t780.png). To techniczny, geometrialny kadr, nie ładna gra ani sztuczna ilustracja.

**Historyczne overlays**: [dokładne poprzednie wpisy Research State](history/RESEARCH_STATE_OVERLAYS_THROUGH_2026-10-10.md), skopiowane przed konsolidacją bez utraty szczegółowych negative controls. Mają wartość forensic, a nie obowiązującą instrukcję. Wczesna istota projektu: [frontier reassessment](FRONTIER_REASSESSMENT_2026-10-07.md) oraz [substrate/specimen](BODY_WORLD_SUBSTRATE_AND_SPECIMEN_2026-10-07.md); stare plany nie są przyszłym nakazem.

## Duże ryzyka i otwarte decyzje

1. **Różnice ciał vs wrażenie życia.** E1 jest bardziej autonomicznym *ruchem do lokalnych sygnałów*; B1 jest ręcznie sterowaną, jedną morfologią. Połączenie nie jest jeszcze dowiedzione, a bez krytycznego rozstrzygnięcia może zostać następnym R0: złożoność rośnie, a różnorodność działań nie.
2. **Sprawiedliwy tani rywal.** Naiwne przeskalowanie kolizji przegrywa z fizyczną przeszkodą. Nie sprawdziliśmy taniej *collision-aware* zmiany obrysu respektującej zajęty świat. Brak powodu zamrażać multi-body jako konieczną implementację.
3. **Źródło siły a kształt.** G0 stawia rygor dotyczący rzeczywistej reakcji podłoża. E1 i B1 nadal mają **jawnie sztuczną, zewnętrzną planar root traction**. Nie przypisywać ruchu nogom, stawom ani świadomości.
4. **Wydajność i skala.** E1 test 30 aktorów/120 body parts przez 500 kroków bez NaN, ale bez FPS; B1 nie przeszedł próby wielu istot w obciążonym świecie. Nie ma danych o realnym koszcie shape-changing control vs tańszy morf.
5. **Owner-observed quality veto.** Wszystkie nowe product/feel claims mają stan UNKNOWN. Nie publikować dla wygody testów i nie przymuszać do First Look z niedojrzałym kandydatem. Pokazywać surowe klatki w trakcie pracy.
6. **Separacja obowiązków.** Combat Lab bada body/world/material capability. ReflexBrain bada odrębnie percepcję i cognition, nie importować automatycznie jego systemów.

## Kolejny sensowny run / kryterium wyboru

Nie robić następnej serii „wystarczy, że ciśnie bardziej”, AI smelling parametrów ani obowiązkowej integracji E1+B1. Najpierw krótki krytyczny **top-down reselection**: co najsilniej może teraz stworzyć Ownerowi interesujące sytuacje i niezależną różnicę w ciałach, w świecie zdolnym przetrwać nieprzewidziane ingerencje?

Dwie badawczo rozsądne konkurencyjne strategie (bez decyzji implementacyjnej):
- **Wspólna scena z jedną jakościowo odmienną zdolnością ciała**: mało elementów, ale połączenie B1-like material actuation z E1-like lokalnym działaniem pod presją innych i możliwością reżyserowania bałaganu przez operatora. Koniecznie równoległy cheap rigid+proxy comparator i realna zróżnicowana sytuacja, nie osobna „gate station”.
- **Bardziej surowy body substrate / mechanika kontaktu**: jeżeli seria falsyfikacji pokaże, że obecny ruch z proxy eliminuje ważne gameplay opportunities, wtedy nowy substrat, contact/support lub inny model morfologii przed mechanikami AI. Unikać przedwczesnego wyboru 2D/3D.

Kryterium sukcesu kolejnej całości: nie liczba aktorów ani wyniki CI, tylko **materialnie odmienne, czytelne, niezależne reakcje i możliwości, które użytkownik może sam sprawdzić, zmienić i popsuć**, na tle uproszczonego, obronionego konkurenta. Uznanie technicznego przypadku za Pass nigdy nie zastąpi First Look.

## Zasady ciągłości i higiena

- Nowy czat ma sam odzyskać `main/docs/AGENT_RUN_CURSOR.md` (krótki bootstrap), `main/docs/RESEARCH_STATE.md`, najświeższy Owner feedback, bieżące HEAD / CI PR #9/#10, a dopiero przy istotnej zależności szczegółowe checkpointy. **Owner nie ma nic kopiować.**
- Nie podmieniać znaczenia `main` ani `rehearsal/current` dla wygodnej publikacji; nie robić merge bez świadomego uzasadnienia.
- Nierozwiązane pytania są aktywnym frontierem, nie zaległym TODO; nie tworzyć sztucznej pracy.
- Zachować krótki warstwowy feedback: stan → evidence → material problem/decision → kierunek. Długie autonomiczne runy z odpowiedzialnością za własne domknięcie, krótkie okresowe widoczne aktualizacje zamiast wymuszania „kontynuuj”.
- Kiedy dokładne przyszłe działanie jest inne po świeżym Owner feedback niż w tym dokumencie, Owner feedback ma pierwszeństwo.

**Kompas:** Owner FAIL historycznych traffic-like rozwiązań → różne fizyczne konstrukcje M0 i realny source G0 → lokalne niezależne zachowanie wspólnego świata E1 → realne dwie możliwości anatomiczne B1 + obalony monopol jointów → **uczciwa próba interaktywnie wartościowego, materialnie zróżnicowanego całego świata**.
