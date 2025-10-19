@echo off
echo ========================================
echo  Eagle App - Desktop Mode
echo ========================================
echo.
echo Starting Desktop Application...
echo - Backend: localhost only
echo - Frontend: Electron window
echo - nginx: disabled
echo.

cd %~dp0..\frontend
npm run electron:start
