-- Add lobster_count to track how many times lobster has been activated
ALTER TABLE public.teams ADD COLUMN lobster_count integer DEFAULT 0 NOT NULL;

-- Atomic function to activate lobster + increment count
CREATE OR REPLACE FUNCTION public.activate_lobster(team_id_input uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.teams
  SET
    lobster_activated = true,
    lobster_activated_at = now(),
    lobster_requested = false,
    lobster_count = lobster_count + 1
  WHERE id = team_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
