# Changelog

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
