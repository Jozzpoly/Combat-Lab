# Combat Lab — aktualna rzeczywistość i odzyskiwanie

**Stan z 11 XI 2026. Zawsze sprawdź live GitHub przed działaniem.** Priorytetem jest przyszła sprawczość twórcza i ciągłość idei, nie zachowanie każdego eksperymentu jako obowiązku.

## Wejście dla następnego agenta

1. [Co ma wartość](WHAT_MATTERS_2026-11-11.md): Owner intent, realne próby, ważne porażki i tylko wybrani dawcy.
2. [AGENTS.md](../AGENTS.md): zasady pracy niezależne od dostawcy.
3. W razie potrzeby [szczegóły evidence historyczne](RESEARCH_STATE.md) i [dawny failure scar](FAILURE_SCAR_2026-10-06.md). Nie odziedziczaj historycznej listy NEXT jako planu.

## Git, deployment, granice

- `main` — neutralny kod/smoke + docs, nie grywalny aktualny organizm.
- `rehearsal/current@cb4b44d417db612f3333fe515e6f6afffa3e56d8` — odrębny wskaźnik publicznych Pages; nie ruszać dla porządku.
- `archive/all-research-pre-provider-handoff-2026-11-10@863c0a056e9e0dfa7e5895ccf443a8ecfd4f520d` — **trwała zwykła referencja GitHuba**, jej 46 rodziców obejmuje dokładnie pierwotnych 46 HEAD-ów. Pliki archiwalnego commita są tylko neutralnym smoke; eksperymenty odzyskuje się po dawnych SHA, nie przez checkout tego drzewa jako gry.
- Na dzień sporządzenia: **47 gałęzi, 0 otwartych PR-ów; 44 dawne gałęzie przeznaczone do porządkowego usunięcia**, ale nie zostały skasowane. [Precyzyjny manifest nazw/SHA i PR](BRANCH_INVENTORY_2026-11-10.json).

## Faktycznie wykonane dowody

- 46 starych głów gałęzi zachowanych w archiwum; test nowego pustego repozytorium pobrał tylko archiwum i odzyskał wszystkie główne commit-SHA.
- Zweryfikowano rzeczywiste raporty siedmiu eksperymentów i trzy wcześniejsze **usunięte z drzew** zapisy prób Ownera. 148 odnośników w dokumentach zamieniono na konkretne SHA i przetestowano ich obiekty.
- Wszystkie 10 otwartych draftów zamknięto bez merge; 0 otwartych PR. Źródłowa fizyka i Pages niezmienione.
- [Realny test uprawnień GitHub](https://github.com/Jozzpoly/Combat-Lab/actions/runs/42925147056) utworzył i usunął tylko **tymczasową gałąź weryfikacyjną** z SHA-lock, bez dotknięcia badań.
- [Przeskanowano publiczną historię](https://github.com/Jozzpoly/Combat-Lab/actions/runs/42924588275) pod kątem typowych wzorców kluczy: zero trafień. To **nie jest pełny audyt bezpieczeństwa**.
- [Pełny bundle Git i niezależny restore](https://github.com/Jozzpoly/Combat-Lab/actions/runs/42926183616) były udanym *testem inżynieryjnym*. **Nie są potrzebne Ownerowi jako backup na komputerze ani nie są długotrwałym archiwum.** Właściwa retencja w tej kampanii to gałąź GitHuba wskazana powyżej.

## Czego nie wolno mylić

- GitHub archive **utrzymuje osiągalne commity**, ale nie zapewnia niezależnego backupu na wypadek utraty całego konta/repo. Owner obecnie świadomie nie wymaga dodatkowej kopii poza GitHubem.
- Zachowanie Git nie oznacza zachowania surowych filmów, artefaktów CI, pełnych konwersacji lub historii przechowywanych wyłącznie w ChatGPT.
- GitHub publiczny, a brak top-level LICENSE nie daje prawa domyślnie dystrybuować wszystkiego. Wzorzec sekretów nie wykrytych ≠ brak ryzyka.
- GitHub Actions i ich artefakty mają retencję czasową; **nie używać ich jako archiwum badawczego**.
- Pomyślne źródłowe/Chromium testy P7/P10/W2/Worldbench ≠ aprobowany gameplay/feel.

## Jedyny otwarty krok technicznego sprzątania

[Workflow ręcznego usuwania starych gałęzi](https://github.com/Jozzpoly/Combat-Lab/actions/workflows/archived-research-cleanup.yml) jest przygotowany, ale **nieuruchomiony w trybie kasowania**. Opcja AUDIT_ONLY nic nie usuwa. Opcja DELETE_ARCHIVED_REFS wraz z dokładną frazą `DELETE_44_ARCHIVED_COMBAT_BRANCHES` zleca usunięcie wyłącznie 44 identycznych SHA z manifestu, po potwierdzeniu archiwum, braku nowych nieznanych gałęzi oraz wykluczeniu `main`, `rehearsal/current` i archiwum. Operacja jest wieloetapowa, więc możliwe jest częściowe wykonanie; po niej trzeba sprawdzić liczbę gałęzi i zaktualizować stan. Nie ma obowiązku pobierania ZIP.

Wcześniejsze 15-kilobajtowe opisy procedury i dawny proces backupów pozostają w historii commitów Git, ale nie są nowym kontraktem współpracy. **Zainteresuj się badaniem świata, nie procedurą archiwalną.**
