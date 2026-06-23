"use client";

import { useEffect, useRef } from "react";
import { supabaseBrowser } from "./supabaseBrowser";
import type { ListEvent } from "./types";

// Subscribe to Broadcast channel `list:{id}`. Calls `onEvent` for each change.
// The caller is responsible for: ignoring its own echo (match op_id), discarding
// stale events (compare updated_at), and resyncing via GET state on (re)connect.
export function useListChannel(
  listId: string,
  onEvent: (e: ListEvent) => void,
  onReconnect?: () => void,
) {
  const cb = useRef(onEvent);
  cb.current = onEvent;
  const rc = useRef(onReconnect);
  rc.current = onReconnect;

  useEffect(() => {
    const sb = supabaseBrowser();
    const channel = sb
      .channel(`list:${listId}`, { config: { broadcast: { self: true } } })
      .on("broadcast", { event: "change" }, (msg) => {
        cb.current(msg.payload as ListEvent);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") rc.current?.();
      });

    return () => {
      sb.removeChannel(channel);
    };
  }, [listId]);
}
