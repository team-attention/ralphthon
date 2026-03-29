-- Judging scores table for hackathon judging
create table public.judging_scores (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade not null,
  judge_name text not null,
  score_creativity integer check (score_creativity >= 0 and score_creativity <= 10),
  score_technical integer check (score_technical >= 0 and score_technical <= 10),
  score_impact integer check (score_impact >= 0 and score_impact <= 10),
  score_presentation integer check (score_presentation >= 0 and score_presentation <= 10),
  comment text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(team_id, judge_name)
);

-- Open RLS for hackathon judging (temporary)
alter table public.judging_scores enable row level security;

create policy "Anyone can read judging scores"
  on public.judging_scores for select
  using (true);

create policy "Anyone can insert judging scores"
  on public.judging_scores for insert
  with check (true);

create policy "Anyone can update judging scores"
  on public.judging_scores for update
  using (true);
