-- activate_lobster is SECURITY DEFINER, and new functions are executable by
-- PUBLIC (plus Supabase's default grants to anon and authenticated), so anyone
-- could call /rest/v1/rpc/activate_lobster and skip the ADMIN_EMAILS check in
-- POST /api/admin/lobster. Only the service role (that route) may call it.
REVOKE EXECUTE ON FUNCTION public.activate_lobster(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.activate_lobster(uuid) TO service_role;

-- The body only uses schema-qualified names, so pin search_path for the definer.
ALTER FUNCTION public.activate_lobster(uuid) SET search_path = '';
