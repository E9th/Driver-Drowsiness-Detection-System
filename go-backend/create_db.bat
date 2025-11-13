@echo off
echo Creating PostgreSQL database...
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "CREATE DATABASE drowsiness_db;"
echo.
echo Database created successfully!
pause
