@echo off
:: make-zip.cmd by Daniele Lolli (UncleDan) feat. Claude AI - Release 2.0b3 - 2026-10-05 17-26-08
:: Crea due pacchetti in dist\:
::   <cartella>-<versione>-firefox.xpi      Firefox / LibreWolf (manifest.json invariato)
::   <cartella>-<versione>-thunderbird.xpi  Thunderbird (manifest.json + manifest.thunderbird.json)
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"
for %%I in ("%SCRIPT_DIR%") do set "FOLDER_NAME=%%~nxI"
set "SEVENZIP=C:\Program Files\7-Zip\7z.exe"

:: Versione: version_name (es. 2.0b2) se presente, altrimenti version
for /f "delims=" %%V in ('powershell -NoProfile -Command "$m = Get-Content -Raw '%SCRIPT_DIR%\manifest.json' | ConvertFrom-Json; if ($m.version_name) { $m.version_name } else { $m.version }"') do set "VERSION=%%V"
if "%VERSION%"=="" (
    echo ERROR: Could not read version from manifest.json
    pause
    exit /b 1
)

if not exist "%SCRIPT_DIR%\dist" mkdir "%SCRIPT_DIR%\dist"

:: Nome base, con suffisso -N se esiste gia'
set "BASE=%SCRIPT_DIR%\dist\%FOLDER_NAME%-%VERSION%"
set "SUFFIX="
set "COUNTER=0"
:checkname
if exist "%BASE%%SUFFIX%-firefox.xpi" goto nextname
if exist "%BASE%%SUFFIX%-thunderbird.xpi" goto nextname
goto gotname
:nextname
set /a COUNTER+=1
set "SUFFIX=-%COUNTER%"
goto checkname
:gotname
set "OUT_FF=%BASE%%SUFFIX%-firefox.xpi"
set "OUT_TB=%BASE%%SUFFIX%-thunderbird.xpi"

echo Folder  : %FOLDER_NAME%
echo Version : %VERSION%
echo Firefox : %OUT_FF%
echo TB      : %OUT_TB%
echo.

:: 1) Pacchetto Firefox / LibreWolf
"%SEVENZIP%" a -tzip -mx=9 "%OUT_FF%" "%SCRIPT_DIR%\*" -xr@"%SCRIPT_DIR%\make-zip-exclusion.list"
if errorlevel 1 goto fail

:: 2) Pacchetto Thunderbird: stessa base + manifest unito con l'overlay
set "TMPDIR=%TEMP%\%FOLDER_NAME%-tb-%RANDOM%"
mkdir "%TMPDIR%"
powershell -NoProfile -Command "$m = Get-Content -Raw '%SCRIPT_DIR%\manifest.json' | ConvertFrom-Json; $t = Get-Content -Raw '%SCRIPT_DIR%\manifest.thunderbird.json' | ConvertFrom-Json; foreach ($p in $t.PSObject.Properties) { if ($p.Name -notlike '_*') { $m | Add-Member -Force -NotePropertyName $p.Name -NotePropertyValue $p.Value } }; [IO.File]::WriteAllText('%TMPDIR%\manifest.json', ($m | ConvertTo-Json -Depth 20), (New-Object Text.UTF8Encoding $false))"
if errorlevel 1 goto fail
copy /y "%OUT_FF%" "%OUT_TB%" >nul
"%SEVENZIP%" a -tzip -mx=9 "%OUT_TB%" "%TMPDIR%\manifest.json"
if errorlevel 1 goto fail
rmdir /s /q "%TMPDIR%"

echo.
echo Done!
echo   %OUT_FF%
echo   %OUT_TB%
pause
exit /b 0

:fail
echo.
echo ERROR: build failed (code %ERRORLEVEL%)
pause
exit /b 1
