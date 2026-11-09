# Combat Lab → Jaskinia Worldbench physical integration / 2026-11-06

## 9 XI, późna próba — zachowane okno ≠ zachowany świat

[Cross-repo Chromium × Rapier #42715217484](https://github.com/Jozzpoly/Jozz-Cave-Workbench/actions/runs/42715217484) PASS w izolowanej gałęzi. **Fakty obserwacyjne, nie nowa polityka Jaskini:**

- Przed `page.reload()`: oryginalny fizyczny P10b, włączona pauza, rzeczywiście poszerzona szczelina **3,50 m**, źródłowy licznik edycji **1**.
- Wykonano zapis układu starej Jaskini, pełny reload i ponowne połączenie z przyrządem.
- Po reloadzie: **ta sama** nazwana pracownia i **ten sam identyfikator okna**, lecz **NOWE** `runtimeId`; fizyczna szczelina znów **2,20 m**, edycji **0**, pauza wyłączona.
- Nawet po ponownym włączeniu uprawnienia edycji **w nowej sesji** komenda z `runtimeId` poprzedniego świata została odrzucona jako **`stale-runtime`**. Źródłowy collider nie został zmieniony.
- Test z ukrytym iframe powtórzył **0** kroków fizyki między dwoma bezpośrednimi odczytami przy oknie pozostającym ukrytym.

**Poważne zagrożenie na poziomie UX i przyszłych fundamentów:** Jaskinia obecnie zapisuje *stan własnej przestrzeni pracy* (w tym adres laboratorium) i umie odtworzyć jego wygląd, ale nie ma dowodu automatycznego utrwalenia *stanu wewnętrznego obcej fizyki*. Nie nazywać przywrócenia układu `resume` konkretnego świata. To nie świadczy o błędzie starego kontraktu — on tej gwarancji nie zawierał. W docelowej Jaskini potrzebujemy uczciwej informacji o tym, czy nastąpił nowy rozruch, powrót do wciąż żywej instancji, odtworzenie zatwierdzonego zapisu, jawne rozgałęzienie czy połączenie z zewnętrznym autorytetem. Tych sposobów nie wolno utożsamiać.

**Dlaczego nie dodano teraz save/replay:** P10b nie ma udowodnionej pełnej serializacji Rapiera, source-authored reset/restore ani historii operatora. Zapisywanie rysunku lub `world.trace()` jako `solver checkpoint` byłoby fabrykowaniem możliwości. Nowa Jaskinia ma oddzielny badawczy rdzeń rekordów `R1`; nie robić z niego automatycznie głównego runtime symulacji. Autorstwo, tożsamość kodu, tożsamość uruchomienia, czas symulacji, odtwarzalność i prawo do mutacji są rozdzielnymi pytaniami.

**Kolejny falsyfikator:** porównać z drugim, naprawdę zdolnym do checkpointu laboratorium (np. ReflexBrain LIFE/L1), aby nie promować ograniczeń P10b do ogólnej polityki Jaskini. Nie scalać, nie wdrażać, nie narzucać wspólnego formatu całemu ekosystemowi.


## Metodologiczna korekta / 9 XI 2026 — świat naprawdę ukryty, a nie dopiero przywrócony

**Nowy, wyraźnie lepszy test:** [GitHub Actions #42711325258](https://github.com/Jozzpoly/Jozz-Cave-Workbench/actions/runs/42711325258), rzeczywisty Chromium, Jaskinia v6.4.1 i przypięty fizyczny P10b Rapier. Wysłano dwa niezależne, powiązane ze źródłowym iframe żądania odczytu **gdy samo okno wciąż miało `hidden=true`**. Nie przywracano go między próbkami.

- 53 kroki Rapiera w poprzedzającym **widocznym** oknie 850 ms.
- Dwa odczyty ukrytego świata oddzielone ~1080 ms: `tick=121` oraz `tick=121`, czyli **zero** kroków pomiędzy nimi.
- Odpowiedź na `postMessage` dotarła z ukrytej ramki; źródło pozostawało dostępne do odczytu, mimo że jego pętla `requestAnimationFrame` nie postępowała w tym przedziale.
- Identyfikator fizycznego runtime przed ukryciem i po powrocie pozostał ten sam. Bezpośredni odczyt zaraz po pokazaniu nadal wskazał `tick=121`.

**Poprzedni wynik 1–2 kroków „w tle” był obciążony błędem metody:** odczyt wykonywano dopiero *po przywróceniu widoku*, a `p10-ui.js:frame()` po wznowionym `requestAnimationFrame` może wykonać kilka kroków (delta ograniczona do 0.05 s). Poprzedni iloraz ~1–2.3% **nie jest poprawnym oszacowaniem fizyki wykonywanej podczas ukrycia** i nie powinien być używany dalej.

**Granica uogólnienia:** wynik dotyczy badanego, ukrytego `iframe` w Chromium i pętli P10b, nie wszystkich przeglądarek, systemów, Workerów ani wszystkich światów. `0` zmierzonych kroków nie dowodzi, że nic innego (wiadomości, zdarzenia, pamięć, sieć) w tle nie może działać. To dowód rozdzielenia: *istnienie instancji* / *możliwość odczytu* / *postęp fizyki* / *utrwalenie stanu*. Ostatniego nie badano.

**Następny ważny falsyfikator etapu I:** czy host może bez przywrócenia widoku bezpiecznie wskazać i odczytać istniejący świat z innej pracowni? Sam Worldbench `capture(id)` obecnie sprawdza `L.wins[id]`, czyli układ **aktywny**, i może odrzucić działający obiekt w nieaktywnej przestrzeni; surowy test źródłowy dotarł do iframe przez zachowane `__JASK.RT`. Nie przyjmować tego hacka za projekt nowego API. Najpierw określić intencjonalną politykę dostępu oraz izolację i autorytet źródła.


**Status: isolated source/e2e experiment, NOT an accepted gameplay, body, framework, replay or release.** This branch derives from exact P10b research head; it is not `main` or `rehearsal/current`. Companion old Jaskinia branch and draft [PR #7](https://github.com/Jozzpoly/Jozz-Cave-Workbench/pull/7); this branch's draft [PR #15](https://github.com/Jozzpoly/Combat-Lab/pull/15).

## CURRENT (7 Nov 2026) — live recovery point

- **Exact paired verification now current:** [Jaskinia browser CI #42316347341](https://github.com/Jozzpoly/Jozz-Cave-Workbench/actions/runs/42316347341) passed against this branch's latest audited source `de357943156a48691925034851ea707e7d01c598`. [Independent Combat CI](https://github.com/Jozzpoly/Combat-Lab/actions/runs/42310444316) also passed. The historical earlier CI/revisions below remain provenance, not current HEAD.
- **Corrected 9 XI:** same real physical instance survived a Jaskinia workspace switch. Earlier apparent 1–2 hidden steps were measured only **after returning** and could originate from resumed rAF. A direct witness sampled twice **while hidden** recorded tick 121→121 over ~1080 ms: **zero** actual physical steps in that interval, although the hidden source answered both read-only messages. Old ~1.2–2.3% ratios are superseded and must not be used as background simulation rates. No uniform hidden-time semantics are implied.
- **Scope boundary:** The authorized host gesture physically edits one P10b collider. This is host-issued, Lab-authorized material editing, **not evidence that the actor can perform that operation autonomously**. Companion and ReflexBrain separately research actor agency; never conflate domains.
- **Owner-facing deficit:** 100% visible canvas and successful emulated touch Pause/Open still do not prove delightful direct manipulation. Mobile physical editing in P10b requires keyboard Ctrl+drag, locomotion requires keyboard; no real phone-Owner control PASS.
- **Choice for next run:** stop growing the data-panel witness. Work from one open-ended, directly manipulable material situation with contrasting bodies, where a user's intervention visibly changes feasible actor actions and their subsequent physical consequences. Compare stand-alone vs Jaskinia focus workspace; a subjective Owner encounter is required before promotion. Favor immediate mouse/touch physical gesture over new general host infrastructure. Preserve P10b as donor and be willing to abandon its UI and machinery.
- **Destructive freedom:** both experimental PRs are open drafts, unique branches, unmerged; main and shared user data remain untouched. Code and test evidence retained without duplicating main, histories or other agents' work. The next branch need not extend this adapter if a fresh physical workshop is more valuable.

## What was actually executed

**Independent source test:** `npm test` invokes `scripts/p10-jaskinia-witness.test.mjs` (parent/frame binding, size limit, source state, owner permission denial, stale before-state/runtime, required pause, bounded reverse and exactly-once ID semantics), plus original Combat tests.

**Cross-project real browser evidence:** [old Jaskinia CI #42309795677](https://github.com/Jozzpoly/Jozz-Cave-Workbench/actions/runs/42309795677), source-pinned `experiment/gpt6-worldbench-witness-2026-11-06` commit `c623d60d3c2d1aea4bf900d929b10af7ece59e8f`. Ubuntu 24.04, real Chromium and actual Vite-built `@dimforge/rapier2d-deterministic` WASM. Host opens an actual P10b world inside the REAL Jaskinia v6.4.1 native workspace, captures source-reported `world.trace()`, pauses via real UI, physically widens the true Rapier collider 2.2→3.5m, confirms actor/cargo counts and no time advancement, grants opt-in in the P10b UI, requests a second physical widen from the native host (3.5→4.8m), rejects stale physical state, accepts reverse (4.8→3.5m), keeps identical runtime after moving the genuine native divider. Independent project/session switch creates different runtime identity, then return to original preserves it. Actual Chrome with Pixel 7 emulation taps Pause/Open, gets actual physical afterstate, changes native window via touch dock, and comes back to unchanged runtime. Source reports live selected body in native microscope (actor 14 = bulky, 160kg) following actual keyboard selection.

**UX failure caught and corrected:** old P10b vertically stacked in 360×616 Jaskinia pane had zero visible physical canvas. Embedding-only CSS now keeps 100% of physical canvas visible in the tested browser geometry, retains scrollable original controls. Dedicated `launchFocus` workbench gives 1121px physical canvas at 1600×950 and a separate native microscope; original crowded Jaskinia workspace remains intact. P10b bodies/visuals are still schematic and not an Owner-approved organic combat feeling.

## Code ownership / exact semantic boundary

- `src/p10-workshop.js`: `openSlot` and research-only `closeSlot` physically translate the SAME collider; each increments the source's `materialEvents.edits`. `closeSlot` is one bounded inverse, not generic undo/history.
- `src/p10-jaskinia-witness.js`: optional in-iframe bridge. A reported state is read-only source material. `runtimeId` is volatile and changes on `reset()`; no solver checkpoint, world persistence, transport replay or trusted physical certificate.
- `p10-ui.js` / `p10.html` / `p10.css`: user permits limited physical edits in the *running P10b session* via explicit toggle. Source requires permission, pause, exact prior aperture + edit count + runtime identity. Rejected commands do NOT move the collider. The browser host cannot grant itself this permission, call arbitrary solver functions or force a resize of the Owner's Jaskinia.
- This does NOT give a third-party parent trusted access: a framing host can read a public `hello`, and first parent `hi` establishes the origin for this experimental adapter. Production requires explicit approved-parent identity and origin/capability policy. **Never run this experimental Jaskinia host on the browser origin holding valuable Owner private materials.**

## Why this is only a donor

Rapier observation/physical action is useful but is not yet a meaningful new organism. Historical Owner R0/R1/L0 failures, lack of gait and practically negative hinge value persist. P10b is a constrained mechanical test scene, not a physical platform choice for the whole project. A generic Jaskinia environment should preserve a lab's own domain authority rather than force a shared Combat/Coopege world schema.

**Next falsifier:** unscripted human physical interactions in a safe, conveniently accessible artifact; single-action causal observation and experimental A/B with explicit exact-world and operator-condition identity. Real Owner mobile/desktop feel, robust click/touch ergonomics and long-lived return not yet proved. Keep both branch heads discoverable and refuse automatic merges.
