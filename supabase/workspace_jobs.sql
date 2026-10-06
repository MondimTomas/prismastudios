create table if not exists public.workspace_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  business_line text not null check (business_line in ('futebol', 'conteudo', 'redes-sociais', 'eventos')),
  client_name text not null,
  title text not null,
  service_type text,
  job_date date not null,
  status text not null default 'completed' check (status in ('completed', 'in_progress', 'scheduled', 'cancelled')),
  revenue numeric(10,2) not null default 0 check (revenue >= 0),
  costs numeric(10,2) not null default 0 check (costs >= 0),
  payment_status text not null default 'paid' check (payment_status in ('paid', 'partial', 'unpaid')),
  source text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.workspace_jobs enable row level security;

create policy "workspace_jobs_select_own"
on public.workspace_jobs
for select
using (auth.uid() = user_id);

create policy "workspace_jobs_insert_own"
on public.workspace_jobs
for insert
with check (auth.uid() = user_id);

create policy "workspace_jobs_update_own"
on public.workspace_jobs
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "workspace_jobs_delete_own"
on public.workspace_jobs
for delete
using (auth.uid() = user_id);

create index if not exists workspace_jobs_user_date_idx
on public.workspace_jobs (user_id, job_date desc);

create index if not exists workspace_jobs_user_line_idx
on public.workspace_jobs (user_id, business_line);
