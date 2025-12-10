@echo off
setlocal enableextensions

REM Change to the directory where this script lives
cd /d "%~dp0"

REM Optional arg: "nopause" to skip pause at end
set "PAUSE_AT_END=1"
if /i "%~1"=="nopause" set "PAUSE_AT_END="

echo ================================
echo  Driver Drowsiness Backend (Win)
echo ================================
echo.

REM Load environment from .env if present (basic key=value export for common vars)
if exist .env (
	echo Loading .env ...
	for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
		if not "%%~A"=="" set "%%~A=%%~B"
	)
)

REM If prebuilt binary exists, prefer that (no Go required)
if exist "driver-drowsiness-backend.exe" (
	echo Running prebuilt backend binary...
	echo.
	"driver-drowsiness-backend.exe"
	set "ERR=%ERRORLEVEL%"
	if not "%ERR%"=="0" (
		echo.
		echo Backend exited with code %ERR%.
	) else (
		echo.
		echo Backend exited normally.
	)
	goto :end
)

REM Fallback: use `go run .` if Go is available
where go >nul 2>&1
if errorlevel 1 (
	echo ERROR: Go is not installed or not in PATH.
	echo - Either install Go from https://go.dev/dl
	echo - Or ask for a build that includes driver-drowsiness-backend.exe
	set "ERR=1"
	goto :end
)

echo Running via `go run .` ...
echo.
go run .
set "ERR=%ERRORLEVEL%"

:end
echo.
if defined PAUSE_AT_END (
	echo Press any key to close this window...
	pause >nul
)
endlocal & exit /b %ERR%
