-- Fix: allow users to link their own user_id on first login.
-- Without this, UPDATE is blocked because is_team_member() requires user_id
-- to already be set — the same chicken-and-egg problem as SELECT.
CREATE POLICY "Users can link own user_id by email"
  ON public.team_members FOR UPDATE
  USING (email = auth.jwt()->>'email')
  WITH CHECK (email = auth.jwt()->>'email');
