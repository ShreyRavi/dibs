# Dibs — TODOs

Design doc: `~/.gstack/projects/ShreyRavi-dibs/shreyastallamraju-main-design-*.md`.

## Open — blocked on a real-world dependency

- [ ] **On-device unfurl test** — paste a real list link into iMessage + WhatsApp +
  SMS on a **physical phone**; confirm the OG card unfurls and deep-links. (Can only be
  done by a human on a real device — automated browsers don't unfurl links.)
- [ ] **Real Nudge notifications** — currently a local toast only. Sending an actual
  reminder needs a **contact channel** (email / SMS / push), which device-token
  identity doesn't have. This is a different identity model (collect a contact handle),
  not a small change — decide if/when that's worth it. Until then, Nudge stays a toast.
- [ ] **Reduced-motion on real hardware** — code path is correct (CSS
  `prefers-reduced-motion` disables animations; `Confetti` self-suppresses). Worth a
  final confirm on a physical phone.

## Completed (v0.3.0.0)

- [x] **Set Up date control** — replaced the native `datetime-local` + duplicate
  formatted span with a single `DateField` that shows only the formatted line and opens
  the OS picker via `showPicker()`.
- [x] **OG image caching** — `opengraph-image` now sends a long immutable
  `cache-control` so repeat unfurls/opens hit the CDN, not the renderer.
- [x] **Distributed rate limit** — `lib/rateLimit` is now pluggable: uses Upstash Redis
  REST when `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` are set (free tier
  works, shared across instances), in-memory otherwise. Set the env vars to activate.
- [x] **Identity restore-link (cross-device dup fix)** — `GET /api/lists/[id]/mylink`
  mints a personal restore URL; `GET /r/[code]/[token]` verifies it and adopts the same
  member on a new device (no duplicate). Bad/forged tokens set no cookie. Surfaced as
  "📱 Use on another device" on the List.
