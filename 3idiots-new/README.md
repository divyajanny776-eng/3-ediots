# 3 Idiots Shared Database Setup

This project uses Supabase shared state so expenses and users can be shared between app users/devices.

## Environment
The included `.env` contains the supplied Supabase project URL and publishable key. Keep publishable keys in frontend env only; never put a Supabase secret/service-role key here.

## Database
Create `public.app_state` with `id text primary key`, `data jsonb not null`, and `updated_at timestamptz not null default now()`. Enable RLS and add SELECT, INSERT, UPDATE policies for `anon` and `authenticated` restricted to `id = 'main'`. The Supabase Table Editor should show the `app_state` table and the three policies.

## Run
```bash
npm install
npm run dev
```

The app saves the complete shared app state to the `app_state` row with id `main`. Updates are synchronized through Supabase Realtime and a 5-second polling fallback.

**Prototype security note:** this shared-state prototype stores the app's user records and demo passwords in the shared JSON state. Do not use real or sensitive passwords. For production, replace this with Supabase Auth and per-user policies.
