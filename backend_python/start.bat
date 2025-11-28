@echo off
chcp 65001 >nul
echo ===================================
echo Python + FastAPI Backend Setup
echo ===================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.10+ from https://www.python.org/
    pause
    exit /b 1
)

echo Python is installed
echo.

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    echo Virtual environment created
) else (
    echo Virtual environment already exists
)
echo.

REM Install dependencies using venv python
echo Installing dependencies...
venv\Scripts\python.exe -m pip install -r requirements.txt
echo Dependencies installed
echo.

REM Initialize database using venv python
echo Initializing database...
venv\Scripts\python.exe init_db.py
echo.

REM Start server using venv python
echo Starting FastAPI server...
echo.
echo Server will be available at:
echo   - API: http://localhost:8000
echo   - Docs: http://localhost:8000/docs
echo   - ReDoc: http://localhost:8000/redoc
echo.
echo Default login:
echo   Username: admin
echo   Password: admin123
echo.
echo Press Ctrl+C to stop the server
echo ===================================
echo.

REM Use python -m uvicorn instead of uvicorn directly to ensure it uses the venv
venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
