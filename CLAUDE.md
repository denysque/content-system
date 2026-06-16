# CLAUDE.md — content-system (AI-помощник ведущего)

Инструкции для Claude Code по этому проекту. Отвечать пользователю по-русски.

## Что это

Next.js 14 (app router) приложение: пользователь вводит **тему/идею мероприятия**,
AI разворачивает её в **6 материалов для ведущего**: текстовый сценарий, визуальная
концепция, сценарный план, банк шуток, чек-лист, список идей/активностей.

Лежит в подпапке `new app/` репозитория `invitation-gen` (untracked в git).
Изначально был демо-прототип «идея → соцсети» — полностью переделан под ведущего.

## Стек

- **Next.js 14.2** (app router, JS — не TypeScript), **React 18**, **Tailwind CSS 3**
- **Claude Sonnet 4.6** (`claude-sonnet-4-6`) через `@anthropic-ai/sdk` — серверный route
- **Supabase** (`@supabase/supabase-js`) — magic link auth + сохранение наборов

## Команды

```bash
npm run dev      # http://localhost:3000
npm run build    # прод-сборка (проверять перед деплоем)
npm run lint
```

## Деплой (Vercel, вручную — НЕ авто из GitHub)

```bash
vercel --prod --yes        # из папки "new app"
```

- Проект Vercel: `content-system` (scope denysques-projects)
- Прод: https://content-system.vercel.app
- Есть `vercel.json` с `{ "framework": "nextjs" }` — иначе Vercel не определяет фреймворк.

## Переменные окружения

Локально в `new app/.env.local` (gitignored), на Vercel — в Production.

| Переменная | Назначение |
|---|---|
| `ANTHROPIC_API_KEY` | серверный ключ Claude (НЕ `NEXT_PUBLIC`, в браузер не попадает) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://hpglxgadmoppkkrnsyjc.supabase.co` (проект idea-2-content) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | publishable-ключ (`sb_publishable_...`), публичный по дизайну |

Менять ключ на Vercel: `vercel env rm NAME production --yes` затем `vercel env add NAME production --value "..." --yes`.

## Архитектура

- `app/api/generate/route.js` — серверная генерация. **6 карточек генерируются
  параллельно** (`Promise.allSettled`, ~1500 max_tokens на карточку) — единый запрос
  на 8000 токенов не укладывался в 60с-лимит serverless-функции. Структурированный
  вывод через `output_config.format` (json_schema).
- **Гейт по входу:** route проверяет Supabase-сессию по `Authorization: Bearer <token>`
  (функция `getUser`); без валидной сессии — 401, Claude не вызывается. Клиент
  (`lib/generate.js`) прикладывает `access_token` из `supabase.auth.getSession()`.
- `lib/generate.js` — фетч на `/api/generate` + `fallbackSystem()` (демо-шаблон, если
  AI недоступен; показывается с жёлтым уведомлением).
- `lib/supabase.js` — браузерный клиент; `isSupabaseConfigured` = есть ли ключи.
- `components/AuthProvider.jsx` / `AuthButton.jsx` — сессия и вход magic link
  (`signInWithOtp`, `emailRedirectTo: window.location.origin`).
- `lib/systems.js` + `components/SavedSystems.jsx` — CRUD таблицы `event_systems`
  (Supabase, RLS по `user_id`) и список сохранённых наборов.
- `app/page.jsx` — главный экран (визард ввода → пайплайн-анимация → карточки).
- `components/ContentCard.jsx` — карточка формата (badge, leverage-кольцо, копирование).
  Формат карточки: `{ id, badge, format, accent: "plasma"|"electric", leverage, title, body }`.

## Конвенции

- Тёмная тема: graphite-фон, акценты `plasma` (фиолетовый) / `electric` (синий) —
  кастомные цвета в `tailwind.config.js`.
- Тексты UI и контент — на русском.
- Вывод модели рендерится как текст (React экранирует) — не использовать
  `dangerouslySetInnerHTML`.

## Backend / настройка

Полная инструкция по Supabase и ключам — в `SUPABASE_SETUP.md` (таблица `event_systems`
+ RLS, Redirect URLs, переменные).

- всегда создавай `.sql` файлы для любых SQL-запросов, которые пользователь должен выполнить
- помещай все `.sql` файлы в папку `/docs` в соответствующем проекте
- каждый файл должен начинаться с номера, чтобы фиксировать порядок выполнения операций
- вся схема базы данных должна быть задокументирована в папке `/docs` в отдельных `.sql` файлах
- называй файлы в таком формате: `001_create_x_table.sql`, `002_change_rls_policy.sql`, `003_add_foreign_key.sql` и т.д.