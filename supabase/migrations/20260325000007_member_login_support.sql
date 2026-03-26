-- Add user_id to team_members so members can log in and be linked to their team
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Index for fast lookup by user_id
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
-- Index for fast lookup by email (used during login to match member)
CREATE INDEX IF NOT EXISTS idx_team_members_email ON public.team_members(email);

-- Helper function: check if current user belongs to a team (as leader OR member)
CREATE OR REPLACE FUNCTION public.is_team_member(tid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.teams WHERE id = tid AND leader_user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.team_members WHERE team_id = tid AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

----------------------------------------------------------------------
-- UPDATE RLS: teams — members can also update their team
----------------------------------------------------------------------
DROP POLICY IF EXISTS "Team leaders can update their own team" ON public.teams;
DROP POLICY IF EXISTS "Team members can update their team" ON public.teams;

CREATE POLICY "Team members can update their team" ON public.teams
  FOR UPDATE
  USING (public.is_team_member(id))
  WITH CHECK (public.is_team_member(id));

----------------------------------------------------------------------
-- UPDATE RLS: team_members — members can also view/manage members
----------------------------------------------------------------------
DROP POLICY IF EXISTS "Team leaders can view their team members" ON public.team_members;
DROP POLICY IF EXISTS "Team members can view their team members" ON public.team_members;

CREATE POLICY "Team members can view their team members" ON public.team_members
  FOR SELECT
  USING (public.is_team_member(team_id));

DROP POLICY IF EXISTS "Team leaders can manage their team members" ON public.team_members;
DROP POLICY IF EXISTS "Team members can insert team members" ON public.team_members;

CREATE POLICY "Team members can insert team members" ON public.team_members
  FOR INSERT
  WITH CHECK (public.is_team_member(team_id));

DROP POLICY IF EXISTS "Team leaders can update their team members" ON public.team_members;
DROP POLICY IF EXISTS "Team members can update team members" ON public.team_members;

CREATE POLICY "Team members can update team members" ON public.team_members
  FOR UPDATE
  USING (public.is_team_member(team_id));

DROP POLICY IF EXISTS "Team leaders can delete their team members" ON public.team_members;
DROP POLICY IF EXISTS "Team members can delete team members" ON public.team_members;

CREATE POLICY "Team members can delete team members" ON public.team_members
  FOR DELETE
  USING (public.is_team_member(team_id));
