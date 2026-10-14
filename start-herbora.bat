@echo off
title Herbora - Ancient Wisdom and Modern Discovery
echo ========================================================
echo   Starting Herbora Ayurvedic Discovery Platform
echo ========================================================
echo.

set SCRIPT_DIR=%~dp0

echo Starting Python Flask Backend on port 5000...
start "Herbora Backend API" cmd /k "cd /d ""%SCRIPT_DIR%backend"" && python app.py"

echo Starting Vite React Frontend on port 5173...
start "Herbora Vite Frontend" cmd /k "cd /d ""%SCRIPT_DIR%frontend"" && npm run dev"

echo Starting Port 5174 Bridge...
start "Herbora Port 5174 Forwarder" /min cmd /c "cd /d ""%SCRIPT_DIR%frontend"" && node forwarder5174.js"

echo.
echo Both servers and port bridge are running!
echo Frontend: http://localhost:5173 or http://localhost:5174
echo Backend:  http://127.0.0.1:5000/api/health
echo ========================================================

