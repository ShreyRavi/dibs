# Testing

100% coverage is the goal — tests make vibe coding safe. With them, you move
fast and trust your instincts; without them, it's yolo coding.

## Run
```bash
bun run test       # Vitest unit suite
bun run test:e2e   # Playwright E2E (needs a dev server on :3001 + REDSA)
bun run typecheck  # tsc --noEmit
```

## Layers
- **Unit (Vitest, `lib/*.test.ts`)** — pure logic: `identity` (cookie sign/verify,
  list-scoped capability), `position` (fractional ordering, no-collision appends),
  `colors` (palette cycling), `format` (date line).
- **E2E (Playwright, `e2e/*.spec.ts`)** — runs against a live dev server:
  - `flow.spec.ts` — Set Up → Share → open List → Call dibs; friendly 404.
  - `concurrent-claim.spec.ts` — the core guarantee: two members claim one task in
    parallel → exactly one 200 (winner) + one 409 (atomic null-guard).

To run E2E: `PORT=3001 bun run dev` in one terminal, then `bun run test:e2e`.
The dev server reads `.env.local` (REDSA keys + `DIBS_COOKIE_SECRET`).

## Conventions
- Test pure functions with real assertions, never `expect(x).toBeDefined()`.
- New function → unit test. Bug fix → regression test. New branch → test both paths.
- CI (`.github/workflows/test.yml`) runs typecheck + unit on every push/PR.
