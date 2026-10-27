-- DRAFT: not applied. Needs the owner's sign-off; move it to supabase/migrations/
-- (with a fresh timestamp) to adopt it.
--
-- judging_scores (20260329000001) was opened to everyone "for hackathon judging
-- (temporary)": anyone with the anon key can insert or overwrite any judge's
-- scores. The events are over, so close writes.
--
-- Effect: /judge saves fail with an RLS error (logged to the console only);
-- scores still save to the judge's localStorage, and stored scores stay readable.
-- To reopen for a future event, recreate the two policies or, better, restrict
-- them to authenticated judges.
DROP POLICY IF EXISTS "Anyone can insert judging scores" ON public.judging_scores;
DROP POLICY IF EXISTS "Anyone can update judging scores" ON public.judging_scores;

-- Optional (owner decision): judges' comments are public too. Uncomment to make
-- scores readable only by the service role; /judge then falls back to localStorage.
-- DROP POLICY IF EXISTS "Anyone can read judging scores" ON public.judging_scores;
