# Changelog

## 0.7.2.0 (2026-06-28)

### SEO / social
- Added robots.txt (index only the homepage; disallow private /l/, /r/, /new,
  /api) and a sitemap (homepage).
- metadataBase + canonical + Open Graph / Twitter defaults; a branded homepage
  OG image (app/opengraph-image) so shared links unfurl with a card.
- Private list pages now emit noindex,nofollow — kept out of search while their
  OG tags still let chat apps unfurl the link.


## 0.7.1.0 (2026-06-28)

### Performance (no functional/visual change)
- List page server-render: deduped the list-by-code lookup across
  generateMetadata + the page body via React cache() (one query, was two), and
  folded the member-identity lookup into the parallel query batch.
- Trimmed 3 unused web-font weight files (Gabarito 500/900, Hanken 800) — only
  the weights the UI actually uses are downloaded.


## 0.7.0.0 (2026-06-28)

### Performance / efficiency (no functional change)
- **Battery + DB load**: the live-list resync interval now pauses while the tab
  is backgrounded (resyncs once on refocus) — no radio wakeups or DB polling
  from hidden tabs, which matters a lot on mobile.
- **Realtime broadcast** now uses Realtime's HTTP endpoint instead of opening +
  closing a WebSocket channel on every task action — one stateless request, less
  serverless latency. Delivery verified unchanged.
- **State snapshot**: the member-identity lookup runs in parallel with the
  members/tasks queries (was a wasted extra roundtrip on every paint/resync).
- Dropped the unused **framer-motion** dependency (smaller install/bundle).

### Mobile-readiness
- Added a **PWA manifest** + apple-touch / maskable icon (installable; gives the
  future mobile wrapper a real app identity).


## 0.6.0.0 (2026-06-25)

### Added
- **Tap a task's text to edit or delete it** — opens a modal (Update / Delete,
  two-step delete confirm). Member-gated: prompts name+phone first if needed.
  The done circle keeps its own toggle behavior. New `edit` task action.


## 0.5.0.0 (2026-06-25)

### Added
- **Event fields** — emoji "logo" (curated picker), description, and an external
  invite URL ("View the invite →"). New `0003`/`0004` columns.
- **List settings** (`/l/[code]/settings`) — edit name, emoji, date, description,
  invite link, mark (un)completed; import/export tasks as a comma list.
- **Completed state** — "Wrap up the event" sets `completed`; a past or completed
  event shows a recap callout linking to /complete (stays editable).
- **Comma-separated tasks** — typing "cake, playlist, bar" adds several at once
  (Set Up, List, and settings import).
- **Branding** — favicon, the Dibs logo + wordmark on every list page, a footer
  "© Dibs by Kansoboard {year} · {commit}", and "Dibs by Kansoboard" linking
  kansoboard.com on the homepage.

### Changed
- **Complete screen** — redesigned, centered "EVENT COMPLETE" seal (uses the
  event emoji); "Pulled off by the crew" now lists full names with each person's
  finished tasks as sub-items.
- Crew label reads "You + N other planners".
- Adding an unclaimed task no longer requires a name (claiming still does).

### Security
- `invite_url` restricted to http(s) (server + render) — blocks `javascript:` XSS.

### Data
- Prod data reset to a clean slate (non-backward-compatible schema change).


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
