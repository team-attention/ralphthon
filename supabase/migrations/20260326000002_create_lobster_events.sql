-- Lobster event log for admin timeline
create table public.lobster_events (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  team_name text not null,
  region text not null check (region in ('KR', 'US')),
  created_at timestamptz not null default now()
);

-- Index for fast region+time queries
create index lobster_events_region_created_at on public.lobster_events(region, created_at desc);

-- Enable realtime
alter publication supabase_realtime add table public.lobster_events;

-- RLS: admin can read via service_role, authenticated users can read
alter table public.lobster_events enable row level security;

create policy "Authenticated users can read lobster events"
  on public.lobster_events for select
  to authenticated
  using (true);
