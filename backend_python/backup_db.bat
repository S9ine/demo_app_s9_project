@echo off
echo ========================================
echo   PostgreSQL Database Backup Script
echo ========================================
echo.

REM ตั้งค่า PostgreSQL path (แก้ไขตามเครื่อง)
set PGPATH=C:\Program Files\PostgreSQL\18\bin
set PGPASSWORD=admin

echo [1] Backing up database...
"%PGPATH%\pg_dump.exe" -U postgres -d my_project_db -F c -f "database_backup.dump"

if %errorlevel%==0 (
    echo.
    echo ========================================
    echo   Backup completed successfully!
    echo   File: database_backup.dump
    echo ========================================
) else (
    echo.
    echo [Error] Backup failed!
)

echo.
pause
