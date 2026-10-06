-- PrismaStudios private workspace: football teams, rosters and job-player tracking.
-- This mirrors the schema applied to the Supabase project on 2026-10-06.

create table if not exists public.football_teams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  season text not null check (season ~ '^[0-9]{4}/[0-9]{2}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists football_teams_user_name_season_uidx
  on public.football_teams (user_id, lower(name), season);
create index if not exists football_teams_user_id_idx
  on public.football_teams (user_id);
create index if not exists football_teams_season_idx
  on public.football_teams (season);

create table if not exists public.football_players (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  team_id uuid not null references public.football_teams(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  shirt_number integer check (shirt_number is null or (shirt_number >= 0 and shirt_number <= 99)),
  position text,
  phone text,
  email text,
  instagram text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.football_players
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists instagram text,
  add column if not exists notes text;

create index if not exists football_players_user_id_idx
  on public.football_players (user_id);
create index if not exists football_players_team_id_idx
  on public.football_players (team_id);

alter table public.workspace_jobs
  add column if not exists team_id uuid references public.football_teams(id) on delete set null;

create index if not exists workspace_jobs_team_id_idx
  on public.workspace_jobs (team_id);

create table if not exists public.workspace_job_players (
  job_id uuid not null references public.workspace_jobs(id) on delete cascade,
  player_id uuid not null references public.football_players(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (job_id, player_id)
);

create index if not exists workspace_job_players_user_id_idx
  on public.workspace_job_players (user_id);
create index if not exists workspace_job_players_player_id_idx
  on public.workspace_job_players (player_id);

alter table public.football_teams enable row level security;
alter table public.football_players enable row level security;
alter table public.workspace_job_players enable row level security;

revoke all on table public.football_teams from anon;
revoke all on table public.football_players from anon;
revoke all on table public.workspace_job_players from anon;

grant select, insert, update, delete on table public.football_teams to authenticated;
grant select, insert, update, delete on table public.football_players to authenticated;
grant select, insert, update, delete on table public.workspace_job_players to authenticated;

drop policy if exists football_teams_select_own on public.football_teams;
drop policy if exists football_teams_insert_own on public.football_teams;
drop policy if exists football_teams_update_own on public.football_teams;
drop policy if exists football_teams_delete_own on public.football_teams;

create policy football_teams_select_own
on public.football_teams for select
to authenticated
using ((select auth.uid()) = user_id);

create policy football_teams_insert_own
on public.football_teams for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy football_teams_update_own
on public.football_teams for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy football_teams_delete_own
on public.football_teams for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists football_players_select_own on public.football_players;
drop policy if exists football_players_insert_own on public.football_players;
drop policy if exists football_players_update_own on public.football_players;
drop policy if exists football_players_delete_own on public.football_players;

create policy football_players_select_own
on public.football_players for select
to authenticated
using ((select auth.uid()) = user_id);

create policy football_players_insert_own
on public.football_players for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.football_teams t
    where t.id = team_id and t.user_id = (select auth.uid())
  )
);

create policy football_players_update_own
on public.football_players for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.football_teams t
    where t.id = team_id and t.user_id = (select auth.uid())
  )
);

create policy football_players_delete_own
on public.football_players for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists workspace_job_players_select_own on public.workspace_job_players;
drop policy if exists workspace_job_players_insert_own on public.workspace_job_players;
drop policy if exists workspace_job_players_delete_own on public.workspace_job_players;

create policy workspace_job_players_select_own
on public.workspace_job_players for select
to authenticated
using ((select auth.uid()) = user_id);

create policy workspace_job_players_insert_own
on public.workspace_job_players for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.workspace_jobs j
    where j.id = job_id and j.user_id = (select auth.uid())
  )
  and exists (
    select 1
    from public.football_players p
    where p.id = player_id and p.user_id = (select auth.uid())
  )
);

create policy workspace_job_players_delete_own
on public.workspace_job_players for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists workspace_jobs_select_own on public.workspace_jobs;
drop policy if exists workspace_jobs_insert_own on public.workspace_jobs;
drop policy if exists workspace_jobs_update_own on public.workspace_jobs;
drop policy if exists workspace_jobs_delete_own on public.workspace_jobs;

create policy workspace_jobs_select_own
on public.workspace_jobs for select
to authenticated
using ((select auth.uid()) = user_id);

create policy workspace_jobs_insert_own
on public.workspace_jobs for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy workspace_jobs_update_own
on public.workspace_jobs for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy workspace_jobs_delete_own
on public.workspace_jobs for delete
to authenticated
using ((select auth.uid()) = user_id);
