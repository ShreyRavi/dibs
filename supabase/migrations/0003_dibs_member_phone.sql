-- Stable cross-device identity: a member is keyed by their phone within a list.
-- phone_hash = sha256 of the normalized number (raw number never stored).
-- Partial unique index so device-only members (null phone) don't collide.
alter table public.dibs_members add column if not exists phone_hash text;
create unique index if not exists dibs_members_list_phone_key
  on public.dibs_members (list_id, phone_hash) where phone_hash is not null;
