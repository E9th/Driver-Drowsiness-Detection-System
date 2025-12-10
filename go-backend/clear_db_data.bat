@echo off
setlocal

REM === Configuration ===
set "PG_BIN=C:\Program Files\PostgreSQL\17\bin\psql.exe"
set "DB_NAME=drowsiness_db"
set "DB_USER=postgres"
set "DB_HOST=localhost"
set "DB_PORT=5432"

echo ==============================================
echo  Clearing runtime data from database
echo  Database : %DB_NAME%
echo  User     : %DB_USER%
echo  Host     : %DB_HOST%:%DB_PORT%
echo ==============================================

REM Truncate runtime tables (keep users/devices)
"%PG_BIN%" -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "TRUNCATE TABLE drowsiness_data, alerts RESTART IDENTITY;"

if %ERRORLEVEL% NEQ 0 (
  echo.
  echo ERROR: Failed to clear data. Please check the messages above.
  pause
  exit /b 1
)

echo.
echo Database data cleared successfully:
echo   - drowsiness_data (rows removed, IDs reset)
echo   - alerts (rows removed, IDs reset)

echo.
echo Note: Users and devices tables are not modified by this script.
pause
endlocal
