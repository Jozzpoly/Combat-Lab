@echo off
cd /d "%~dp0"
title Combat Lab P10b - lokalna symulacja
echo.
echo Combat Lab P10b - eksperymentalny warsztat fizyczny.
echo Nie wymaga instalacji; uruchamia sie tylko na tym komputerze.
echo Zamknij to okno, aby zatrzymac serwer.
echo.
if not exist "%~dp0node.exe" (
  echo BLAD: brakuje node.exe. Pobierz pelna paczke, nie sam skrypt.
  pause
  exit /b 1
)
"%~dp0node.exe" "%~dp0server.mjs"
echo.
echo Serwer zakonczyl dzialanie. Nacisnij dowolny klawisz.
pause >nul
