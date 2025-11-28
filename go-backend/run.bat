@echo off
setlocal

REM Change to the directory where this script lives
cd /d "%~dp0"

echo Starting Driver Drowsiness Detection Backend...
echo.

REM Verify Go is installed
where go >nul 2>&1
if errorlevel 1 (
	echo ERROR: Go is not installed or not in PATH.
	echo Please install Go from https://go.dev/dl and ensure 'go' is available.
	exit /b 1
)

REM Load environment from .env if present (basic key=value export for common vars)
if exist .env (
	for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
		if not "%%A"=="" set "%%~A=%%~B"
	)
)

REM Run the backend (module-aware)
go run .

endlocal
