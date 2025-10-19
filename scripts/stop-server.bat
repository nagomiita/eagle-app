@echo off
echo ========================================
echo  Eagle App - Stopping Server
echo ========================================
echo.

REM nginx停止
echo Stopping nginx...
cd %~dp0..\nginx
nginx.exe -s stop
if errorlevel 1 (
    echo WARNING: nginx may not be running
)
cd %~dp0..

REM バックエンド停止（Pythonプロセス終了）
echo Stopping backend...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq *app.main*" 2>nul
if errorlevel 1 (
    echo WARNING: Backend process may not be running
)

echo.
echo Server stopped.
pause
