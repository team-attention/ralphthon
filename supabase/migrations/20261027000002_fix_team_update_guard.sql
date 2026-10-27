-- check_team_update (trigger team_update_guard, 20260325000002) read the legacy
-- request.jwt.claim.role setting, which current PostgREST no longer sets. The
-- comparison was NULL, so the guard never ran and team leaders could set the
-- admin-only lobster fields directly. auth.role() reads request.jwt.claims (and
-- the legacy setting as a fallback).
--
-- Guard only API requests made with the anon or authenticated role. The service
-- role (admin routes, activate_lobster) and direct SQL sessions without JWT
-- claims keep full access. lobster_count (added in 20260325000004) is admin-only
-- too and is now protected as well.
CREATE OR REPLACE FUNCTION public.check_team_update()
RETURNS trigger AS $$
BEGIN
  IF coalesce(auth.role(), '') IN ('anon', 'authenticated') THEN
    NEW.lobster_activated := OLD.lobster_activated;
    NEW.lobster_activated_at := OLD.lobster_activated_at;
    NEW.lobster_count := OLD.lobster_count;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
