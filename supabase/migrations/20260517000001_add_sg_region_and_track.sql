-- Add 'SG' region and 'track' field for Singapore hackathon

-- 1. Update region check constraint on teams
ALTER TABLE public.teams DROP CONSTRAINT IF EXISTS teams_region_check;
ALTER TABLE public.teams ADD CONSTRAINT teams_region_check CHECK (region IN ('KR', 'US', 'SG'));

-- 2. Update region check constraint on lobster_events
ALTER TABLE public.lobster_events DROP CONSTRAINT IF EXISTS lobster_events_region_check;
ALTER TABLE public.lobster_events ADD CONSTRAINT lobster_events_region_check CHECK (region IN ('KR', 'US', 'SG'));

-- 3. Add track column to teams
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS track text CHECK (track IN ('impact', 'harness'));
