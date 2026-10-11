-- Anonymous football feedback.
-- Live schema was applied through Supabase SQL and is kept here for repository reference.

create schema if not exists private;

create table if not exists public.workspace_football_feedback_forms (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null unique references public.workspace_jobs(id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_football_feedback (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.workspace_jobs(id) on delete cascade,
  device_hash text,
  score smallint not null check (score between 0 and 10),
  liked text,
  disliked text,
  created_at timestamptz not null default now(),
  constraint workspace_football_feedback_liked_length
    check (liked is null or char_length(liked) <= 1500),
  constraint workspace_football_feedback_disliked_length
    check (disliked is null or char_length(disliked) <= 1500)
);

create index if not exists workspace_football_feedback_job_id_idx
  on public.workspace_football_feedback(job_id);

create unique index if not exists workspace_football_feedback_job_device_uidx
  on public.workspace_football_feedback(job_id, device_hash)
  where device_hash is not null;

alter table public.workspace_football_feedback_forms enable row level security;
alter table public.workspace_football_feedback enable row level security;

drop policy if exists "football_feedback_forms_owner_select"
  on public.workspace_football_feedback_forms;
create policy "football_feedback_forms_owner_select"
on public.workspace_football_feedback_forms
for select
to authenticated
using (
  exists (
    select 1
    from public.workspace_jobs j
    where j.id = workspace_football_feedback_forms.job_id
      and j.user_id = (select auth.uid())
  )
);

drop policy if exists "football_feedback_owner_select"
  on public.workspace_football_feedback;
create policy "football_feedback_owner_select"
on public.workspace_football_feedback
for select
to authenticated
using (
  exists (
    select 1
    from public.workspace_jobs j
    where j.id = workspace_football_feedback.job_id
      and j.user_id = (select auth.uid())
  )
);

drop policy if exists "football_feedback_assigned_collaborator_select"
  on public.workspace_football_feedback;
create policy "football_feedback_assigned_collaborator_select"
on public.workspace_football_feedback
for select
to authenticated
using (
  exists (
    select 1
    from public.collaborator_assignments ca
    where ca.job_id = workspace_football_feedback.job_id
      and ca.collaborator_user_id = (select auth.uid())
      and ca.status not in ('cancelled', 'declined')
  )
);

drop policy if exists "football_feedback_owner_delete"
  on public.workspace_football_feedback;
create policy "football_feedback_owner_delete"
on public.workspace_football_feedback
for delete
to authenticated
using (
  exists (
    select 1
    from public.workspace_jobs j
    where j.id = workspace_football_feedback.job_id
      and j.user_id = (select auth.uid())
  )
);

revoke all on public.workspace_football_feedback_forms from anon;
revoke all on public.workspace_football_feedback from anon;
grant select on public.workspace_football_feedback_forms to authenticated;
grant select, delete on public.workspace_football_feedback to authenticated;

create or replace function private.ensure_football_feedback_form()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.business_line = 'futebol' then
    insert into public.workspace_football_feedback_forms (job_id)
    values (new.id)
    on conflict (job_id) do nothing;
  end if;

  return new;
end;
$$;

revoke all on function private.ensure_football_feedback_form()
  from public, anon, authenticated;

drop trigger if exists workspace_jobs_ensure_football_feedback_form
  on public.workspace_jobs;
create trigger workspace_jobs_ensure_football_feedback_form
after insert or update of business_line
on public.workspace_jobs
for each row
execute function private.ensure_football_feedback_form();

insert into public.workspace_football_feedback_forms (job_id)
select j.id
from public.workspace_jobs j
where j.business_line = 'futebol'
on conflict (job_id) do nothing;
