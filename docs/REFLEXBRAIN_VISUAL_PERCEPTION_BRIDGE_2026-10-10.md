# Most: obrazowa, wieloskalowa percepcja ↔ ReflexBrain — 2026-10-10

**Przeznaczenie:** dokument agentowy do przeniesienia **pomysłu badawczego**, nie kodu ani architektury, do osobnego projektu `Jozzpoly/ReflexBrain-Lab`. W Combat Lab jest to **CLOSED EXPLORATION / SHELVED DONOR**, nie nowa domyślna kampania. Owner zażyczył sobie: szeroko eksplorować → krytycznie zweryfikować → skonsolidować → rozważyć kierunek z agentem ReflexBrain → w Combat Lab powrócić do realnej fizycznej pracy i pierwszego uczciwego przeglądu.

## 0. Powód przekazania — vision, nie feature request

Początek: prawdziwy, nieupiększony screenshot Combat Lab Z1 obnażył ubóstwo świata i ciał lepiej niż kolejne machine PASS. Owner eksplorował:
- surowe kadry + krótkie serie fixed-step w trakcie 10–20 s, event/contact/trajectory/decision history (także B/W, 128–256 px);
- „PNG z 4 mapami” jako **kotwicę koncepcyjną**, nie wymóg RGBA; może być mały format niestandardowy, tablice liczbowe, event stream;
- lokalne obserwacje NPC ~24×24/64×64, zmienny FOV, kilka zakresów i skal/rozdzielczości, zróżnicowane właściwości sensoryczne, powiązanie z historią;
- inspirację wielkimi symulacjami z density-dependent crowd flow arrows, ale **bez polecenia wdrożenia flow nav ani traffic controller**;
- rozwijanie równolegle globalnej prawdy, lokalnej percepcji oraz debugowania ruchu, lokalnych reakcji i rzeczywistego źródła poleceń.

Prośba była o **głębszy research** i przekazanie myśli do ReflexBrain, nie o natychmiastową implementację.

## 1. Gdzie ReflexBrain rzeczywiście jest — stan źródłowo sprawdzony, ale datowany

**Nie zaczynać od `ReflexBrain-Lab/main` jako live wykonania**: README na `main@75b95725292fb73d9c8e322bce05bd285aeec237` wyraźnie podaje, że to historyczny R0. Ostatnio sprawdzona gałąź badań `research/octrl-g5-independent-ecology-pressure@7305e9eda54eff563a70921d27ed2c4ebb4ce261`; przed jakąkolwiek pracą agent ReflexBrain ma odzyskać **najnowszy aktualny** ref, PR, Owner correction i kanoniczny state dokument według własnego recovery. Nie traktować starszych `CONTINUE_HERE` i planów jako bieżącego NEXT.

Źródła sprawdzone:
- [charter](https://github.com/Jozzpoly/ReflexBrain-Lab/blob/research/octrl-g5-independent-ecology-pressure/docs/PROJECT_CHARTER.md): tani lokalny **learned semantic/reflex organ** wewnątrz ciągłego aktora, NIE whole NPC, planner, world authority, factual memory, motor controller lub mały LLM.
- [G5 post-medium replan](https://github.com/Jozzpoly/ReflexBrain-Lab/blob/research/octrl-g5-independent-ecology-pressure/docs/OCTRL_G5_POST_MEDIUM_REPLAN_2026-10-08.md): P0 private body/geometry evidence, P02a/b occlusion, H01 private history, C01 private-age CHECK; nie wolno dopuścić world events do prywatnej wiedzy bez zmysłu.
- [OCTRL G5-D0 result](https://github.com/Jozzpoly/ReflexBrain-Lab/blob/research/octrl-g5-independent-ecology-pressure/docs/runs/OCTRL-G5D0_RESULT.md): **discovery feasible, NO scientific PASS**. W testowanej konfiguracji P0 loss @ tick 51, proces rzeczywiście przemieszcza ukryty cel @111, self-initiated CHECK @231, pierwsza różnica prywatnych śladów dopiero przy legalnej obserwacji @313. To gotowy mocny **falsifier leaków w rasterze**, NIE kwalifikacja wizualnego braina.

Historyczne Owner R2 „klikalny mikroskop bez wartości eksperymentalnej” oraz późniejsze niezakwalifikowane organizmy pozostają ostrzeżeniem: **analiza wizualna bogatsza niż życie aktora ≠ postęp organizmu**. Host/medium/learned organ mają osobne granice. Nie wolno też zakładać, że istniejąca P0/P1 reprezentacja albo projekt O-CTRL jest finalnym medium sensorycznym.

## 2. Krytyczna teza

**Nie „NPC patrzy na PNG”.** Pytanie badawcze:

> Czy **legalna z perspektywy ciała** wieloskalowa obserwacja przestrzenno-czasowa dodaje informację użyteczną do taniej actor-relative oceny znaczenia i ciągłości — której nie dostarcza wystarczająco prosty strumień P0/zdarzeń/propriocepcji — przy akceptowalnym koszcie i bez przekształcenia ReflexBrain w planner albo sensory runtime?

Bardziej falsyfikowalne alternatywy:
1. **Structured/sparse wins**: obecne P0 blob geometry, normal/contact, relative velocity, sample freshness i actor-private history już wystarczają; obraz tylko koduje na nowo te same fakty.
2. **Spatial raster helps**: krótka *legalna* lokalna mapa układu przeszkód/kontaktów daje nowe rozróżnienia przy podobnej szybkości i prywatności.
3. **Multi-scale earns cost**: near high spatial detail + far coarse context rozwiązuje przypadki, w których jeden zakres albo próbkowanie gubi krytyczną relację.
4. **Temporal sparse/events beat frames**: percepcyjnie legalne zmiany + propriocepcja + historia rozróżniają przyczynę taniej niż gęste obrazy.
5. **None adds useful semantic residue**: bogatsza percepcja poprawia debugger/host perception, ale **nie** wartość samego learned organ; nie promować efektu hosta jako sukcesu ReflexBrain.

**Bardzo ważne:** „fakty mogą być reprezentowane jako obraz” nie znaczy, że model uczy się *widzenia* w sensie RGB. [MiniGrid](https://minigrid.farama.org/v2.2.0/api/wrapper/) ma 7×7×3 **symbolic partial observation**, a osobny wrapper dopiero generuje RGB. U nas ewentualne małe tablice kanałów są równie uprawnione jak piksele; ich semantyka musi być jawna.

## 3. Nienaruszalne granice prywatnej obserwacji

1. **World truth → lawful sensor → private history → candidate learned appraisal → shadow verdict**. Renderer/research microscope widzi świat; aktor nie. To, co w debug mapie jest znane, nie może przejść do NPC przez „ukryty kanał”.
2. **Nieobserwowane ≠ puste.** Jawna validity/visibility/freshness mask; pamięć nie jest teraźniejszym wzrokiem. Historyczne widzenie ma provenance/age oraz niepewność; nie uzupełniać zasłoniętych komórek prawdą World.
3. **Kanały nie są jednym systemem prawa:** visual sight blocker ≠ movement collider ≠ support ≠ author permission/social ownership. Właściwa reprezentacja ma scope, interpretację, jednostki, world→actor transform i dostępność. Żadnego stałego „R=terrain G=collision B=vision A=decision” jako uniwersalnej prawdy.
4. **Nie oszukiwać znaczenia:** nie kodować „zagrożenie”, „cel”, „własność”, „czy wolno pchnąć” jako ground truth feature, jeżeli organizm mógłby tę semantykę dopiero wywnioskować. Są to hipotezy/informacje tylko po legalnym uzyskaniu.
5. **Nie kodować research interventions jako doznań:** motor demand, action intended, experienced self-response i rzeczywisty impuls fizyczny to różne wartości. Obserwator nie jest clockiem organizmu.
6. **Nie dodawać aktorowi myśli, których nie ma:** Z1 jest researcher-driven, O-CTRL ma authored local monitor, lecz learned ReflexBrain nadal nie jest udowodniony. „Decision strip” ma pokazywać aktualnie istniejące przyczyny/stan, nie narratorowe intencje.

## 4. Największe mechaniczne ryzyka

- **Spatial aliasing:** `24×24` na 3m oznacza 12.5cm/cell, na 12m = 50cm/cell. Dünne przeszkody/kończyny mogą zniknąć; brak pikseli kolizji nie dowodzi przechodniości. Próbkowanie occupancy z zachowaniem ekstremów lub bezpośredni kontakt/proximity event mogą wygrywać.
- **Temporal aliasing:** 10Hz klatki nie wystarczą dla kontaktu trwającego 1–2 ticki. Contact/force wydarzenie zapisuje się ze źródła solvera, nie odtwarza „z obrazka”.
- **Egocentric transforms:** obrót NPC może całkowicie zmienić obraz przy niemal niezmiennym świecie. Odseparować ego-motion od ruchu obiektów, udokumentować heading, recentering, FOV, scale jitter i cadence.
- **Observation bandwidth:** `24×24×4 u8` = 2.25 KiB; `64×64×4 u8` = 16 KiB **na próbkę**, jeszcze bez historii. 100 aktorów, 10Hz, obie skale = ~18.7 MB/s **surowej przepustowości**, zanim doliczymy sampling/raycast, konwolucje i debug. Koszt compute może dominować nad surowymi bajtami. Zmierzyć, nie zgadywać.
- **Mask/reason failure:** jeden kanał „unknown” bez przyczyny myli poza-zasięgiem, occluded, niepróbkowane i out-of-domain. Czy każda różnica jest naprawdę potrzebna dla konkretnego zadania? Nie przesadzać z general schema.
- **Training leakage:** globalne World feature, zapisane solver object IDs, nazwy fixture i renderowane kolory mogą pozwolić learned modelowi rozpoznać scenę bez nauczenia się actor-relative meaning. Ścisłe held-out ecologies, sensor-ablation, scene variations i training/inference boundary.
- **Meaning vs behavior:** poprawa detekcji przeszkody/obrazu to *host perception competence*; ReflexBrain potrzebuje użytecznego **learned semantic residue** z prywatnej historii, najlepiej z późniejszym ograniczonym eksperymentem downstream (po zatwierdzeniu hosta). Nie rozszerzać scope by wymusić poprawę.
- **Renderer ≠ sensory organ:** debug POV z kamery gry nie staje się aktorowym wzrokiem bez prawa sensorowego. Raster z wewnętrznych typów World może być szybkim syntetycznym sensorem, ale jest to **świadoma abstrakcja**, którą trzeba testować osobno od faktycznej optyki.

## 5. Mały, uczciwy przyszły protokół (NIE aktywować automatycznie)

**Najpierw** ReflexBrain-agent odzyskuje live frontier i sprawdza, czy istnieje wartościowy *przypadek ambiguities* oparty na realnej legalnej P0 history, którego host/reference semantic layer nie potrafi rozróżnić. Jeśli nie ma, **nie implementować rasterów**.

Przy istnieniu kwalifikowanego pytania rozważyć separację:
- **P0 baseline:** dotychczasowe prywatne blob/contact/proprioception/history.
- **Fixed local symbolic map:** jednoskalowa, lawful actor-centric 24×24 lub inna resolution dobrana do *rozmiaru ciała*, nie magicznej liczby.
- **Multi-scale variant:** ten sam legalny sensor, bliski detal + daleki kontekst, explicit coordinate/range; więcej informacji musi być rozliczone jako **więcej informacji**.
- **Sparse temporal rival:** legalne obserwacje/zmiany+proprio/contact-history bez pełnej gęstej mapy.
- **Privileged truth ORACLE — ANALYST ONLY:** przydatny do upper bound i wykrywania leakage; nie wolno podawać go inference actorowi ani bez ścisłej kontroli do train.

Dwa porównania są konieczne: **matched-information** (inny kod tej samej legalnej informacji, czy warto raster?) oraz **additional-information** (czy szersze pole/multiskala wnosi nowy legalny sygnał wart kosztu?). Nie nazywać zwiększenia sensor range zwycięstwem reprezentacji.

Obowiązkowe teście przeciw:
- world changes while occluded → sensor NO leak until legal observation (G5-D0/P02);
- same current legal evidence, different private history → możliwa odmienna appraisal **po rzeczywiście przebytej historii** (H01);
- false negative at tiny passage/fast impulse → sparse direct contact law still wins (P01a);
- actor rotated/stopped/changed FOV → correct ego projection, no false object motion;
- held-out geography, body shape, temporary occluders, moving obstruction, staleness; no implicit world ID or magic re-identification.
- if sensor memory/vision helps authored controller only, keep as separate host donor and do not call ReflexBrain learner qualified.

Metrics beyond machine PASS: **net distinguishable actor-relative judgement**, generality/OOD, legality, sampling/CPU/memory and ability to show Owner a living, actually autonomous phenomenon. Negative result is an outcome; do not grow an instrumentarium around it.

## 6. Format choice, after scientific question

No proprietary archive yet. *Memory/runtime arrays* and *debug/recording* are separate products. Use typed arrays or sparse events in memory and a tiny versioned manifest for offline inspection if needed. Before adding new encoding compare to simpler primitives; Zarr/NGFF useful for future chunked multiscale stored arrays, EXR for high-precision diagnostics, PNG for visual snapshots. Avoid implying RGB alpha is four freely interchangeable sensors.

Sources on method:
- [MiniGrid symbolic partial observation](https://minigrid.farama.org/v2.2.0/api/wrapper/)
- [OctoMap unknown/free/occupied](https://octomap.github.io/octomap/doc/)
- [Traver & Bernardino log-polar review](https://www.sciencedirect.com/science/article/pii/S0921889009001687)
- [Event-based vision survey](https://pubmed.ncbi.nlm.nih.gov/32750812/)
- [Benchmarking Partial Observability (POBAX, 2025)](https://rlj.cs.umass.edu/2025/papers/Paper153.html)
- [Asymmetric actor-critic visual policy training; privileged critic not inference policy](https://arxiv.org/abs/1710.06542)
- [State-to-Visual DAgger vs visual RL, AAAI 2025](https://ojs.aaai.org/index.php/AAAI/article/view/33604)
- [Zarr v3](https://zarr-specs.readthedocs.io/en/latest/v3/core/index.html)
- [Combat Lab source research incl. density/flow and visual-truth capture](VISUAL_TRUTH_PERCEPTION_EXPLORATION_2026-10-10.md)

These studies demonstrate existing techniques/experimental warnings, **not their usefulness in ReflexBrain**.

## 7. Instrukcja dla rozmowy ReflexBrain — nie skopiuj architektury!

1. Najpierw odzyskaj własny live repo + branże/PR, bądź sceptyczny wobec historycznego `main` i `CONTINUE_HERE`.
2. Rozważ tę wizję jak **nową niezamrożoną hipotezę**. Omów ją szeroko, znajdź argumenty przeciw i przedstaw minimum kilka uczciwych reprezentacyjnych rywali.
3. Utrzymaj: `world truth ≠ lawful perception ≠ private memory ≠ learned meaning ≠ motor authority`.
4. Nie kończ dyskusji natychmiastowym technicznym planem ani „teraz kodujemy”; Owner właśnie przenosi **badawczą eksplorację**, a nie zlecenie feature'a.
5. Jeżeli cokolwiek materiałnie zmienia ReflexBrain, włącz dopiero wtedy w jego własne source-of-truth/plan po jawnej ocenie. Nie importuj kodu/Combat Lab solvera ani formatów.
6. Combat Lab wraca do **[Owner First Look](OWNER_FIRST_LOOK.md)** i fizycznego discovery. Nie ma zależności, która wymaga, by ten ReflexBrain research skończył się sukcesem.

**Preferowany handoff do osobnej rozmowy:** „W ReflexBrain wróć do aktualnych repo-native źródeł prawdy, a potem przeczytaj [ten most](REFLEXBRAIN_VISUAL_PERCEPTION_BRIDGE_2026-10-10.md). To pomysł o prywatnej wieloskalowej percepcji, nie implementacja ani nowa architektura; prowadź krytyczną dyskusję, zachowaj wszystkie granice projektu. Combat Lab pozostaje oddzielny.”
