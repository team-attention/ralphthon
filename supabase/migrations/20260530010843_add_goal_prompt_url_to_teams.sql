alter table public.teams
  add column if not exists goal_prompt_url text;
