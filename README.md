# Combat Lab — M0 / mechaniczne fenotypy (kandydat badawczy)

**To jest izolowana gałąź eksperymentalna, NIE `main`, NIE publikacja i NIE zaakceptowany organizm.** [Raport dowodów i ograniczeń](docs/M0_PHENOTYPES_CONTACT_CHECKPOINT_2026-10-10.md) · [PR #7](https://github.com/Jozzpoly/Combat-Lab/pull/7).

M0 używa Rapier 2D do rzeczywistych kontaktów między konstrukcjami: pojedyncze sztywne ciało, trzy człony na przegubach, sprężysty zestaw ośmiu mas. Świat zawiera osiem organizmów, trochę materii, kontrolę WASD, pauzę/edycję, dodawanie nowych ciał i pojedyncze impulsy. Niewybrane organizmy nie dostają globalnego celu ani automatycznej trasy; wybrany porusza się przez **jawny zewnętrzny proxy-napęd płaski**, a nie naturalny chód. Lokalne kontaktowe odruchy są słabe i **nie oznaczają inteligencji**. Obramowanie sprężystego organizmu nie jest niewidzialną fizyczną membraną.

**Wykonane sprawdzenia:**
- [Chromium physics](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38087927814) i [kontrola z przybliżonym sztywnym odpowiednikiem](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38088121316);
- [prawdziwa seria czasowa w jednym solverze](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38088072780);
- [test rzeczywistych kontrolek](https://github.com/Jozzpoly/Combat-Lab/actions/runs/38088221703);
- [surowy pierwszy ekran świata](docs/media/m0-actual-t0.png) i [obraz po 240 krokach](docs/media/m0-actual-t240.png).

**Jakościowy werdykt:** mechanicznie badalna podatność i kontakt; jeszcze NIE jest to interesujący żywy świat ani pełnowartościowy organizm. Nie przedłużać automatycznie do M1 i nie traktować wyniku jako wyboru architektury. Nowe decyzje zaczynają się od `main/docs/RESEARCH_STATE.md` i bieżącego Owner feedbacku.

Historyczne R0/R1/L0 Owner FAIL pozostają FAIL. `rehearsal/current` nie został zmieniony. Żadnego Owner testu M0 nie wykonano.

### Reprodukcja badania

W środowisku z Node.js i przeglądarką Chromium: `npm install`, `npm test`, `npm run build`. Wygenerowany `dist/` służy do prywatnego podglądu. `?probe=1`, `?frames=1`, `?fairm0=1`, `?ownercheck=1` to wyłącznie uruchamiane na żądanie diagnostyczne ścieżki, nie tryby gameplay.
