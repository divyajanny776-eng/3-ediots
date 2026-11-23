-- 3 Idiots shared database (prototype shared-state storage)
create table if not exists public.app_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;
-- Prototype policy: allows app clients using the anon key to read/write the single shared state.
-- For production, replace with authenticated policies and proper user-level access control.
create policy "prototype read shared state" on public.app_state for select to anon, authenticated using (id = 'main');
create policy "prototype insert shared state" on public.app_state for insert to anon, authenticated with check (id = 'main');
create policy "prototype update shared state" on public.app_state for update to anon, authenticated using (id = 'main') with check (id = 'main');
