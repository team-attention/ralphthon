-- Add a dedicated Busan event region without touching existing rows.

ALTER TABLE public.teams DROP CONSTRAINT IF EXISTS teams_region_check;
ALTER TABLE public.teams ADD CONSTRAINT teams_region_check CHECK (region IN ('KR', 'US', 'SG', 'BUSAN'));

ALTER TABLE public.lobster_events DROP CONSTRAINT IF EXISTS lobster_events_region_check;
ALTER TABLE public.lobster_events ADD CONSTRAINT lobster_events_region_check CHECK (region IN ('KR', 'US', 'SG', 'BUSAN'));
