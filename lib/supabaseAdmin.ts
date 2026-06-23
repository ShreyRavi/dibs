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
// Uses the admin client's realtime connection; fire-and-forget.
export async function broadcast(
  listId: string,
  event: Record<string, unknown>,
): Promise<void> {
  const channel = supabaseAdmin().channel(`list:${listId}`, {
    config: { broadcast: { ack: false } },
  });
  await channel.send({ type: "broadcast", event: "change", payload: event });
  await supabaseAdmin().removeChannel(channel);
}
