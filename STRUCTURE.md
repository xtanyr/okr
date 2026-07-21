# OKR System — Project Structure

## Стек

| Слой | Технология |
|------|-----------|
| Язык | TypeScript (backend + frontend) |
| Backend | Express 5, tsx для запуска TS напрямую |
| Frontend | React 19, MUI 7, Vite 7, Zustand, React Query, react-hook-form, axios |
| БД | PostgreSQL через Prisma 6 ORM |
| Auth | JWT (`jsonwebtoken`), bcrypt, refresh-token через axios interceptor |
| Почта | Nodemailer (Yandex SMTP) |
| Процесс-менеджер | pm2 (продакшн) / concurrently (dev) |
| Хостинг | Ubuntu-сервер, Nginx как reverse proxy + статика |

---

## Модель данных

```
User
 ├─ id, email, password, firstName, lastName, role (USER/ADMIN), archived
 └─ okrs → OKR[]

OKR
 ├─ id, userId, period ("2026-Q1"), archived, startDate?, endDate?, order
 ├─ goals → Goal[]
 └─ user → User

Goal
 ├─ id, okrId, title, keyInitiatives (комментарий), order
 └─ keyResults → KeyResult[]

KeyResult
 ├─ id, goalId, title, metric ("%"/"Рубли"/"Штуки"/"Дни")
 ├─ base, plan, formula, order
 ├─ comment?
 └─ weeklyMonitoring → WeeklyMonitoringEntry[]

WeeklyMonitoringEntry
 ├─ id, keyResultId, weekNumber, value
 └─ unique(keyResultId, weekNumber)

BackupLog (аудит бэкапов)
```

**Важно:** `fact` **не хранится** в БД — он вычисляется на лету из `weeklyMonitoring` по формуле.

---

## Что такое "цель" и "результат"

- **OKR** = Objective = квартальная/годовая цель пользователя (например, "2026-Q1").
- **Goal** = конкретная цель внутри OKR (например, "Увеличить выручку"). У цели есть `keyInitiatives` — текстовый блок с инициативами/комментарием.
- **Key Result** = измеримый показатель цели. У KR есть:
  - `base` — стартовое значение
  - `plan` — целевое значение
  - `formula` — как считать факт из weekly-значений
  - `weeklyMonitoring` — массив `{weekNumber, value}`, вводится пользователем каждую неделю

---

## Как считается прогресс

### 1. `fact` — фактическое значение KR

Вычисляется в `src/utils/okr.ts:1` по `formula` из weekly-значений:

| formula | расчет fact |
|---------|------------|
| `макс` | `Math.max(values)` |
| `среднее` | среднее арифметическое |
| `текущее` | последнее значение по weekNumber |
| `мин` | `Math.min(values)` |
| `сумма` | сумма всех значений |
| `снижение` | последнее значение |
| `макс без базы` | max - base |
| `среднее без базы` | среднее - base |
| `текущее без базы` | последнее - base |
| `минимум без базы` | min - base |
| `сумма без базы` | сумма - base |

### 2. `progress %` — процент выполнения

Вычисляется в `frontend/src/utils/progress.ts:1` единой формулой для всех formula (включая "снижение"):

```
progress = ((fact - base) / (plan - base)) * 100
progress = clamp(progress, 0, 100)
```

Для "снижение" при `base > plan` знаменатель отрицательный, и формула сама даёт правильный %.

### 3. Цвет прогресс-бара

| % | цвет |
|---|------|
| < 50 | красный `#dc2626` |
| 50–99 | жёлтый `#d97706` |
| 100 | зелёный `#059669` |

---

## Структура проекта

```
C:\okr\
├── .env                        # переменные окружения (DB, JWT, SMTP, PORT)
├── .env.local                  # локальный override для фронтенда (VITE_API_URL)
├── package.json                # scripts, backend deps
├── start-simple.ts             # dev entry: backend(4000) + frontend static(4001)
├── server.js                   # prod entry: Nginx → proxy /auth,/user,/okr → backend
├── frontend-server.js          # legacy proxy + static (deprecated)
├── prisma/
│   └── schema.prisma           # модель данных
├── src/
│   ├── index.ts                # backend entry (Express), CORS, routes, static в NODE_ENV=production
│   ├── auth.ts                 # регистрация, логин, forgot-password, refresh-token
│   ├── user.ts                 # профиль, список пользователей, смена пароля
│   ├── okr.ts                  # CRUD OKR, Goal, KeyResult, дублирование, словари
│   ├── email.ts                # nodemailer transporter с promise-guard
│   ├── middleware.ts            # requireAuth (JWT Bearer)
│   ├── middleware/
│   │   └── errorHandler.ts     # глобальный error handler
│   └── utils/
│       └── okr.ts              # calcFact (вычисление факта из weekly)
├── frontend/
│   ├── package.json            # frontend deps, scripts
│   ├── .env.local              # VITE_API_URL для локальной сборки
│   ├── dist/                   # production build
│   └── src/
│       ├── main.tsx            # entry, axios interceptor (refresh token)
│       ├── App.tsx             # роутинг
│       ├── theme.ts            # MUI theme, CSS-переменные
│       ├── types/index.ts      # TypeScript интерфейсы
│       ├── store/
│       │   └── userStore.ts    # Zustand store (user, token, login/logout)
│       ├── api/
│       │   └── axios.ts        # axios instance, 401 interceptor + refresh queue
│       ├── utils/
│       │   ├── okr.ts          # frontend calcFact
│       │   ├── weeks.ts        # getWeekNumber, getCalendarWeeksInPeriod, getWeekRangesForPeriod
│       │   └── progress.ts     # calcProgressPercent (единый для всего фронта)
│       ├── pages/
│       │   ├── Login.tsx
│       │   ├── Register.tsx
│       │   ├── Dashboard.tsx   # главный экран, список OKR, создание
│       │   ├── Profile.tsx
│       │   ├── ForgotPassword.tsx
│       │   └── ResetPassword.tsx
│       └── components/
│           ├── GoalItem.tsx          # Goal + KR + weekly monitoring таблица
│           ├── KeyResultRow.tsx      # строка KR с прогресс-баром
│           ├── KeyResultTableHeader.tsx
│           ├── OkrHeader.tsx         # селектор OKR, создание, архив
│           ├── ActionMenu.tsx
│           ├── ProgressBar.tsx
│           ├── PrivateRoute.tsx
│           └── dashboard/
│               ├── EmptyState.tsx
│               ├── OkrDetails.tsx
│               ├── OkrTabs.tsx
│               └── GoalsList.tsx
└── README.md                   # гайд по деплою на Ubuntu
```

---

## Запуск

```bash
# Dev
cd C:\okr
npm run dev

# Prod (сборка + pm2)
cd C:\okr\frontend
$env:VITE_API_URL="http://localhost:4000"
npm run build
cd ..
pm2 start start-simple.ts --name okr-app --interpreter node --interpreter-args "--import tsx" --cwd "C:\okr"
```

Или через `server.js` + Nginx, как в README.
