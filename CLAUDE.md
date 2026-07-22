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

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> ec29853f4cfcc07ca7a9ccccf493547b18e981a2
## Услуги и цены — редактируются админом, без правок кода

Раньше цены/услуги жили в статическом файле `frontend/src/utils/data.ts` (`SERVICES`). Теперь это данные в БД (модель `Service` в `schema.prisma`), редактируемые из `/dashboard/services`, и подтягиваются на сайт живьём:

- **Backend**: `backend/routes/services.js` — `GET /api/services` (публичный, только `active: true`). CRUD для админа — в `backend/routes/admin.js`: `GET/POST /api/admin/services`, `PATCH/DELETE /api/admin/services/:id`.
- **Модель**: `Service { slug, category, name, price, description, active, order }`. Категории фиксированы: `manicure | pedicure | design | extension | care` (совпадают с фильтрами на публичных страницах Services/Prices).
- **Первичный перенос данных**: старые 12 услуг лежат в `backend/prisma/seed-services.js` — после `npx prisma migrate dev` нужно один раз выполнить `node prisma/seed-services.js`, чтобы не потерять текущие цены с сайта.
- **Frontend**: `hooks/useServices.tsx` — публичный контекст (`ServicesProvider`, обёрнут вокруг всего `<App>` в `App.tsx`), отдаёт `{ services, loading, reload }` из `/api/services`. Используется в `Home.tsx`, `Services.tsx`, `Prices.tsx`, `BookingModal.tsx`, `ScheduleTab.tsx` (там, где раньше был статический импорт `SERVICES`).
- **Админка**: `pages/Admin/ServicesTab.tsx` (`/dashboard/services`) — список с фильтром по категориям, создание/редактирование (модалка), скрыть/показать (`active`), удаление. После **любого** изменения вызывается и админский рефетч, и `reloadPublicServices()` из `useServices` — публичный сайт видит новую цену сразу, без деплоя и обновления страницы (в рамках уже открытых вкладок; для гарантированно live-обновления *других* открытых у клиентов вкладок в реальном времени нужны WebSocket/SSE — этого нет, при следующей загрузке/переходе страницы всё равно подтянутся свежие данные).
- **Картинки** услуг остаются локальными файлами сборки (не в БД) — подбираются по `category` через `frontend/src/utils/serviceImages.ts`. Если нужна загрузка своих фото на каждую услугу — отдельная задача (поле `imageUrl` + аплоад).
- `utils/data.ts` больше не экспортирует `SERVICES` — только `PORTFOLIO_ITEMS` (портфолио не связано с ценами, осталось статикой).

## Портфолио — загрузка/редактирование/сортировка/удаление фото админом

`utils/data.ts` полностью удалён (последний статический список, `PORTFOLIO_ITEMS`, тоже переехал в БД). Всё портфолио теперь живёт в БД и управляется из `/dashboard/portfolio`:

- **Модель**: `PortfolioItem { imageData, description, category, order }` в `schema.prisma`. Категории те же 4, что и на публичной странице портфолио: `manicure | pedicure | design | extension`.
- **Хранение фото**: без внешнего файлового хранилища (S3/Cloudinary) — картинка лежит прямо в БД как base64 (`data:image/jpeg;base64,...`), в текстовом поле. Фронтенд сжимает/уменьшает фото до 1600px и JPEG-качества ~0.82 перед отправкой (`compressImage` в `PortfolioTab.tsx`), поэтому строка обычно 100–400 КБ, а не по 5–10 МБ с телефона. Тело JSON-запроса на бэкенде увеличено до 15 МБ (`express.json({ limit: '15mb' })` в `server.js`) — этого достаточно с большим запасом.
  - Если в будущем понадобится реальное файловое хранилище (например, много фото или тяжёлые исходники) — это апгрейд на S3/Cloudinary/Railway Volume, отдельная задача.
- **Backend**: `backend/routes/portfolio.js` — `GET /api/portfolio` (публичный). CRUD в `backend/routes/admin.js`: `GET/POST /api/admin/portfolio`, `PATCH/DELETE /api/admin/portfolio/:id`, `PATCH /api/admin/portfolio-reorder` (принимает `{ order: [id, id, ...] }` — новый порядок сортировки разом).
- **Seed**: `backend/prisma/seed-portfolio.js` — переносит старые 12 фото (из бывшего `utils/data.ts`) в БД. Запускать один раз после миграции: `node prisma/seed-portfolio.js` (читает исходники из `../frontend/src/assets/`, поэтому запускать нужно из монорепо, где рядом лежит `frontend/`).
- **Frontend**: `hooks/usePortfolio.tsx` (`PortfolioProvider`, обёрнут вокруг `<App>` рядом с `ServicesProvider`) — публичный `{ items, loading, reload }` из `/api/portfolio`. `pages/Portfolio/Portfolio.tsx` использует его вместо статического списка.
- **Админка**: `pages/Admin/PortfolioTab.tsx` (`/dashboard/portfolio`) — загрузка (можно несколько файлов разом, категория общая для пачки), редактирование описания/категории (модалка), сортировка стрелками ↑/↓ (доступна только во вкладке «Все» — иначе неочевидно, с каким соседним фото по другой категории идёт обмен местами), удаление. После любого действия обновляется и админский список, и публичный (`reloadPublic()`), так же как для услуг.

## Баннеры — акции/реклама по бокам сайта

Новый раздел `/dashboard/banners`, модель `Banner` в `schema.prisma`: `text`, `imageData` (base64, необязательно), `linkUrl` (необязательно — клик по баннеру), `startDate`, `endDate`.

- **Backend**: `backend/routes/banners.js` — `GET /api/banners` (публичный, отдаёт только баннеры, у которых `startDate <= сейчас <= endDate`, остальное отфильтровывается на уровне SQL-запроса). CRUD в `admin.js`: `GET/POST /api/admin/banners`, `PATCH/DELETE /api/admin/banners/:id` — отдаёт вообще все баннеры, включая ещё не начавшиеся и уже завершённые (нужно для списка в дашборде со статусами).
- **Frontend, публичная часть**: `hooks/useBanners.tsx` (`BannersProvider`, в `App.tsx` рядом с `ServicesProvider`/`PortfolioProvider`) + `components/Layout/SideBanners.tsx`, подключён в `Layout.tsx` рядом с декоративными ромашками. Показывается **только на очень широких экранах** (`2xl:` — от 1536px), т.к. на более узких физически нет места сбоку от контента (`max-w-6xl`), не перекрывая сам контент. Если активен 1 баннер — показывается зеркально с обеих сторон; если 2+ — разные баннеры слева/справа (третий и далее пока не показываются, для боутик-салона это не проблема, но если понадобится больше — нужна ротация/карусель).
- **Оформление баннера без фото** (`SideBanners.tsx`, `BannerContent`) — карточка в общем стиле сайта (не универсальный шаблон): мягкий розовый градиент, тонкая золотая полоса-разделитель, эйбрow «✦ АКЦИЯ», текст акции курсивом Georgia — оформлено как маленькая бутик-открытка/подарочный сертификат, а не как рекламный баннер. Если указано фото — оно показывается на всю карточку (3:4), текст (если есть) — подписью поверх градиента снизу. Если указана ссылка — вся карточка кликабельна (новая вкладка), с лёгким подъёмом и тенью при наведении и стрелкой «Подробнее →».
- **Админка**: `pages/Admin/BannersTab.tsx` — список со статусом (Запланирован / Активен / Завершён — считается на лету по датам), создание/редактирование (текст и/или фото — используется общий `utils/compressImage.ts`, ссылка, даты начала/конца через `<input type="date">`), удаление. Как и в других разделах — после изменения обновляется и админский список, и публичный `useBanners.reload()`.
- Все картинки (портфолио и баннеры) используют один и тот же паттерн хранения (base64 в БД) — см. раздел про портфолио выше про ограничения этого подхода и путь апгрейда на S3/Cloudinary при росте объёма.

## Дизайн дашборда — тёмная тема + GSAP

- Весь `/dashboard` переведён на тёмную тему в духе **TailAdmin**: фон страницы `bg-[#0b0e14]`, поверхности карточек `bg-gray-900` с `border-gray-800`, статус-плашки — полупрозрачные (`bg-<color>-500/10..25` + `text-<color>-300/400`), а не сплошные светлые, как раньше.
- Анимации входа сделаны на **GSAP** (`gsap` + `@gsap/react`, хук `useGSAP`):
  - `AdminLayout.tsx` — пункты сайдбара появляются с лёгким stagger при монтировании; область контента делает fade+slide при смене роута (`dependencies: [location.pathname]`).
  - `StatsTab.tsx` — карточки статистики (`.stat-card`) появляются каскадом.
  - `AppointmentsTab.tsx` — карточки записей (`.appointment-card`) анимируются при смене фильтра.
  - `AppointmentCalendar.tsx` — календарь и панель дня (`.calendar-panel`) появляются с fade+slide.
- При добавлении новых элементов в дашборд — держаться той же палитры (см. константы `STATUS_COLORS`/`DOT_COLORS` в файлах табов) и оборачивать анимируемые списки в `useGSAP({ scope: ref })`, а не плодить новые цветовые схемы.
- ⚠️ `react-select`/`<select>`/`<option>` в модалках `ScheduleTab.tsx` остаются со стандартным браузерным рендером выпадающего списка (белый фон/чёрный текст) — это ограничение нативного HTML `<select>`, не баг; при желании полностью тёмного дропдауна нужен кастомный listbox-компонент.

<<<<<<< HEAD
=======
=======
>>>>>>> 7898cfa5490e04dec799c3d7640ff5e2abeccde1
>>>>>>> ec29853f4cfcc07ca7a9ccccf493547b18e981a2
## Важные договорённости

- Все тексты в интерфейсе — на русском по умолчанию (i18n подключен, но большая часть админки и текстов пока хардкодит `ru`).
- Цветовая палитра: розовый/pink как акцент (`pink-500`, `pink-600`), нейтральный gray для текста/фонов, скругления `rounded-xl`/`rounded-2xl`, мягкие тени `shadow-sm`.
- Стиль кода: табы для отступов (как в исходных файлах), одинарные кавычки в JSX/TS.
- Не используем `tailwind.config.js` — Tailwind v4 подключен через Vite-плагин, кастомные токены (если нужны) добавлять через `@theme` в `index.css`.

## Известные ограничения / TODO

- В песочнице разработки нет доступа к сети → `npm install` и сборка (`vite build`) не проверялись автоматически при последних правках. **Перед деплоем обязательно прогнать `npm install && npm run build` локально.**
- Backend не покрыт тестами.
