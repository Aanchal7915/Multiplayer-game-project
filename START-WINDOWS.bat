@echo off
setlocal
cd /d "%~dp0"
echo ==========================================
echo       MINDBLITZ ARENA GAME SETUP
echo ==========================================
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install Node.js 20 or newer from https://nodejs.org/ and run this file again.
  pause
  exit /b 1
)
start "MindBlitz Browser" cmd /c "timeout /t 2 >nul & start http://localhost:3001"
echo Starting MindBlitz Arena on port 3001. Keep this window open while playing.
call npm start
pause
