-- 002 — Row Level Security для event_systems.
-- Каждый пользователь видит, создаёт и удаляет ТОЛЬКО свои наборы.
-- Идемпотентно: drop policy if exists перед create, можно перезапускать.
-- (UPDATE-политики нет намеренно — приложение не редактирует сохранённые наборы.
--  Если появится редактирование — добавить отдельным файлом 00X_..._update_policy.sql.)

alter table public.event_systems enable row level security;

drop policy if exists "Users read own systems" on public.event_systems;
create policy "Users read own systems"
  on public.event_systems for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own systems" on public.event_systems;
create policy "Users insert own systems"
  on public.event_systems for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own systems" on public.event_systems;
create policy "Users delete own systems"
  on public.event_systems for delete
  using (auth.uid() = user_id);
