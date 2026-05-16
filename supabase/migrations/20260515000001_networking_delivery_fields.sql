alter table public.team_members
  add column if not exists discord_user_id text,
  add column if not exists discord_username text,
  add column if not exists discord_linked_at timestamptz,
  add column if not exists networking_delivery_opt_in boolean default true;
