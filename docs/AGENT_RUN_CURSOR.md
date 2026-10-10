# Combat Lab — AKTUALNY kursor runu

**Agent-only operacyjny wskaźnik (2026-10-10). Nie jest drugim RESEARCH_STATE, roadmapą ani Owner judgement.** Aktualizować **zastępując** sekcję TERAZ, wyłącznie po istotnej zmianie. Nie dopisywać historii dawnych NEXT. Stare wersje w Git.

## TERAZ — stan referencyjny (sprawdź live HEAD)

- Neutralne `main` przed tym checkpointem: `981f2bb9f672ca73f6ce84393701dcf8deeb4bd9`. Aktualny HEAD po commicie dokumentacyjnym będzie inny; sprawdź repo.
- Ostatnia ważna badana linia: `experiment/ground-contact-s2` — `ec237bfc1c45cf7d3ccd0f88f0720e9a10c95332`; real-Chromium CI PASS (zob. [raport S2](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/ground-contact-s2/docs/S2_GROUND_CONTACT_CHECKPOINT_2026-10-10.md)). K1, Z1, Y1, X0 pozostają unmerged donor-only.
- Publiczny `rehearsal/current`: `cb4b44d417db612f3333fe515e6f6afffa3e56d8`, nie zmieniać odruchowo.
- **S2 ustalił:** realne contact-ground support, falling przy usunięciu podłoża i material load. **S2 nie ustalił:** że 3D wygrywa z odpowiednio świadomym tanim 2D, że mamy chód/postawę/żywy tłum ani że Owner zaakceptował prototyp.
- **Najważniejszy próg:** nowa jakość działań i eksperymentowania w **jednym wiarygodnym świecie**; wybór fizycznej reprezentacji ma być konsekwencją tego wymagania. Historyczne Owner R0/R1/L0 FAIL nie zostały odwrócone.
- **Najbliższy run — faza A OBOWIĄZKOWA:** odzyskaj aktualny Owner intent, live refs, świeże testy; obejrzyj/przetestuj adekwatną istniejącą wersję i sprawdź zgodność z wizją. Następnie rozstrzygnij, czy dalszy „support” wymaga całościowego nowego specimen, czy najpierw trzeba obalić konkretne 2D/3D założenie. **Nie wdrażaj S3 ani 3D automatycznie.**

## AKTUALNY PRIORYTET — gotowy do udostępnienia Owner First Look Z1

- [Review branch](https://github.com/Jozzpoly/Combat-Lab/tree/review/owner-first-look-z1) `73a0945d6c660851a877dc7b095c511badd9b2a9`. Exact-head [CI PASS 38078641528](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38078641528) obejmuje realne kliknięcia przycisków, pointer canvas, WASD, przebudowę 2→0 fizycznych ramion, zapis świata oraz fizykę Z1. Jest [screenshot pierwszego ekranu](https://github.com/Jozzpoly/Combat-Lab/blob/review/owner-first-look-z1/docs/media/owner-first-look-z1-first-frame.png).
- **Nie ma hostowanego linku do gry.** Ostatnia niezastąpiona publiczna wersja `rehearsal/current@cb4b44d4` pozostaje neutralnym smoke. Strona GitHub Pages wymaga osobnej zgody na publiczne zastąpienie. Nie twierdzić, że sama gałąź jest działającą stroną. [Szczegóły zgody i rollback](OWNER_FIRST_LOOK.md).
- **Pierwszy ruch następnego runu:** sprawdzić live refs, nowszy Owner feedback i jakość dokładnej wersji preview. Jeśli Owner zatwierdzi publiczne czasowe wdrożenie, użyć mechanizmu `rehearsal/current` z zachowaniem starego SHA i przetestować opublikowane UI. Jeżeli nie zatwierdzi, nie implementować nowego systemu; wypracować wygodny rzeczywiście przetestowany alternatywny dostęp.
- Owner może uznać pokaz za FAIL. Jego feedback powinien kierować następnym światem, a nie kończyć się listą koniecznych poprawek na tym samym Z1.

## STAŁE ŹRÓDŁA I PIERWSZY RUCH

1. [VISION_ADAPTIVE_ROADMAP](VISION_ADAPTIVE_ROADMAP.md) — cel i alternatywy, nie kolejka.
2. [CAMPAIGN_RUNBOOK](CAMPAIGN_RUNBOOK.md) — faza A–E każdego długiego runu.
3. [RESEARCH_STATE](RESEARCH_STATE.md) i [EXPERIMENT_PROTOCOL](EXPERIMENT_PROTOCOL.md) — authority, dowody i ograniczenia.
4. Live branch HEAD/CI, aktualny source/real browser; świeży Owner feedback przed jakimkolwiek kodem.
5. Raporty eksperymentalne: [S2](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/ground-contact-s2/docs/S2_GROUND_CONTACT_CHECKPOINT_2026-10-10.md), [K1](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/posture-contact-k1/docs/K1_POSTURE_CONTACT_CHECKPOINT_2026-10-10.md), [Z1](https://github.com/Jozzpoly/Combat-Lab/blob/experiment/contact-only-relations-z1/docs/Z1_CONTACT_ONLY_CHECKPOINT_2026-10-10.md). Historię pozostałych znajdziesz w git i `RESEARCH_STATE`.

**W przypadku zerwania:** sprawdź dokładne SHA, dokonane zapisy i CI przed ponowieniem wywołania. Jeżeli blocker wymaga Ownera, wskaż go wprost. Żadnego nieuzasadnionego merge, deploy ani product PASS.
