# Dibs — TODOs

Deferred items from the MVP build (design doc:
`~/.gstack/projects/ShreyRavi-dibs/shreyastallamraju-main-design-*.md`).

## Design polish
- [ ] **Set Up date control** — the native `datetime-local` widget + the formatted
  "· Sat, Jun 27, 8 PM" span read as redundant/clunky. Replace with a custom date
  picker styled to the handoff's muted date line. (P5/design-review flagged.)
- [ ] **Reduced-motion audit on real hardware** — confirm confetti/pop fully calm
  under `prefers-reduced-motion` on a physical phone.

## Product / identity
- [ ] **Identity-merge ("this is you?")** — same human across two devices or a
  forwarded link forks into duplicate members. v1 accepts dupes; add a soft merge.
- [ ] **Real Nudge notifications** — currently a local toast only (no contact handle
  under device-token identity). Needs a contact method first.

## Infra / scale
- [ ] **Distributed rate limit** — `lib/rateLimit.ts` is in-memory (per instance,
  resets on cold start). Move to Upstash/Vercel KV if abuse becomes real.
- [ ] **OG image caching** — add explicit cache headers on `opengraph-image` so repeat
  unfurls don't re-render (iMessage caches anyway).

## Validation (do before relying on the hook)
- [ ] **On-device unfurl test** — paste a real list link into iMessage + WhatsApp +
  SMS on a physical phone; confirm the OG card unfurls and deep-links.
