// Shared domain types. Mirror the dibs_ schema (supabase/migrations/0001).

export interface Member {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  emoji: string;
  title: string;
  owner_member_id: string | null;
  done: boolean;
  position: string;
  updated_at: string;
}

export interface ListState {
  id: string;
  title: string;
  event_at: string | null;
  shared: boolean;
  members: Member[];
  tasks: Task[];
}

// Broadcast event shape on channel `list:{id}`. `op_id` lets the originating
// client ignore its own echo; `updated_at` lets clients discard stale events.
export type ListEvent =
  | { kind: "task.upserted"; op_id: string; task: Task }
  | { kind: "task.deleted"; op_id: string; task_id: string }
  | { kind: "member.joined"; op_id: string; member: Member };
