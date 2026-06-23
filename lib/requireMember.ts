import { cookies } from "next/headers";
import { supabaseAdmin } from "./supabaseAdmin";
import { cookieName, verifyToken } from "./identity";
import type { Member } from "./types";

// Resolve the current device's member for a list from the signed cookie.
// Returns null when there is no valid cookie (the caller is anonymous and must
// go through /join before writing). Shared by all write routes (DRY).
export async function requireMember(listId: string): Promise<Member | null> {
  const jar = await cookies();
  const token = jar.get(cookieName(listId))?.value;
  const memberId = verifyToken(token, listId);
  if (!memberId) return null;

  const { data, error } = await supabaseAdmin()
    .from("dibs_members")
    .select("id, name, color")
    .eq("id", memberId)
    .eq("list_id", listId)
    .single();

  if (error || !data) return null;
  return data as Member;
}
