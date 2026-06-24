-- Short public permalink code for each list (the URL is /l/{code}; internal FKs
-- still use the uuid id). Applied to REDSA via the Management API.
alter table public.dibs_lists add column if not exists code text;
update public.dibs_lists set code = substr(replace(gen_random_uuid()::text, '-', ''), 1, 7) where code is null;
alter table public.dibs_lists alter column code set not null;
create unique index if not exists dibs_lists_code_key on public.dibs_lists (code);
