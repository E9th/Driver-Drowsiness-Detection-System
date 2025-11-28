@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul
color 0C
title Driver Fatigue Detector - Environment Setup (DARK MODE)

REM --- Fast mode flag ---
if /I "%~1"=="/fast" set "FAST=1"
if /I "%~1"=="/virus" set "VIRUS=1"

REM --- ANSI escape (optional) ---
for /f %%A in ('echo prompt $E^| cmd') do set "ESC=%%A"

cls
set "BAR=████████████████████████████████████████████████████████"
set "GRAD=▓▒░▓▒░▓▒░▓▒░▓▒░▓▒░▓▒░▓▒░▓▒░▓▒░▓▒░"
for /f "tokens=1-5 delims=/:. " %%A in ("%date% %time%") do set "STAMP=%date% %%A:%%B:%%C"

echo.
echo %BAR%
echo.
echo   MODE: ENVIRONMENT SETUP
echo   AUTHOR / CREDIT: Mr.Patchara Al-umaree
echo   STARTED: %STAMP%
echo.
echo %GRAD%
echo.
                                                                                          

REM --- Python detection ---
where python >nul 2>&1
if not errorlevel 0 (
    where py >nul 2>&1
    if errorlevel 0 (
        set "PY_CMD=py -3"
    ) else (
        echo [ERROR] Python 3 not found.
        goto :END_FAIL
    )
) else (
    set "PY_CMD=python"
)
echo [OK] Interpreter: %PY_CMD%
echo %GRAD%
echo.

REM --- Upgrade pip (with progress) ---
echo [SETUP] Upgrading pip...
if not defined FAST (
    call :progress "pip bootstrap"
)
"%PY_CMD%" -m ensurepip --upgrade >nul 2>&1
"%PY_CMD%" -m pip install --upgrade pip >nul 2>&1
echo [OK] Pip upgraded.
echo %GRAD%
echo.

REM --- Install requirements ---
if not exist "requirements.txt" (
    echo [ERROR] requirements.txt not found.
    goto :END_FAIL
)
echo [SETUP] Installing dependencies...
if not defined FAST (
    call :progress "dependencies"
)
"%PY_CMD%" -m pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Dependency install errors detected.
) else (
    echo [DONE] Dependencies installed.
)
echo.
echo %BAR%
echo.
echo ★ ENVIRONMENT READY ★
echo CREATED BY: Mr.Patchara Al-umaree
echo %GRAD%
echo.
REM --- Interactive menu (NEW) ---
:MENU
echo Select option:
echo  [1] Run Program!
echo  [0] Exit
set /p "CHOICE=Enter choice (1/0): "
if "%CHOICE%"=="1" goto RUN_MAIN
if "%CHOICE%"=="0" goto END_EXIT
echo [WARN] Invalid choice.
echo.
goto MENU

:RUN_MAIN
if not exist "main.py" (
    echo [ERROR] main.py not found in current directory.
    echo.
    goto MENU
)
echo [RUN] Launching main.py ...
"%PY_CMD%" main.py
if errorlevel 1 (
    echo [ERROR] main.py execution failed.
) else (
    echo [OK] main.py finished.
)
echo.
goto MENU

:END_FAIL
echo %BAR%
echo [FAIL] Setup aborted.
echo Move project or install Python 3 properly.
echo %BAR%
pause >nul
goto :EOF

:progress
set "LABEL=%~1"
set "BARLEN=48"
set "FIL=█"
set "EMP=."
for /L %%i in (1,1,%BARLEN%) do (
    set /a "pct=%%i*100/BARLEN"
    set "line="
    for /L %%j in (1,1,%%i) do set "line=!line!%FIL%"
    for /L %%k in (%%i,1,%BARLEN%) do set "line=!line!%EMP%"
    <nul set /p ="[....] %LABEL% |!line!| !pct!%%`r"
    if defined FAST goto :progress_done
    ping -n 1 127.0.0.1 >nul
)
:progress_done
echo(
exit /b 0

:END_EXIT
echo Exiting...
goto :EOF
