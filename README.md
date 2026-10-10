# Combat Lab · B1 — ruchoma fizyczna sylwetka

**Izolowany eksperyment badawczy. Nie jest zaakceptowanym organizmem, częścią E1, wyborem silnika, gotową grą ani publicznym buildem.**

[B1 — pełny raport i krytyczne wyniki](docs/B1_PHYSICAL_ENVELOPE_DUAL_AFFORDANCE_2026-10-10.md) · [PR #10 (Draft)](https://github.com/Jozzpoly/Combat-Lab/pull/10) · [Chromium z działającymi kontrolkami oraz prawdziwymi kontaktami](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38093244735)

**Eksperyment:** jeden 125-kilogramowy korpus z dwoma naprawdę ruchomymi 20-kilogramowymi skrzydłami. Ramiona obracają się na fizycznych zawiasach przez ograniczone przeciwne impulsy momentu na nich i na korpusie. Warianty tanie: tak samo ciężki sztywny szeroki i sztywny wąski. Wszystkie mają ograniczony, ale **zewnętrzny napęd kadłuba** — nie prawdziwą przyczepność stóp, chód ani autonomiczne AI.

## Jak badać w przeglądarce

- **W** — jedź w prawo przez prawdziwą szczelinę; **S** — cofnij się.
- **Q** — fizycznie składaj skrzydła przed szczeliną; **E** — rozkładaj je po przejściu i próbuj dosięgnąć bocznych przedmiotów.
- Przełącz sztywną małą/dużą konstrukcję przy **tej samej masie całkowitej** i porównaj, co potrafi zrobić.
- **Pauza → przeciągnij korpus** albo suwakiem zmień fizyczną szerokość przejścia; możesz także naprawdę usunąć ciała ścian.
- „Odtwórz boczne przedmioty” przywraca dwa realne 40kg obiekty bez resetowania pozostałego świata.
- „Moment zawiasu 0” oznacza brak aktuatora, a nie „zero akcji wciąż skonfigurowanego serwa”.

W sprawdzonym modelu ruchoma sylwetka ma szerokość **3.86m rozłożona / 0.90m złożona**. Wystarczy naprawdę złożyć człony, żeby przejść przez szczelinę **1.24m**, a potem rozłożyć i materialnie przesunąć boczne przedmioty. Tania trwale wąska bryła przechodzi bez kosztu przegubów, ale nie dosięga obu bocznych przedmiotów podczas tego samego przejazdu. Nie wyprowadzaj z tego wniosku, że animowany/przeskalowany collider nie mógłby kiedyś stanowić tańszej alternatywy.

**Prawdziwa historia jednego świata — nie ilustracje AI:**

[Start — rozłożony](docs/media/b1-source-t0.png) → [Złożony, t180](docs/media/b1-folded-t180.png) → [Rozłożony po przejściu, t580](docs/media/b1-redeployed-t580.png) → [Rezultat, t780](docs/media/b1-post-physical-contact-t780.png).

**Nieudane próby zachowane jako wiedza:** oryginalne centralnie mocowane zawiasy nie mogły złożyć skrzydeł przez własne kontakty; błędnie interpretowane `createImpulseJoint(..., false)` NIE wyłącza kolizji. Takie wyłączenie umożliwiało nawet bierne przejście — bez potrzebnego aktuatora. Dopiero przednie fizyczne mocowanie przy pozostawionej kolizji własnej i odpowiednio ograniczonym momencie dało mechanicznie uzasadniony wynik. Dowody, konkurencyjne kontrole i dokładne ograniczenia są w raporcie.

**Uruchomienie prywatne:** `npm install`, `npm test`, `npm run build`, serwowanie `dist/` przez HTTP. Repo ma bramkę rzeczywistego Chromium w Actions. Nie udostępniono jeszcze hostowanego linku; istniejące `rehearsal/current` pozostaje nietknięte. **Ocena Ownera: UNKNOWN.**

Następny sensowny problem to nie tuning siły ramion. To zbadanie, czy takie możliwości fizyczne dają ciekawe decyzje w pełnym świecie organizmów i czy są warte kosztu względem prostszego uczciwego modelu.
