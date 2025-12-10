@echo off
setlocal

REM === Configuration ===
set "PG_BIN=C:\Program Files\PostgreSQL\17\bin\psql.exe"
set "DB_NAME=drowsiness_db"
set "DB_USER=postgres"
set "DB_HOST=localhost"
set "DB_PORT=5432"

echo ==============================================
echo  Initializing database for Driver Drowsiness System
echo  Database : %DB_NAME%
echo  User     : %DB_USER%
echo  Host     : %DB_HOST%:%DB_PORT%
echo ==============================================

REM Create database (ignore error if it already exists)
"%PG_BIN%" -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -c "CREATE DATABASE %DB_NAME%;" 2>nul

if %ERRORLEVEL% NEQ 0 (
  echo Database %DB_NAME% may already exist - continuing
) else (
  echo Database %DB_NAME% created successfully
)

REM Apply schema for users/devices/drowsiness/alerts
"%PG_BIN%" -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f "%~dp0schema_register.sql"
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo ERROR: Failed while creating tables. Please review the messages above.
  pause
  exit /b 1
)

echo.
echo Database schema initialized successfully:
echo    - users (with phone, company, user_type)
echo    - devices
echo    - drowsiness_data
echo    - alerts

echo.
echo Note: If PostgreSQL asks for a password, enter your postgres password.
pause
endlocal
