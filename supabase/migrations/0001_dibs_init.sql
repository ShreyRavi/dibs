-- Dibs schema on the shared REDSA Supabase project.
-- EVERY object is `dibs_`-prefixed to namespace it on the shared instance.
--
-- Security model (see design doc): all reads/writes go through Next route
-- handlers using the service role, which BYPASSES RLS. We still enable RLS with
-- ZERO policies on every dibs_ table, so the anon/authenticated roles can touch
-- nothing directly. The anon key ships to the browser only for Realtime
-- Broadcast (channel `list:{id}`), which does not read these tables.
--
--   data flow
--   ─────────
--   browser ──(fetch)──► Next route handler ──(service role)──► dibs_ tables
--      │                        │
--      │                        └──(publish)──► Realtime Broadcast `list:{id}`
--      └──(ws, anon key)──────────────────────► Realtime Broadcast `list:{id}`

create extension if not exists pgcrypto;

-- ── dibs_lists ──────────────────────────────────────────────────────────────
create table if not exists public.dibs_lists (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  event_at   timestamptz,                 -- carries the time ("8 PM"); UI formats
  shared     boolean not null default false, -- true after first share → title locks
  created_at timestamptz not null default now()
);

-- ── dibs_members ────────────────────────────────────────────────────────────
create table if not exists public.dibs_members (
  id                uuid primary key default gen_random_uuid(),
  list_id           uuid not null references public.dibs_lists (id) on delete cascade,
  name              text not null,
  color             text not null,          -- from the fixed palette (see lib/colors.ts)
  device_token_hash text not null,          -- HMAC sig bound to this member+device
  created_at        timestamptz not null default now()
);
create index if not exists dibs_members_list_id_idx on public.dibs_members (list_id);

-- ── dibs_tasks ──────────────────────────────────────────────────────────────
create table if not exists public.dibs_tasks (
  id              uuid primary key default gen_random_uuid(),
  list_id         uuid not null references public.dibs_lists (id) on delete cascade,
  emoji           text not null default '✨',
  title           text not null,
  owner_member_id uuid references public.dibs_members (id) on delete set null,
  done            boolean not null default false,
  position        text not null,            -- fractional index → no add collisions
  updated_at      timestamptz not null default now(), -- drives Realtime staleness
  created_at      timestamptz not null default now(),
  deleted_at      timestamptz               -- soft delete
);
create index if not exists dibs_tasks_list_id_idx on public.dibs_tasks (list_id);

-- bump updated_at on every write (Realtime ordering depends on it)
create or replace function public.dibs_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists dibs_tasks_touch on public.dibs_tasks;
create trigger dibs_tasks_touch
  before update on public.dibs_tasks
  for each row execute function public.dibs_touch_updated_at();

-- ── RLS: deny-all (zero policies) ───────────────────────────────────────────
-- Enabling RLS with no policies denies anon/authenticated entirely. The service
-- role (server routes) bypasses RLS. This contains blast radius on shared REDSA.
alter table public.dibs_lists   enable row level security;
alter table public.dibs_members enable row level security;
alter table public.dibs_tasks   enable row level security;

-- Revoke any default grants to anon/authenticated for belt-and-suspenders.
revoke all on public.dibs_lists   from anon, authenticated;
revoke all on public.dibs_members from anon, authenticated;
revoke all on public.dibs_tasks   from anon, authenticated;
