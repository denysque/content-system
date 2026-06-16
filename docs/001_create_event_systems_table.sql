-- 001 — Таблица сохранённых наборов материалов ведущего.
-- Один ряд = один сгенерированный набор (тема + 6 карточек) одного пользователя.
-- Выполнять в Supabase → SQL Editor.

create table if not exists public.event_systems (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  title      text not null default 'Мероприятие',
  idea       text,
  cards      jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists event_systems_user_id_idx
  on public.event_systems (user_id);
