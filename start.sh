#!/bin/bash
echo ""
echo " ============================"
echo "  Kerri Nails - MVP Launcher"
echo " ============================"
echo ""

echo "[1/3] Устанавливаю зависимости backend..."
cd "$(dirname "$0")/backend"
npm install --silent
echo "    OK"

echo "[2/3] Создаю администратора (если не создан)..."
node create-admin.js
echo ""

echo "[3/3] Запускаю backend..."
npm run dev &
BACKEND_PID=$!
sleep 2

echo "[3/3] Устанавливаю зависимости frontend и запускаю..."
cd "$(dirname "$0")/frontend"
npm install --silent
npm run dev &
FRONTEND_PID=$!

echo ""
echo " Backend:  http://127.0.0.1:5000"
echo " Frontend: http://localhost:5173"
echo ""
echo " Нажмите Ctrl+C чтобы остановить оба сервера."
echo ""

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
