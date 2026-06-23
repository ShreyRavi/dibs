// Test env: identity signing needs a secret. Never use this value in prod.
process.env.DIBS_COOKIE_SECRET =
  process.env.DIBS_COOKIE_SECRET || "test-secret-do-not-use-in-prod";
