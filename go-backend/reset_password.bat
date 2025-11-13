@echo off
echo Resetting PostgreSQL password...
echo.
echo ALTER USER postgres WITH PASSWORD 'newpassword123';
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "ALTER USER postgres WITH PASSWORD 'newpassword123';"
echo.
echo Password changed to: newpassword123
echo Don't forget to update .env file!
pause
