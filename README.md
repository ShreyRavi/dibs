# Dibs

A frictionless shared to-do list for ad-hoc group plans (a birthday, a trip, a
potluck). One person sets up a list, drops the link in any chat, and everyone
**calls dibs** on tasks — no app, no login.

Design + plan: `~/.gstack/projects/ShreyRavi-dibs/shreyastallamraju-main-design-*.md`
(or `design_handoff_dibs/README.md` for the original hifi handoff).

## Stack
Next.js 15 (App Router) · React 19 · Supabase (free tier, shared **REDSA** project,
all objects `dibs_`-prefixed) · Tailwind · framer-motion · deployed on Vercel.

## Architecture (lightweight, free-tier)
- **All reads/writes go through Next route handlers** using the Supabase service
  role. No table RLS on the hot path — deny-all RLS keeps the `dibs_` tables inert
  to anon on the shared instance.
- **Live updates = Supabase Realtime Broadcast** on channel `list:{id}`. The
  browser holds the anon key ONLY for this websocket. Clients ignore their own
  echo (`op_id`) and discard stale events (`updated_at`); `GET state` resyncs.
- **Identity = name + signed httpOnly device cookie** (`lib/identity.ts`). No
  login. Cold visitors land on the live list read-only; the name prompt fires on
  their first "Call dibs".
- **Keep-alive:** `vercel.json` cron hits `/api/health` daily so the free
  Supabase project never pauses.

## Routes
| Route | Purpose |
|-------|---------|
| `POST /api/lists` | create list + host member, seed tasks, set cookie |
| `POST /api/lists/[id]/join` | name → member + cookie (fires on first claim) |
| `GET  /api/lists/[id]/state` | full snapshot (first paint + reconnect resync) |
| `POST /api/lists/[id]/tasks` | add task |
| `POST /api/tasks/[id]` | claim / unclaim / toggle / delete (atomic guards) |
| `GET  /api/health` | keep-alive |

## Setup
```bash
bun install
cp .env.example .env.local   # fill in REDSA url + keys + DIBS_COOKIE_SECRET
# apply supabase/migrations/0001_dibs_init.sql to the REDSA project
bun run dev
```

`DIBS_COOKIE_SECRET`: `openssl rand -hex 32`.

## Status
Scaffold (T1/T2 + skeleton screens) is in. Remaining build tasks T3-T12 are in
the design doc's "Implementation Tasks" section.
