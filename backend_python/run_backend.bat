@echo off
title ERP Backend Server
echo Starting ERP Backend Server...
echo --------------------------------
cd /d "%~dp0"
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pause
