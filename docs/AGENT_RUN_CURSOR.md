# Combat Lab — Agent Run Cursor

**Checkpoint: 2026-10-10 · po T0 i W1.** Operacyjny kursor do szybkiego wznowienia przez nowy czat; **nie jest roadmapą ani technicznym authority**. Nowsze Owner corrections, live source, `RESEARCH_STATE`, test i rzeczywisty UI mają pierwszeństwo.

## NOWE PO M0 (2026-10-10)

Owner intent odzyskany szerzej: **nie tylko szczypce/skrzynki**, lecz fizycznie różne organizmy, ruch, tłum, sprężystość, nacisk i swobodne próby niszczenia mechanik. Combat później. [M0 niezależny donor / draft PR #7](https://github.com/Jozzpoly/Combat-Lab/pull/7): sztywny, trójczłonowy i sprężysty ośmiomasowy organizm w Rapier2D; [badawczy checkpoint](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/m0-physical-phenotypes/docs/M0_PHENOTYPES_CONTACT_CHECKPOINT_2026-10-10.md). Zbadano faktyczny body-body contact, 24 próby fizyczne, 12 porównań z tanim rigid o podobnej masie/obrysie i przegląd prawdziwej sekwencji 0–240 kroków. [Pierwszy surowy PNG](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/m0-physical-phenotypes/docs/media/m0-actual-t0.png) / [po nacisku](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/m0-physical-phenotypes/docs/media/m0-actual-t240.png). Są realne kontakty i różnice dynamiki, ale **ciągle nie ma żywego organizmu, prawdziwych nóg/ground traction, samodzielnej inicjatywy, różnorodnych świadomych działań ani Owner PASS**. Odruchy zarejestrowane, lecz ich realny skutek w obecnym scenariuszu jest bardzo mały. UI test klawiatury i edycji w Chromium PASS, nie Owner feel. M0 NIE staje się fundamentem. NASTĘPNY FRONTIER: świadomie porównać ciało + rzeczywiste źródło siły/ruchu + lokalną decyzję/reakcję + świat i uczciwego prostszego rywala; nie budować automatycznie M1.

## W jednej minucie — po co i gdzie jesteśmy

**Owner chce fizycznie i funkcjonalnie różne istoty oraz swobodne, przekonujące eksperymenty z ruchem, tłumem, reakcjami, materią, potencjalną walką i emergencją — edit → run → observe → break → improve.** Mechaniczny zielony CI nie leczy Ownerowego FAIL-u. Nie myl ćwiczeń inżynieryjnych z zainteresowaniem grą; nie przejmuj AI/pamięci/percepcji ReflexBrain ani narracji Feniksa.

**Owner-observed baseline:** R0/R1/L0 jako doświadczenie FAIL, niezależnie od ograniczonych sukcesów sił/kontaktów. Nowe eksperymenty X0/Y1/Z1/K1/S2/T0/W1 **nie mają Owner-qualified product PASS**. Repo `main` to neutralne research truth; `rehearsal/current` pokazuje neutralny smoke, **nie włączać publicznego deploymentu bez zgody**.

**Evidence z ostatnich runów:**

- **T0 (closed PR #5):** w trzech historycznych okazjach Z1 drugi organizm bez ramion nadal uzyskiwał kontakt po wcześniejszym działaniu pierwszego. Source-level `root idle` NIE oznacza wyłączonego jaw servo; w jednym testowanym położeniu 13 kroków kontaktu z servo vs 0 całkowicie unpowered. [Dokładne źródła/negatywy](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/z1-anatomy-null-t0/docs/Z1_ANATOMY_NULL_T0_CHECKPOINT_2026-10-10.md). **Nie kontynuuj T0 jako architektury anatomii.**
- **W1 (closed PR #6):** niezależna próba świata z 2 pincer, 2 ram, 7 free matter, 2 physical hinges; jaw-only bez root-drive i prawdziwie pasywne ciała dały **0** kontaktów body↔material w authored composition, podczas gdy piloted root drives tylko przesuwały materię. [Ścisły checkpoint + ograniczenia](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/commons-w1-composition/docs/W1_COMPOSITION_CHECKPOINT_2026-10-10.md). Test source `c2989be`: [Chromium/WASM PASS](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38086895697). **STOP W1; nie dobieraj pozycji pod licznik.** **Samokrytyka metody:** zerowa aktywność całkiem biernej sceny była przewidywalna, a jaw-only nie dosięgało przedmiotów. To słaby falsyfikator WORLD-FIRST jako ogólnej hipotezy; odrzuca tylko tę kompozycję, nie cały kierunek.
- **Źródło prawdy z S2/K1 i starszych prób:** [RESEARCH_STATE.md](RESEARCH_STATE.md) zawiera prawdziwe, wąskie donory, których wyniki nie wybierają ani 2D/3D, ani anatomii. K1 sztuczny brace, S2 prawdziwy 3D support, Z1 root-drive/action confusion. Nie przedłużać S2 do S3 ani X0 do kolejnego mechanizmu bez nowego rozstrzygającego powodu.

**Z ważniejszej historii:** rzeczywisty [Owner First Look Z1](OWNER_FIRST_LOOK.md) screenshot szybko ujawnił ubogie prostokąty/stacje, choć kod działał. [Unretouched initial frame](https://github.com/Jozzpoly/Combat-Lab/blob/review/owner-first-look-z1/docs/media/owner-first-look-z1-first-frame.png). Wczesny uczciwy obraz bywa cenniejszy niż kolejne wielostronicowe machine-PASS; nie wymagaj jednak publicznego Pages, jeśli niepotrzebne. Badania [Visual Truth i most ReflexBrain](REFLEXBRAIN_VISUAL_PERCEPTION_BRIDGE_2026-10-10.md) są ODŁOŻONE w Combat Lab; nie implementować sensory/formatów w tym laboratorium bez nowego celu.

## AKTUALNY FRONTIER (nie implementacyjny NEXT)

W1 pokazał, że samo dodanie bardziej złożonego układu materii wokół biernych ciał **nie rodzi samodzielnego działania**; T0 pokazał, że wybrane działania można osiągnąć sztywnym odpowiednikiem. Brak kolejnego aktu planowania organizmu nie jest automatycznie „problemem dla AI”; brakuje **uczciwego, fizycznie możliwego źródła działania i jego sensownej sytuacji**.

**Wartościowe pytanie następnej kampanii:** jak uzyskać w jednym swobodnie edytowalnym świecie *dwa jakościowo różne działania fizyczne* oraz *co najmniej jedną konsekwentną reakcję drugiej istoty* — bez choreografii traffic, globalnych targetów, ukrytych kontaktów czy manipulowania proxy? Uczciwy przeciwnik = sztywny/tańszy organizm + bierne środowisko + ta sama sytuacja. Czy to wymaga rich morphology, grounded support, world topology, minimalistycznego body-local effort/intent, lepszego direct input, czy czegoś nieprzewidzianego — **OPEN**. Nie wybierać na papierze jednego solvera, AI czy organu.

**Następny krok agenta:** odzyskaj najnowszy Owner feedback i live refs; przy nowych badaniach porównaj rzeczywiste dotychczasowe obserwacje z planowanym całym doświadczeniem. Sprawdź, czy nowe źródło aktywności/siły i nowe możliwości w ogóle istnieją, zanim zrobisz długą implementację. Jeśli projekt domaga się solidnego nowego whole, świadomie zaprojektuj jeden niezależny candidate, z naturalną pętlą Ownera i falsyfikatorem jakościowym. Nie dziedzicz W1 jako parent; źródła PR2/S2/X0 jedynie donorami po konkretnym uzasadnieniu.

## Run hygiene / częste nowe rozmowy

- Nowy czat nie wymaga od Ownera przeklejania handoffu: otwórz ten kursor, [RESEARCH_STATE](RESEARCH_STATE.md), najnowszy Owner feedback oraz tylko zależne evidence. **Sprawdź SHA/CI/deployment LIVE**, bo tu są snapshoty, nie święte piny.
- W obrębie długiego runu: stale odzyskuj pytanie → działaj → testuj rzeczywiste wykonanie + negatywną kontrolę → patrz na cały feel/Owner fit → falsyfikuj → wykonuj dalszą właściwą pracę. Brak nowej architektury nie znaczy brak wartości badań; nie kończyć dla jednego zielonego checka.
- Po istotnej zmianie wystarczy aktualizacja *tego* cursor + `RESEARCH_STATE` (jeśli zmieniły się fakty). Unikaj nowych duplikatów handoffów, nie doklejaj starych NEXT, nie rób z repo kalendarza promptów. W razie zerwania najpierw sprawdź, co commit naprawdę zapisał.
- Poprzednie skończone PR #5/#6 są **CLOSED bez merge** (evidence zachowane). Inne historyczne draft donory #1/#2/#4 pozostają odizolowane. `main` nie zawiera nowego organizmu; `rehearsal/current` bez zmian.
- User-facing: zwięźle i wizualnie: live truth / zauważone dowody / ograniczenia / co dalej; okazjonalny [Progress Compass](PROGRESS_COMPASS_CONVENTION.md), a nie ciągła ściana raportów.

**Główny inwariant:** Valuable phenomena → causal discrimination when needed → independently earned serious whole. Nigdy machine PASS ⇒ produkt ani diagnostic ancestry ⇒ fundament.
