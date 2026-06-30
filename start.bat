@echo off
chcp 65001 >nul
echo.
echo  ============================
echo   Kerri Nails - MVP Launcher
echo  ============================
echo.

echo [1/3] Устанавливаю зависимости backend...
cd backend
call npm install --silent
echo     OK

echo [2/3] Создаю администратора (если не создан)...
node create-admin.js
echo.

echo [3/3] Запускаю backend и frontend...
echo.
echo  Backend: http://localhost:3001
echo  Frontend: http://localhost:5173
echo.
echo  Нажмите Ctrl+C чтобы остановить.
echo.

start "Kerri Nails - Backend" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 2 /nobreak >nul

cd ..\frontend
call npm install --silent
start "Kerri Nails - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo  Открываю браузер...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo  Сайт открыт! Оба окна терминала должны работать.
pause
