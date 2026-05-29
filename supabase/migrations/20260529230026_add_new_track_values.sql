-- Expand accepted track values for the Busan guide.
-- Keep legacy values so existing teams remain valid.

ALTER TABLE public.teams DROP CONSTRAINT IF EXISTS teams_track_check;
ALTER TABLE public.teams ADD CONSTRAINT teams_track_check
  CHECK (track IN ('impact', 'harness', 'codex_plugin', 'image_service', 'busan_local', 'ai_application'));
