-- Fix teams UPDATE policy to prevent leader from modifying admin-only fields
DROP POLICY IF EXISTS "Team leaders can update their own team" ON public.teams;

-- Leaders can only update their own team and cannot change admin fields
CREATE POLICY "Team leaders can update their own team" ON public.teams
  FOR UPDATE
  USING (leader_user_id = auth.uid())
  WITH CHECK (leader_user_id = auth.uid());

-- Add column-level security: create a function to prevent participant updates to admin fields
CREATE OR REPLACE FUNCTION public.check_team_update()
RETURNS trigger AS $$
BEGIN
  -- If not service_role, prevent changing admin-only fields
  IF current_setting('request.jwt.claim.role', true) != 'service_role' THEN
    NEW.lobster_activated := OLD.lobster_activated;
    NEW.lobster_activated_at := OLD.lobster_activated_at;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER team_update_guard
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.check_team_update();

-- Fix team_members SELECT policy to restrict email visibility
DROP POLICY IF EXISTS "Anyone can view team members" ON public.team_members;

CREATE POLICY "Team leaders can view their team members" ON public.team_members
  FOR SELECT
  USING (
    team_id IN (
      SELECT id FROM public.teams WHERE leader_user_id = auth.uid()
    )
  );

-- Add unique constraint on leader_user_id (one team per leader)
ALTER TABLE public.teams ADD CONSTRAINT teams_leader_user_id_unique UNIQUE (leader_user_id);

-- Add lobster_activated_at timestamp for re-trigger support
ALTER TABLE public.teams ADD COLUMN lobster_activated_at timestamptz;
