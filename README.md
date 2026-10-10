# W2 — conditional research branch

This branch contains an isolated W2 multi-organism/material experiment, **NOT** the accepted Combat Lab and **NOT** a published rehearsal. Run local `w2.html` to inspect the W2 candidate; `index.html` retains the unmodified E1 donor page for regression. Exact source image evidence and adversarial limitations: [W2 report](docs/W2_INTEGRATED_MATERIAL_COMMONS.md). `main` and `rehearsal/current` are unaffected. Mechanical Chrome PASS does not replace Owner judgement.

---

# Combat Lab — E1: lokalne działanie w jednym świecie

**Izolowany kandydat badawczy, nie zaakceptowany organizm, silnik ani publiczny build.** [Pełny wynik + kontrprzykłady](docs/E1_WHOLE_LOCAL_ENCOUNTER_CHECKPOINT_2026-10-10.md) · [PR #9 (Draft)](https://github.com/Jozzpoly/Combat-Lab/pull/9).

E1 wykorzystuje **zastępowalną** fizykę M0/Rapier2D: 18 ciał w trzech konstrukcjach (sztywne, trzyczłonowe, sprężyste). Mają lokalne pobudki do działania, ale wszystkie napędzane są ograniczoną, **zewnętrzną siłą na kadłubie**, a nie prawdziwymi nogami. Źródła zapachu są realnymi ruchomymi przedmiotami, nie niewidzialnymi waypointami. Reakcje na nacisk wykorzystują kontakty ostatniego kroku solvera, nie globalny AI planner. Nie ma walki, inteligencji NPC ani poznawania mapy.

## Eksperymentuj

- **Obserwuj** reakcje istot, przesuwanie brył i zmiany skupień przy lokalnych źródłach.
- **Przejmij ciało** kliknięciem; WASD steruje nim, a przycisk „Oddaj kontrolę” przywraca samodzielną lokalną motywację.
- **Pauza + Ctrl-przeciąganie** przemieszcza rzeczywiste ciała i przedmioty.
- **Kliknij barwne źródło zapachu**, zmień tylko jego sygnał, albo fizycznie przenieś cały przedmiot. Obie interwencje mają osobne skutki.
- Wyłącz wszystkie lokalne napędy, odłącz reakcje decyzji na nacisk lub wyłącz wewnętrzne mechaniczne odruchy, aby porównać zachowanie tego samego świata.
- Dodawaj organizmy, źródła i zwykłą materię. Kółko — zoom, środkowy przycisk — kamera.

Wizualne kręgi są jedynie pomocniczymi oznaczeniami sygnału, nie colliderami ani dokładną geometrią zmysłu. Bryła sprężysta ma osobne masy; graficzny obrys **nie jest szczelną fizyczną membraną**.

**[Prawdziwy kadr początkowy](docs/media/e1-actual-t0.png) → [ten sam świat po 480 krokach](docs/media/e1-actual-t480.png).** [Chromium/WASM i interakcje 38091308778](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38091308778) PASS; to dowód działania technicznego, **NIE** jakości Ownera. 30-istotowy krótki stress bez NaN, bez wiarygodnego pomiaru FPS.

E1 może nadal przypominać tłok prostokątów i nie dowodzi wartościowo odmiennych możliwości ciał. Nie wolno uznać go za nowy fundament ani masowo tuningować „AI”, żeby zwiększać liczniki.

### Uruchomienie prywatnej kopii źródła

W Node.js: npm install, npm run build; serwuj wygenerowany katalog dist/ przez HTTP. Automatyczne testy: npm test, potem prawdziwa przeglądarka Chromium przez repozytoryjny workflow. Flagi e1probe=A/B, e1causal=C/D, e1frames=1, e1ownercheck=1 są wyłącznie diagnostyczne. Żaden nowy publiczny link do gry nie został wdrożony.

Aktualny punkt wznowienia projektu: [RESEARCH_STATE](https://github.com/Jozzpoly/Combat-Lab/blob/main/docs/RESEARCH_STATE.md) i [AGENT_RUN_CURSOR](https://github.com/Jozzpoly/Combat-Lab/blob/main/docs/AGENT_RUN_CURSOR.md).
