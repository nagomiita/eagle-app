@echo off
echo ========================================
echo  Eagle App - Hybrid Mode
echo ========================================
echo.
echo Starting Hybrid Mode...
echo - Desktop: Electron window
echo - Server: LAN accessible via nginx
echo - Both modes enabled
echo.

cd %~dp0..\frontend
set ENABLE_SERVER=true
npm run electron:start -- --enable-server
