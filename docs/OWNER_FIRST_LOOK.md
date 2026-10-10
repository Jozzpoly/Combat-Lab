# Combat Lab — pierwszy uczciwy przegląd Ownera

**Status 2026-10-10: działający, CI-zweryfikowany kandydat przeglądowy jest gotowy na gałęzi review; BRAK hostowanego linku do gry i BRAK Owner oceny.** Chodzi o umożliwienie osobistego sprawdzenia stanu, nie o ogłoszenie gry, wybór architektury, odwrócenie historycznych FAIL-ów czy publikację. Aktualna [wizja](VISION_ADAPTIVE_ROADMAP.md) i [RESEARCH_STATE](RESEARCH_STATE.md) pozostają kontekstem.

## Gotowy kandydat do pierwszego uruchomienia (źródło prawdy: exact SHA)

- [Przegląd Z1 — źródło i polskie objaśnienia](https://github.com/Jozzpoly/Combat-Lab/tree/review/owner-first-look-z1), HEAD `73a0945d6c660851a877dc7b095c511badd9b2a9`. Fizyka przeniesiona bez świadomych zmian z `experiment/contact-only-relations-z1@f2d71e63`; zmiany dotyczą prezentacji, usunięcia nieosiągalnego fragmentu UI oraz testów operatora.
- [Rzeczywisty, nieupiększany pierwszy ekran](https://github.com/Jozzpoly/Combat-Lab/blob/review/owner-first-look-z1/docs/media/owner-first-look-z1-first-frame.png) z faktycznego Chromium.
- [CI exact-HEAD 38078641528](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38078641528): PASS dla fizyki Z1 oraz użycia przycisków, zaznaczenia obiektu zdarzeniem canvas, klawiatury WASD, rzeczywistej przebudowy 2→0 ramion bez resetu świata i zapisu sceny.
- **Owner verdict:** UNKNOWN. Nadal mechaniczny, ubogi świat; brak autonomicznej inicjatywy, chodu, wiarygodnego support i gotowego combat.
- **Publiczna granica:** `rehearsal/current` wciąż `cb4b44d417db612f3333fe515e6f6afffa3e56d8`; GitHub Pages pokazuje neutralny smoke test, nie nową wersję. Istniejący workflow może wdrożyć przegląd, ale **to zastąpi aktualny publiczny pokaz i będzie publicznie dostępne**. Nie robić bez jawnego przyzwolenia Ownera. Po zgodzie zachować powyższy commit jako rollback source i rezweryfikować realnie wdrożony Pages.
- StackBlitz dokumentuje import publicznych gałęzi GitHub, lecz **ten konkretny build nie został w nim zweryfikowany**, więc nie należy podawać importu jako gotowego, działającego linku.

**Następna decyzja Ownera (prawdziwa, nie delegować bez przyzwolenia):** czy wolno tymczasowo wystawić ten sprawdzony eksperyment na publicznej stronie GitHub Pages, zastępując neutralny smoke, żeby Owner mógł go po prostu otworzyć w przeglądarce. Jeśli nie, zachować izolowany preview i poszukać wygodnego niepublicznego sposobu dostępu, nie publikując w ciemno.

## Co Owner powinien móc zobaczyć

**Nie sprawozdanie z testów, tylko prawdziwe działające obiekty.** Swobodnie zmieniać parametry, uruchamiać, obserwować, próbować popsuć, bez odgrywania scenariusza. Krótki, uczciwy wstęp musi odróżniać fizycznie zaobserwowane efekty od jeszcze nieistniejących elementów marzenia.

Przegląd należy umożliwić **w rozsądnym terminie, bez wymagania „Owner-worthy PASS” przed jego pokazaniem**. Niski poziom dojrzałości jest dopuszczalny, jeśli jawnie go przedstawimy. Przed pokazaniem trzeba jedynie usunąć oczywiste awarie, zweryfikować rzeczywisty build i zadbać, żeby Owner nie tracił czasu na techniczne obejścia.

## Kandydaci do rzeczywistej demonstracji — stan na 2026-10-10

| Scena | Uczciwie pokazuje | Nie wolno sugerować |
| --- | --- | --- |
| **Z1 — rekomendowany pierwszy kontakt** | Kontakt ciała z wolną materią, zawiasem, suwakiem, sterowane oddziaływanie kolejnego organizmu; bez sztucznego chwytu | Że to zróżnicowane zdolności istot, naturalny crowd/combat lub spontaniczny żywy świat |
| **X0 — opcjonalna druga scena** | Przebudowa rzeczywistego kadłuba/ramion w działającym świecie, sterowanie kończynami, lokalne odruchy | Że powstał swobodny kreator organizmów albo inteligentne istoty |
| **S2 — opcjonalna analiza fizyki** | Prawdziwe 3D podparcie/tarcie, obciążenie i utrata podłogi, kontrast z tanim 2D | Że wybrano 3D, stworzono chód, stance lub walkę |
| **K1 — materiał ostrzegawczy, nie sukces produktu** | Ramiona zmieniają obrys; wyłączenie sztucznego hamowania niemal znosi skuteczne blokowanie | Że mamy wiarygodną postawę defensywną |

To **osobne eksperymenty**, nie moduły już działające w jednym produkcie. Nie budować nowego wspólnego runtime tylko po to, żeby zaprezentować gotowość, której nie ma. Zredukować wybór do jednego prostego pierwszego uruchomienia; pozostałe oferować jako fakultatywne.

Źródła: [Z1](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/contact-only-relations-z1/docs/Z1_CONTACT_ONLY_CHECKPOINT_2026-10-10.md), [X0](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/material-commons-x0-whole/docs/X0_LOCAL_RESPONSE_GENERALIZATION_2026-10-10.md), [S2](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/ground-contact-s2/docs/S2_GROUND_CONTACT_CHECKPOINT_2026-10-10.md), [K1](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/posture-contact-k1/docs/K1_POSTURE_CONTACT_CHECKPOINT_2026-10-10.md).

## Najkrótsza droga od źródeł do Ownera

1. **Audyt istniejących artefaktów i prawdziwego UI.** Dokładne branch SHA, workflow checks, wyemitowany build, realna obsługa myszy/klawiatury, kamera, pauza, restart, edycja. Agent samodzielnie uruchamia i obserwuje wybrany kandydat, w tym jeden negatywny przypadek.
2. **Jedna spójna ścieżka wejścia.** Staging *istniejącego* eksperymentu jako samodzielnie używalny build lub prosty przegląd kilku źródłowo przypiętych scen. Bez wymuszania instalacji, budowania ze źródeł czy ręcznego wklejania SHA przez Ownera, jeśli możliwy jest bezpośredni odnośnik. Pozostawić możliwość swobodnej zabawy; nie wprowadzać autoodtwarzanego pokazu zamiast sterowania.
3. **Jasny opis pierwszego ekranu:** „Co możesz tutaj spróbować”, „Co nie działa / czego tu jeszcze nie ma”, „Co wyniki naprawdę dowodzą”. Wystarczy kilka zdań; pełna dokumentacja dla agenta może pozostać w repo.
4. **Weryfikacja dokładnego przekazywanego artefaktu.** Nie mylić zielonego CI gałęzi z testem faktycznie otwartego builda. Test interakcji i provenance. Nie stawiać przed Ownerem surowego, nieuruchamiającego się prototypu.
5. **Przedstawienie Ownerowi** jako niedokończonego, badawczego stanu. Zachęcić do dowolnego psucia i obserwacji, nie prosić o odhaczanie 20 testów. Jeden krótki feedback jakościowy jest cenniejszy niż wymuszona ocena liczbowych metryk.

### Granica publikacji i zgody

Obecny publiczny `rehearsal/current` wciąż wskazuje na neutralny smoke test. **Nie zmieniać go i nie wdrażać publicznie bez świadomej decyzji Ownera.** Przygotować zweryfikowany, przypięty SHA artefakt przeglądowy poza publicznym deploymentem, jeśli technicznie możliwe. Jeżeli jedyna prosta ścieżka jest publiczna, jasno przedstawić tę konkretną granicę i poprosić o akceptację dopiero kiedy build jest gotowy. Nie interpretować tej prośby o przyszłą prezentację jako zgody na publiczne wdrożenie.

## Co zmieniamy w praktyce projektu

Dawna zasada „nie wołaj Ownera zanim specimen przejdzie barierę jakości” była zbyt szeroka. Zachowujemy ją **dla twierdzenia, że coś jest dobrą grą / gotowym publicznym doświadczeniem**, ale nie dla **uczciwej obserwacji stanu badań**. Owner może chcieć zobaczyć zbyt ubogi prototyp właśnie po to, żeby przełamać agentowe błędne wyobrażenie o tym, co ma znaczenie.

**Nowe kryterium: gotowość do prawdziwego uruchomienia i świadomie ujawnione ograniczenia, nie wcześniejsze przekonanie agenta, że Ownerowi się spodoba.**

## Oczekiwana korzyść po pierwszej prezentacji

Uzyskać obserwacje Ownera o tym, co faktycznie próbuje robić, co go zatrzymuje, jakie możliwości zaczyna spontanicznie testować, a co pozostaje „mechaniczną planszą”. Jego **FAIL / zaskoczenie / odkrycie** może całkowicie zmienić roadmapę. Feedback nie jest obowiązkową zgodą na rozwijanie wybranej wersji.
