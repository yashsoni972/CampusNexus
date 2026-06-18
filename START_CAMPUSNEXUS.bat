@echo off
title CampusNexus Launcher
color 0A

echo ================================================
echo        CAMPUSNEXUS - College ERP Platform
echo ================================================
echo.

echo [1/4] Stopping any other running Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul
echo       Done!
echo.

echo [2/4] Starting Backend (Port 5000)...
start "CampusNexus Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"
timeout /t 6 >nul
echo       Done!
echo.

echo [3/4] Starting Frontend (Port 3000)...
start "CampusNexus Frontend" cmd /k "cd /d "%~dp0frontend" && npm start"
echo       Done!
echo.

echo [4/4] Opening CampusNexus in browser...
timeout /t 15 >nul
:: Open only one tab/window for the app URL
start "CampusNexus" "http://localhost:3000"
echo       Done!

echo.

echo ================================================
echo  CampusNexus is READY!
echo  URL: http://localhost:3000
echo ================================================
pause
