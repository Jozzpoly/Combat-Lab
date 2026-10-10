# Combat Lab — sposób prowadzenia długich kampanii

**Operacyjny playbook, 2026-10-10. Dotyczy kolejnych runów; można go zmienić po nowym evidence i Owner feedback.** Nie zastępuje [EXPERIMENT_PROTOCOL](EXPERIMENT_PROTOCOL.md), [RESEARCH_STATE](RESEARCH_STATE.md) ani bieżącej intencji Ownera. [Wizja + roadmapa](VISION_ADAPTIVE_ROADMAP.md).

## Zasada nadrzędna

Agent bierze odpowiedzialność za odzyskiwanie kontekstu, wybór badania, pracę techniczną, falsyfikację, dokumentację i bezpieczne wznowienie. „Kontynuuj” nie jest zgodą na odtwarzanie poprzedniego NEXT ani prośbą o pięć małych zadań. Nie kończyć tylko dlatego, że jeden build jest zielony. **Nie wydłużać sztucznie runu**: stop przy realnym spadku wartości, błędzie granicznym, potrzebie Owner judgement lub uczciwym zamknięciu etapu.

## Obowiązkowa faza A KAŻDEGO runu: odzyskanie + jakość + zgodność z Ownerem + test istniejącego

To jest **rzeczywista faza pracy**, nie formalny wstęp i nie copy-paste poprzedniego checkpointu. Jej głębokość zależy od skali zmiany, ale **nie wolno jej pominąć**.

1. **Owner:** najnowszy jawny feedback, obserwacje i korekty; w razie potrzeby wcześniejsza historia projektu. Wyodrębnić rzeczywisty cel, twarde antycele i produktowy FAIL/UNKNOWN. Przy konflikcie późniejsza obserwacja Ownera wygrywa z maszyną i dokumentem.
2. **Live truth:** `main`, aktywne/izolowane eksperymenty, `rehearsal/current`, dokładne HEAD/PR/CI/deploy; `RESEARCH_STATE` i aktywny [AGENT_RUN_CURSOR](AGENT_RUN_CURSOR.md). Nie polegać na pamięci, samym cursorze ani starym README. Odróżnić `written / tested / CI pending / failed / never executed`.
3. **Test tego, co mamy:** uruchomić realny, aktualnie istotny specimen i zweryfikować *co najmniej jeden kluczowy przebieg* z prawdziwym fizycznym skutkiem i kontrolą negatywną; sprawdzić UI/provenance, screenshot/wideo gdy użyteczne. Jeśli brak wykonywalnego środowiska lub uprawnień, zaznaczyć `NOT TESTED THIS RUN`, przejść przez ostatnią pewną próbę, szukać taniego rozwiązania — **nie deklarować własnego PASS**.
4. **Ocena Owner fit:** skonfrontować zaobserwowane możliwości z tym, co Owner mógłby rzeczywiście spontanicznie chcieć testować. Czy mamy nowe działanie/wybór w jednym świecie, czy tylko poprawiony licznik? Czy doświadczenie przekracza stary Owner FAIL? Jeżeli nie wiadomo: **UNKNOWN**, nie „prawdopodobnie zaakceptowane”.
5. **Decyzja przed kodem:** kontynuować / podważyć hipotezę / przebudować / zdegradować do donora / wstrzymać; wskazać jeden konkretny powód. Krótka lokalna notatka fazy A wystarcza, nie trzeba tworzyć commita co run.

**Gdy stan się nie zmienił:** odzyskać tylko delty z poprzedniego checkpointu, ale nadal wykonać punkt 3 i ponowić punkt 4. **Gdy rozmowa, narzędzia lub CI przerwały run:** przed ponownym zapisem najpierw ustalić, które commity i działania rzeczywiście się wykonały. Nigdy nie zakładać ani sukcesu, ani porażki z samego zerwania odpowiedzi.

## Faza B: wybór jednego ważnego pytania i trybu

Napisać roboczo maks. kilka zdań:

**Pytanie → konkurujące wyjaśnienia → porównywalny baseline → co rzeczywiście zmieni decyzję Ownera / przyszłą architekturę → falsyfikator → koszt/stop.**

Wybierać świadomie **discovery / diagnosis / serious construction / lab infrastructure** zgodnie z `EXPERIMENT_PROTOCOL`. Po mechanistycznej diagnozie wrócić do celu wyższego rzędu zamiast nadbudowywać kolejną diagnozę. Nowa implementacja nie dziedziczy autorytetu dawcy. Brak danych do wybrania modelu = badanie/research, a nie zgadywany wybór 3D.

## Faza C: długa samodzielna realizacja

- Pracować w spójnych blokach semantycznych: przemyśl → zmień → uruchom → obejrzyj → skoryguj → powtórz. Nie zatrzymywać po pojedynczym commicie/test suite. Jeśli mechanizm nie daje wartości — wrócić do pytania, nie stroić go bez końca.
- **Realny obiekt badania ma pierwszeństwo:** aplikacja/browser/solver, stan świata, przyczynowość, czytelny input i różne sposoby ingerencji. Sama dokumentacja, kompilacja czy „ładny dashboard” nie zastępują eksperymentu.
- Porównania mają uczciwą kontrolę: nieruchomy/idle, wyłączony actuator lub tanie rigid/2D rozwiązanie, zależnie od twierdzenia; nie handicapować rywala. Rozróżniać ingerencję eksperymentatora, energię świata, reakcję aktora i bierną fizykę.
- W razie użycia 3D mierzyć też CPU/memory/solver cost wobec 2D, gdy wybór technologii tego wymaga. **Nie wymuszać benchmarku przy każdej drobnej zmianie**.
- Ciężki, przyczynowo odrębny wynik może zmienić plan *w środku runu*. Nie trzeba Ownera do odwracalnej zmiany zakresu badań.
- CI komitować w większych spójnych pakietach (atomowe Git trees, gdy konektor na to pozwala). Nie tworzyć dziesiątek pushy tylko po to, by zasilić narrację postępu.

## Faza D: red team + odbiór całości

Przed uznaniem wyniku:

- Powtórzyć kluczowy przypadek i co najmniej jedną niekorzystną zmianę świata/masy/anatomii/sterowania.
- Odróżnić **mechanical PASS / observed / FAIL / not tested / Owner UNKNOWN**; negatywny wynik jest pełnowartościowy.
- Sprawdzić wykonany dokładny commit w przeglądarce i czy główne działania są dostępne operatorowi, nie tylko testowi w kodzie.
- Spojrzeć z perspektywy przychodzącego eksperymentatora: czy widać, co można zrobić? Czy spora część pola jest martwa? Czy to tylko stare R0/L0 w nowym opakowaniu?
- Jeśli całość jakościowo stoi w miejscu, **nie awansować jej do „fundamentu” przez sumę przejść CI**.

## Faza E: domknięcie lub checkpoint kontynuacji

Zapisujemy tylko to, co przyda się następnemu agentowi:

- Gdy zmieniła się prawda badawcza: krótka poprawka `RESEARCH_STATE.md`, evidence + negatywne kontrole w raporcie kandydata, wskazanie odpowiedniego źródła.
- Gdy zmienił się stan operacyjny: **jedna aktualna** sekcja `AGENT_RUN_CURSOR.md`; bez dopisywania dawnych NEXT jako żywego planu.
- Gdy zmieniła się droga do celu: odpowiednio zrewidować [wizję/roadmapę](VISION_ADAPTIVE_ROADMAP.md), wraz z *powodem*, nie przez zmianę tabeli w CI.
- GitHub: aktualny HEAD, CI o dokładnie tym SHA, otwarte PR-y, eksperymentalność/merge/publikacja. Żadnego Owner PASS z automatu.
- Dla niedokończonego etapu: **co jest zapisane / potwierdzone / w toku / zablokowane / pierwszy ruch po wznowieniu**. Wznowić po przerwie od live refs, nie od zgadywania stanu.
- Owner dostaje kompaktową relację: **co naprawdę się zmieniło → co nie wyszło / granica → jaki próg dalej**. Kompas „ZA NAMI / TERAZ / DALEJ / CEL” tylko przy ważnym checkpointcie, bez fikcyjnych procentów.

## Jawnie nowa granica: wczesny przegląd prawdziwego stanu

[OWNER_FIRST_LOOK](OWNER_FIRST_LOOK.md) to priorytet nadmiernie odkładany przez wcześniejsze kryterium „Owner-worthy”. **Nie wymaga PASS produktu, pełnej wizji, rozbudowanego UI ani gotowego whole.** Wymaga tylko uruchamialnej, agent-sprawdzonej wersji z uczciwymi ograniczeniami i prostym dostępem. Owner ma zobaczyć mechanizmy na własne oczy, zanim agent będzie kolejne tygodnie domyślał się ich wartości. Nigdy nie deklarować Owner PASS zamiast niego.

Pokaz można przygotować w ramach discovery albo osobnej kampanii review; nie rozbudowywać silnika, żeby dobrze wyglądał w prezentacji. **Nie publikować publicznego builda automatycznie** — przygotowanie i wdrożenie to osobne działania.

## Kiedy wracać do Ownera

Wymagać feedbacku przede wszystkim dla rzeczywistego doświadczenia, ważnego kompromisu gustu/celu, publikacji lub nieodwracalnego działania. **Nie odkładać uczciwego, wczesnego przeglądu tylko dlatego, że agent uważa prototyp za ubogi.** Agent sam naprawia błędy uniemożliwiające normalne uruchomienie i jawnie opisuje braki; Owner ma prawo uznać specimen za FAIL i nadać inny kierunek. **Bez nowego Owner testu outcome produktu = UNKNOWN**, nawet po dziesięciu PASS-ach.

Jeżeli mocna hipoteza rozpadła się po kontroli, agent nie prosi Ownera o ratowanie planu: zapisuje FAIL, odzyskuje „po co”, selekcjonuje inne pytanie i kontynuuje odpowiednio do pozostałego budżetu pracy.

## Bezpieczeństwo zakresu i realistyczne możliwości

- `main` neutralne, eksperymenty odizolowane. `rehearsal/current` i publiczny deploy tylko po jawnej decyzji; nie usuwać/refaktoryzować historycznej forensyki w trakcie obcego eksperymentu.
- Gdy brak dostępu do repo/pliku/narzędzia: jedna lub dwie rozsądne próby, a potem jasne wskazanie blokady i **dokładnych** potrzebnych plików, zamiast godzinnych obejść. Nie używać kosztownego browser automation, gdy tańszy GitHub/Chrome/smoke wystarcza.
- Wydłużenie runu samo w sobie nie zwiększa wartości. Nie wykonywać prac po zakończeniu wiadomości bez rzeczywistego trybu uruchamiania zadań w tle.
- `AGENT_RUN_CURSOR` jest wskazówką operacyjną; **live code + aktualny Owner judgement** są źródłem decyzji, nie on.

## Szybki test jakości samego procesu

Run był dobry, jeśli **samodzielnie** odzyskał i sprawdził stan, zidentyfikował właściwą niepewność, dokonał znaczącego kroku lub uczciwie odrzucił drogę, nie zamienił machine PASS na product PASS, zapisał wystarczający handoff i nie wymagał ciągłego `kontynuuj` do każdego lokalnego zadania.

Jeśli go nie spełniał, najpierw poprawić proces, a dopiero potem produkować kolejne mechaniki.
