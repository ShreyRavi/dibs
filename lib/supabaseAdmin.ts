import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only Supabase client using the service-role key. Bypasses RLS.
// NEVER import this into a client component. All dibs_ reads/writes go here.
let _admin: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  _admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _admin;
}

// Publish a Broadcast event to channel `list:{id}` so subscribed clients update.
// Uses Realtime's HTTP endpoint — one stateless request, no WebSocket handshake
// per action (the old channel.send opened+closed a socket on every mutation,
// adding latency on serverless). Fire-and-forget; clients self-heal via resync.
export async function broadcast(
  listId: string,
  event: Record<string, unknown>,
): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  await fetch(`${url}/realtime/v1/api/broadcast`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      messages: [
        { topic: `list:${listId}`, event: "change", payload: event, private: false },
      ],
    }),
  }).catch(() => {
    /* best-effort; subscribers reconcile on their next resync */
  });
}
