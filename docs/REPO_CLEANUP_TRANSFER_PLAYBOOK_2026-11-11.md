# Porządkowanie innych repozytoriów — krótka lekcja z Combat Lab

**Nie kopiować bezrefleksyjnie.** Celem są łatwiejszy powrót i niższy koszt uwagi przyszłych agentów, nie zachowanie 100% kodu w aktywnej nawigacji.

1. Ustal rzeczywisty cel Ownera i cenne źródłowe próby, także FAIL; oddziel je od agentowych interpretacji.
2. Sprawdź **prawdziwy stan**: main, runtime, Pages/Cloudflare/API, zależności PR-ów, typy archiwów i niejawne skutki push/PR. SPC odpaliło workflow Cloudflare po zmianach dokumentacji.
3. **Kuratoruj**: kilka źródłowych wniosków + warte sprawdzenia próbki → krótki punkt wejścia. Nie przenoś 100 historycznych PR-ów jako „do zrobienia”.
4. Jeśli przed usuwaniem gałęzi trzeba zachować unikalny kod, wybierz najprostszy **zwykły ref GitHub** (tag lub pojedyncze archiwum). Udowodnij dostępność oryginalnych commitów i istotnych plików po usunięciu starych nazw.
5. Popraw istotne odnośniki zależne od nazw gałęzi, nie każdy stary opis. Chronić realne Owner evidence i negatywne wyniki, nie odtwarzać kosztownych znikających screenshotów dla samej pełności.
6. Zadbaj o prostą, ręczną i SHA-locked operację kasowania: żadnego delete on push, żadnej zmiany deployment pointera. Test na nieważnej gałęzi jest wartościowy.
7. **Nie wymuszaj lokalnych ZIP-ów lub wygasających artefaktów Actions.** Jeśli dla danego projektu istnieje konkretna potrzeba niezależnego disaster recovery, zaprojektuj ją osobno. GitHub archive nie jest taką kopią.
8. Na końcu sprawdź live wynik i usuń jednorazową infrastrukturę. Zostaw jasne ograniczenia w jednym małym pliku.

Aktualne kontrasty: **Companion** zredukował gałęzie do samego main (trzy listopadowe dawcy w tagach); **ReflexBrain** zachował ważny łańcuch PR-ów i źródła R8 obok licznych tagów; **SPC** nadal wymaga ostrożności względem Cloudflare i tajnych provider API; **Combat Lab** ma celowo neutralne main i jeden zimny forensic archive ref.

**Osobna granica:** nie eksportuj całych rozmów prywatnych do publicznych repozytoriów; zachowuj tylko świadomie dobrane, niesensytywne dane o intencji i realne wyniki badań.
