# Changelog

## 0.4.0.0 (2026-06-24)

### Fixed
- **Identity confusion across devices** — a member is now keyed by **phone number**
  (Partiful-style, but no OTP). The same number joins as the **same member** on any
  device, so one person no longer forks into duplicates (the in-app-browser / forwarded-
  link / second-device case). Phone is hashed (`sha256`), never stored raw; the device
  cookie stays the fast path so a known device never sees the prompt.

### Added
- **Name + number prompt** (modal) on first claim, replacing the single-field browser
  prompt. `0003` migration: `dibs_members.phone_hash` + partial unique `(list_id, phone_hash)`.


## 0.3.0.0 (2026-06-23)

### Added
- **Cross-device identity restore link** — `GET /api/lists/[id]/mylink` mints a personal
  link; `/r/{code}/{token}` adopts the same member on another device (no duplicate). Bad
  tokens set no cookie. Surfaced as "Use on another device" on the List.
- **Pluggable distributed rate limit** — Upstash Redis REST when `UPSTASH_REDIS_REST_*`
  env is set, in-memory otherwise.

### Changed
- **Set Up date control** — single clean line that opens the OS picker (`showPicker()`);
  dropped the redundant native widget text.
- **OG image** — long immutable `cache-control` so repeat unfurls hit the CDN.


## 0.2.0.0 (2026-06-23)

### Changed
- **Homepage is now a landing/demo + create CTA** — no longer a pre-filled "Dev's
  25th" event. The Set Up flow moved to `/new` and starts blank ("Name your event").
  Home shows what Dibs is, a static demo of the dibs mechanic, and a "Create a list"
  button.

### Added
- **Short permalinks** — every list now has a 7-char public code; the URL is
  `/l/{code}` (e.g. `/l/LNDxktS`) instead of a long UUID. Internal FKs still use the
  uuid; the code is resolved at the route boundary. `dibs_lists.code` migration
  (`0002`), unique + insert-retry on collision.

## 0.1.0.0 (2026-06-23)

First release — Dibs MVP. A frictionless shared to-do list for ad-hoc group
plans: set up a list, drop the link in any chat, and everyone calls dibs on
tasks with no app and no login.

### Added
- **Set Up screen** — editable title/date, auto-suggested tasks, add/remove,
  create flow (`POST /api/lists`, optional-host list-first identity).
- **Share surface + static OG card** — post-create share screen with the Dibs
  card preview + copy/native-share; `next/og` unfurl card (brand + title + date)
  with OG/Twitter meta; title locks on first share.
- **List screen + dibs mechanic** — pixel-accurate per the design handoff: 72px
  progress ring, crew avatars, owner/unclaimed/done task rows, **Call dibs**
  (claim → confetti + owner chip + count drop), toggle done, add task,
  needs-owner / all-done banners, Nudge, wrap-up.
- **Realtime** — Supabase Broadcast on `list:{id}` with op_id echo-ignore +
  `updated_at` staleness discard + reconnect resync. Atomic claim guard
  (`owner_member_id IS NULL`) gives exactly-one-winner under concurrent taps.
- **Complete screen** — commemorative seal, stat chips, crew, confetti payoff.
- **Design states** — loading skeleton, empty state, friendly 404, reconnecting
  banner.
- **Accessibility** — 44px touch targets, visible focus ring, ARIA-labeled
  controls, `prefers-reduced-motion` path.
- **Identity** — name + signed httpOnly device cookie (no login).
- **Infra** — Supabase schema on shared REDSA (`dibs_`-prefixed, deny-all RLS),
  Vercel Cron keep-alive (`/api/health`) + weekly TTL sweep (`/api/sweep`,
  fail-closed behind `CRON_SECRET`), best-effort create/join rate limits.
- **Tests** — Vitest unit (identity/position/colors/format/rateLimit) +
  Playwright E2E (create→claim flow, 404, concurrent-claim one-winner); CI runs
  typecheck + unit on every push/PR.
