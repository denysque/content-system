# Настройка backend для AI-помощника ведущего (content-system)

Приложение использует:
- **Claude Sonnet 4.6** (серверный route `/api/generate`) — генерация материалов
- **Supabase** (тот же проект, что у invitation-gen) — авторизация magic link + сохранение наборов

## 1. Anthropic API-ключ

1. https://console.anthropic.com → **API Keys** → **Create Key** (начинается с `sk-ant-...`).
   Требует пополнения баланса (pay-as-you-go).
2. **Локально:** ключ уже в `new app/.env.local` (`ANTHROPIC_API_KEY`).
3. **На Vercel:**
   `vercel env add ANTHROPIC_API_KEY production --value "sk-ant-..." --yes`
   (или в дашборде проекта content-system → Settings → Environment Variables).

> `ANTHROPIC_API_KEY` — серверная переменная (без `NEXT_PUBLIC_`), в браузер не попадает.

## 2. Таблица сохранённых наборов

Supabase Dashboard (проект `hpglxgadmoppkkrnsyjc`) → **SQL Editor** → выполни:

```sql
create table public.event_systems (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Мероприятие',
  idea text,
  cards jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index event_systems_user_id_idx on public.event_systems (user_id);

-- Row Level Security: каждый видит только свои наборы
alter table public.event_systems enable row level security;

create policy "Users read own systems"
  on public.event_systems for select
  using (auth.uid() = user_id);

create policy "Users insert own systems"
  on public.event_systems for insert
  with check (auth.uid() = user_id);

create policy "Users delete own systems"
  on public.event_systems for delete
  using (auth.uid() = user_id);
```

## 3. Redirect URL для magic link

Это **тот же** Supabase-проект, что у invitation-gen, поэтому Email/Magic Link уже
включён. Нужно лишь добавить адреса content-system в allow-list:

Dashboard → **Authentication** → **URL Configuration** → **Redirect URLs**, добавь:
```
http://localhost:3000
https://content-system.vercel.app
https://content-system.vercel.app/**
```
(Site URL менять не нужно — он общий; magic link вернёт на тот origin, с которого
начали вход, благодаря `emailRedirectTo: window.location.origin`.)

## 4. Переменные окружения (итог)

| Переменная | Где | Значение |
|---|---|---|
| `ANTHROPIC_API_KEY` | Vercel (Production) + `.env.local` | `sk-ant-...` |
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel (Production ✓) + `.env.local` ✓ | `https://hpglxgadmoppkkrnsyjc.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel (Production ✓) + `.env.local` ✓ | `sb_publishable_...` |

## 5. Проверка

Локально:
```
cd "new app"
npm run dev      # http://localhost:3000
```
1. Введи тему мероприятия → «Развернуть в материалы» → 6 карточек от Claude.
2. Нажми **«Войти»** → почта → ссылка из письма → вернёшься залогиненным.
3. На результате нажми **«Сохранить»**, задай название.
4. Набор появится в блоке «Мои сохранённые наборы». Обнови страницу — останется.

Без `ANTHROPIC_API_KEY` генерация отдаёт демо-шаблон (с жёлтым уведомлением).
Без Supabase-ключей кнопка входа и сохранение просто скрыты.

## Архитектура

- `app/api/generate/route.js` — серверный вызов Claude Sonnet 4.6 (структурированный JSON).
- `lib/generate.js` — клиентский фетч на route + демо-фолбэк.
- `lib/supabase.js` — браузерный клиент Supabase.
- `components/AuthProvider.jsx` / `AuthButton.jsx` — сессия и вход magic link.
- `lib/systems.js` — CRUD таблицы `event_systems`.
- `components/SavedSystems.jsx` — список сохранённых наборов.
