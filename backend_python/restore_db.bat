@echo off
echo ========================================
echo   PostgreSQL Database Restore Script
echo ========================================
echo.

REM ตั้งค่า PostgreSQL path (แก้ไขตามเครื่อง)
set PGPATH=C:\Program Files\PostgreSQL\18\bin
set PGPASSWORD=admin

echo [1] Creating database if not exists...
"%PGPATH%\createdb.exe" -U postgres my_project_db 2>nul
if %errorlevel%==0 (
    echo     Database created successfully!
) else (
    echo     Database already exists, will restore into it.
)

echo.
echo [2] Restoring database from backup...
"%PGPATH%\pg_restore.exe" -U postgres -d my_project_db --clean --if-exists "database_backup.dump"

if %errorlevel%==0 (
    echo.
    echo ========================================
    echo   Restore completed successfully!
    echo ========================================
) else (
    echo.
    echo [Warning] Some errors occurred, but data may still be restored.
    echo Check if tables exist in the database.
)

echo.
pause
