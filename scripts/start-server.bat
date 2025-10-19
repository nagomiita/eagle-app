@echo off
echo ========================================
echo  Eagle App - Server Mode
echo ========================================
echo.
echo Starting Server Mode...
echo - Backend: LAN accessible (0.0.0.0:8000)
echo - Frontend: nginx (http://192.168.11.11)
echo - Electron: disabled
echo.

REM nginx起動
echo Starting nginx...
cd %~dp0..\nginx
start nginx.exe
if errorlevel 1 (
    echo WARNING: nginx may already be running or not found
)
cd %~dp0..

REM バックエンド起動（LAN公開）
echo Starting backend...
cd %~dp0..\backend
set APP_MODE=server
python -m app.main

pause
