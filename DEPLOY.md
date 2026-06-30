# 🚀 Деплой Kerri Nails — пошаговая инструкция

Два сервиса — оба бесплатные:
- **Railway** → бэкенд (Node.js сервер)
- **Vercel**  → фронтенд (React сайт)

Время: ~15–20 минут

---

## Часть 1 — GitHub (нужен один раз)

### 1.1 Установи Git
Скачай с https://git-scm.com/download/win и установи (всё по умолчанию).

### 1.2 Зарегистрируйся на GitHub
Перейди на https://github.com и создай аккаунт.

### 1.3 Создай репозиторий
1. Нажми кнопку **"New"** (зелёная, вверху слева)
2. Название: `kerrinails-mvp`
3. Оставь **Public** (или Private — не важно)
4. Нажми **"Create repository"**

### 1.4 Загрузи проект
Открой командную строку в папке `kerrinails-mvp` и выполни:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ТВОЙюзернейм/kerrinails-mvp.git
git push -u origin main
```

> Если спросит логин — введи данные GitHub

---

## Часть 2 — Railway (бэкенд)

### 2.1 Регистрация
1. Перейди на https://railway.app
2. Нажми **"Login"** → **"Login with GitHub"**
3. Разреши доступ

### 2.2 Создай проект
1. Нажми **"New Project"**
2. Выбери **"Deploy from GitHub repo"**
3. Найди `kerrinails-mvp` и нажми на него
4. Railway спросит какую папку деплоить → выбери **"backend"**
   (или укажи Root Directory = `backend`)

### 2.3 Настрой переменные окружения
После создания проекта:
1. Нажми на сервис → вкладка **"Variables"**
2. Добавь по одной:

| Имя переменной    | Значение                        |
|-------------------|---------------------------------|
| `JWT_SECRET`      | любая длинная строка (придумай) |
| `FRONTEND_URL`    | пока оставь пустым (заполним позже) |
| `TELEGRAM_BOT_TOKEN` | токен от @BotFather (если есть) |
| `TELEGRAM_CHAT_ID`   | твой chat id (если есть)        |

3. Нажми **"Deploy"**

### 2.4 Получи URL бэкенда
После деплоя:
1. Перейди в **Settings → Networking → Generate Domain**
2. Скопируй URL — он выглядит так:
   ```
   https://kerrinails-backend-production.up.railway.app
   ```
3. Запомни его — он понадобится для фронтенда

### 2.5 Создай администратора на Railway
1. В Railway открой вкладку **"Shell"** (или "Deployments" → нажми на деплой → "Open Shell")
2. Введи:
   ```bash
   node create-admin.js
   ```

---

## Часть 3 — Vercel (фронтенд)

### 3.1 Регистрация
1. Перейди на https://vercel.com
2. Нажми **"Sign Up"** → **"Continue with GitHub"**

### 3.2 Задеплой фронтенд
1. Нажми **"Add New Project"**
2. Найди `kerrinails-mvp` → нажми **"Import"**
3. В настройках укажи:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (определится автоматически)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 3.3 Добавь переменную окружения
Перед нажатием "Deploy" раскрой раздел **"Environment Variables"** и добавь:

| Имя               | Значение                                              |
|-------------------|-------------------------------------------------------|
| `VITE_API_URL`    | URL твоего Railway бэкенда (из шага 2.4)              |

Пример:
```
VITE_API_URL = https://kerrinails-backend-production.up.railway.app
```

### 3.4 Deploy!
Нажми **"Deploy"** — через 1–2 минуты сайт готов.

Vercel даст тебе URL типа:
```
https://kerrinails-mvp.vercel.app
```

---

## Часть 4 — Финальный шаг (связать бэкенд с фронтендом)

Теперь нужно сказать бэкенду, откуда к нему обращается фронтенд:

1. Зайди в Railway → Variables
2. Добавь/обнови:
   ```
   FRONTEND_URL = https://kerrinails-mvp.vercel.app
   ```
   (это твой URL с Vercel)
3. Railway автоматически перезапустится

---

## ✅ Проверь что всё работает

1. Открой `https://kerrinails-mvp.vercel.app`
2. Попробуй зарегистрироваться
3. Запишись на услугу
4. Открой `https://kerrinails-mvp.vercel.app/admin` и войди как `admin@kerrinails.ru`

---

## ❗ Частые проблемы

**Сайт открывается, но API не работает (ошибка сети)**
- Проверь что `VITE_API_URL` на Vercel указывает на правильный Railway URL
- Убедись, что Railway сервис запущен (зелёная точка)

**После обновления переменных не применились**
- На Vercel: зайди в **Deployments** → нажми **"Redeploy"**
- На Railway: переменные применяются автоматически

**Данные пропали после перезапуска Railway**
- Это нормально для бесплатного плана — Railway не сохраняет файлы между деплоями
- Для постоянного хранения нужна БД (следующий шаг развития проекта)
- Пока используй для тестов, данные клиентов храни в другом месте

---

## 📁 Структура файлов деплоя

```
kerrinails-mvp/
├── backend/
│   ├── railway.toml     ← конфиг для Railway
│   └── .env             ← НЕ загружается на GitHub (в .gitignore)
│                           переменные вводишь вручную в Railway
└── frontend/
    ├── vercel.json      ← конфиг для Vercel
    └── .env.example     ← пример переменных (заполни на Vercel)
```
