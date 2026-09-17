@echo off
title Herbora - Ancient Wisdom and Modern Discovery
echo ========================================================
echo   Starting Herbora Ayurvedic Discovery Platform
echo ========================================================
echo.

echo Starting Python Flask Backend on port 5000...
start "Herbora Backend API" cmd /k "cd backend && python app.py"

echo Starting Vite React Frontend on port 5173...
start "Herbora Vite Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting!
echo Frontend: http://localhost:5173
echo Backend:  http://127.0.0.1:5000/api/health
echo ========================================================
