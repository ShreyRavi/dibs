"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Browser Supabase client — used ONLY to open the Realtime Broadcast websocket.
// It never reads/writes dibs_ tables (those go through route handlers). The anon
// key is safe to ship here; deny-all RLS keeps the tables inert to it.
let _client: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  _client = createClient(url, key, {
    auth: { persistSession: false },
    realtime: { params: { eventsPerSecond: 10 } },
  });
  return _client;
}
