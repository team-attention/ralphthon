-- Teams table
create table public.teams (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  region text not null check (region in ('KR', 'US')),
  leader_email text not null,
  leader_user_id uuid references auth.users(id),
  project_desc text,
  github_url text,
  demo_video_url text,
  lobster_requested boolean default false,
  lobster_activated boolean default false,
  created_at timestamptz default now()
);

-- Team members table
create table public.team_members (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references public.teams(id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('leader', 'member')),
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.teams enable row level security;
alter table public.team_members enable row level security;

-- RLS Policies for teams
-- Anyone can view all teams (for public team pages and admin dashboard)
create policy "Anyone can view teams"
  on public.teams for select
  using (true);

-- Team leaders can insert their own team
create policy "Team leaders can insert their team"
  on public.teams for insert
  with check (leader_user_id = auth.uid());

-- Team leaders can update their own team
create policy "Team leaders can update their own team"
  on public.teams for update
  using (leader_user_id = auth.uid());

-- RLS Policies for team_members
-- Anyone can view team members
create policy "Anyone can view team members"
  on public.team_members for select
  using (true);

-- Team leaders can manage their team members
create policy "Team leaders can manage their team members"
  on public.team_members for insert
  with check (
    team_id in (
      select id from public.teams where leader_user_id = auth.uid()
    )
  );

create policy "Team leaders can update their team members"
  on public.team_members for update
  using (
    team_id in (
      select id from public.teams where leader_user_id = auth.uid()
    )
  );

create policy "Team leaders can delete their team members"
  on public.team_members for delete
  using (
    team_id in (
      select id from public.teams where leader_user_id = auth.uid()
    )
  );

-- Enable Realtime for teams table (for lobster visual effect)
alter publication supabase_realtime add table public.teams;
