-- Event fields: emoji logo, description, external invite URL, completed flag.
-- Plus a clean-slate truncate (non-backward-compatible reset, by request).
alter table public.dibs_lists add column if not exists emoji       text not null default '🎉';
alter table public.dibs_lists add column if not exists description text;
alter table public.dibs_lists add column if not exists invite_url  text;
alter table public.dibs_lists add column if not exists completed   boolean not null default false;

truncate table public.dibs_lists, public.dibs_members, public.dibs_tasks cascade;
