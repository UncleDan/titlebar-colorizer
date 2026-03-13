@echo off
setlocal enabledelayedexpansion

:: Get the folder name and path
set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"
for %%I in ("%SCRIPT_DIR%") do set "FOLDER_NAME=%%~nxI"

:: Read version from manifest.json using PowerShell
for /f "delims=" %%V in ('powershell -NoProfile -Command "(Get-Content '%SCRIPT_DIR%\manifest.json' | ConvertFrom-Json).version"') do set "VERSION=%%V"

if "%VERSION%"=="" (
    echo ERROR: Could not read version from manifest.json
    pause
    exit /b 1
)

:: Create dist folder if it doesn't exist
if not exist "%SCRIPT_DIR%\dist" mkdir "%SCRIPT_DIR%\dist"

:: Build output path, increment suffix if file already exists
set "OUTPUT_ZIP=%SCRIPT_DIR%\dist\%FOLDER_NAME%-%VERSION%.zip"
if exist "%OUTPUT_ZIP%" (
    set "COUNTER=1"
    :loop
    set "OUTPUT_ZIP=%SCRIPT_DIR%\dist\%FOLDER_NAME%-%VERSION%-!COUNTER!.zip"
    if exist "!OUTPUT_ZIP!" (
        set /a COUNTER+=1
        goto loop
    )
)

echo Folder  : %FOLDER_NAME%
echo Version : %VERSION%
echo Output  : %OUTPUT_ZIP%
echo.

"C:\Program Files\7-Zip\7z.exe" a -tzip -mx=9 "%OUTPUT_ZIP%" "%SCRIPT_DIR%\*" ^
  -xr@"%SCRIPT_DIR%\make-zip-exclusion.list"

if %ERRORLEVEL% equ 0 (
    echo.
    echo Done! Archive created: %OUTPUT_ZIP%
) else (
    echo.
    echo ERROR: 7-Zip failed with code %ERRORLEVEL%
)
