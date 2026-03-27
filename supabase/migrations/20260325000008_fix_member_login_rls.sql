-- Fix: allow users to find their own team_members row by email on first login.
-- Without this, RLS blocks the SELECT because user_id is NULL (not yet linked),
-- creating a chicken-and-egg problem where the row can't be found to link it.

CREATE POLICY "Users can find own membership by email"
  ON public.team_members FOR SELECT
  USING (email = auth.jwt()->>'email');

-- Fix: allow users to link their own user_id on first login.
-- Without this, UPDATE is blocked because is_team_member() requires user_id
-- to already be set — the same chicken-and-egg problem as SELECT.
CREATE POLICY "Users can link own user_id by email"
  ON public.team_members FOR UPDATE
  USING (email = auth.jwt()->>'email')
  WITH CHECK (email = auth.jwt()->>'email');
