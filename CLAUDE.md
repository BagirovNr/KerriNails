# CLAUDE.md — KerriNails MVP

Справочник по проекту, чтобы не пересматривать всё заново в новых сессиях.

## Стек

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4 (`@tailwindcss/vite`, без `tailwind.config` — настройки через CSS/дефолты v4)
- **Backend**: Node.js + Express + Prisma (`backend/prisma/schema.prisma`)
- **i18n**: `react-i18next`, языки: `ru` (основной), `en`, `az`, `uz`, `hy` → `frontend/src/i18n/<lang>/translation.json`
- **Роутинг**: `react-router-dom` v7, `BrowserRouter`
- **Auth**: JWT в localStorage, контекст `useAuth()` (`frontend/src/hooks/useAuth.tsx`), роли `client` | `admin`
- **Деплой**: frontend → Vercel (`frontend/vercel.json`), backend → Railway (`backend/railway.toml`), см. `DEPLOY.md`

## Структура frontend/src

```
components/
  Header, Footer, Layout        — публичный сайт (хедер/футер/декор-ромашки)
  BookingForm/                  — модалки записи и переноса записи
  forms/AuthModal               — вход/регистрация
pages/
  Landing/                      — стартовая страница "/", без Layout (мобильный хаб). Авторизованный admin мгновенно редиректится на /dashboard.
  Home, Services, Portfolio,
  Prices, Contact               — публичные страницы, обёрнуты в <Layout>. Layout сам редиректит admin-пользователя на /dashboard (админ не видит публичный сайт).
  MyAppointments                — личный кабинет клиента
  Admin/
    AdminLayout.tsx             — оболочка дашборда: своя навигация (сайдбар на десктопе, слайд-меню на мобильном), НЕ использует публичный Header/Footer/Layout. Грузит данные через AdminDataProvider.
    AppointmentsTab.tsx         — таб "Записи" (список + фильтры + смена статуса)
    AppointmentCalendar.tsx     — таб "Календарь", построен на библиотеке react-day-picker (кастомный DayButton с точками записей)
    ScheduleTabRoute.tsx        — обёртка, подключающая ScheduleTab к общему контексту данных
    ScheduleTab.tsx             — рабочий календарь (неделя/месяц), day-off/vacation/blocked slots, ручная запись (не менялся)
    StatsTab.tsx                — таб "Статистика" (карточки метрик, на мобильном — горизонтальный скролл вместо сжатой сетки)
hooks/
  useAuth.tsx                   — контекст авторизации
  useAdminData.tsx              — общий контекст данных дашборда (appointments, stats, reload, updateStatus), используется всеми вкладками /dashboard
utils/api.ts                    — apiFetch, базовый URL backend
utils/time.ts                   — работа с датами/таймзоной салона
utils/data.ts                   — SERVICES (список услуг, цены, длительность)
i18n/                           — переводы
```

## Роутинг (App.tsx)

- `/` → `LandingPage` (без Layout). Если админ уже авторизован → сразу редирект на `/dashboard`.
- `/home`, `/services`, `/portfolio`, `/prices`, `/contact`, `/my-appointments` → обёрнуты в публичный `<Layout>` (Header/Footer/ромашки). `Layout` сам уводит авторизованного админа на `/dashboard` — публичный сайт для него не открывается.
- `/dashboard` (+ вложенные `/dashboard/calendar`, `/dashboard/schedule`, `/dashboard/stats`) → **`<AdminLayout>`**, полностью отдельная оболочка страницы, никак не связанная с публичным `<Layout>`.

## Dashboard (бывшая AdminPanel)

- Раньше был один компонент `AdminPanel.tsx` с внутренними табами — **разбит на отдельные страницы-роуты** внутри `/dashboard`, у каждой свой URL (записи/календарь/расписание/статистика). Так проще расширять (добавлять новые страницы админки — бары, продвинутая статистика и т.п.) без раздувания одного файла.
- `AdminLayout.tsx` — грузит данные один раз через `AdminDataProvider` (`useAdminData`), навигация: сайдбар слева на десктопе, кнопка-гамбургер + слайд-меню на мобильном. Контент — в `<main className='overflow-y-auto'>`, поэтому длинные списки/статистика скроллятся, а не обрезаются.
- Доступ только для `user.role === 'admin'`, иначе редирект на `/home`.
- Календарь (`AppointmentCalendar.tsx`) переписан на библиотеку **`react-day-picker`** (добавлена в `package.json`, `^9.14.0`) вместо самодельной сетки — локализация `ru` из `react-day-picker/locale`, кастомный `DayButton` рисует точки-индикаторы записей под числом дня, выбор дня показывает список записей справа/снизу.
- Мобильная адаптивность: статистика на мобильном — горизонтальная лента карточек со скроллом (`StatsTab.tsx`) вместо сжатой в 2 колонки сетки, где часть цифр было не видно; вся область контента дашборда скроллится независимо от сайдбара/шапки.

## Добавление новых страниц дашборда

Чтобы добавить новую страницу (например, "Финансы" или "Продвинутая статистика"):
1. Создать компонент в `pages/Admin/`.
2. Добавить пункт в `NAV_ITEMS` в `AdminLayout.tsx`.
3. Добавить вложенный `<Route path='...' element={...} />` внутри `<Route path='/dashboard' element={<AdminLayout />}>` в `App.tsx`.

## Важные договорённости

- Все тексты в интерфейсе — на русском по умолчанию (i18n подключен, но большая часть админки и текстов пока хардкодит `ru`).
- Цветовая палитра: розовый/pink как акцент (`pink-500`, `pink-600`), нейтральный gray для текста/фонов, скругления `rounded-xl`/`rounded-2xl`, мягкие тени `shadow-sm`.
- Стиль кода: табы для отступов (как в исходных файлах), одинарные кавычки в JSX/TS.
- Не используем `tailwind.config.js` — Tailwind v4 подключен через Vite-плагин, кастомные токены (если нужны) добавлять через `@theme` в `index.css`.

## Известные ограничения / TODO

- В песочнице разработки нет доступа к сети → `npm install` и сборка (`vite build`) не проверялись автоматически при последних правках. **Перед деплоем обязательно прогнать `npm install && npm run build` локально.**
- Backend не покрыт тестами.
