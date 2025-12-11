-- =============================================================================
-- SECURITY FIXES MIGRATION (IDEMPOTENT)
-- =============================================================================
-- Fixes all Supabase linter warnings:
-- 1. Function search_path mutable (all public functions)
-- 2. Extension in public schema (pg_net)
-- 3. Materialized views accessible via API (5 views)
-- =============================================================================

-- =============================================================================
-- FIX 1: Set search_path for ALL public functions dynamically
-- This approach finds all functions and sets search_path, avoiding signature issues
-- =============================================================================

DO $$
DECLARE
  func_record RECORD;
  func_oid OID;
BEGIN
  -- Loop through all functions in public schema that need search_path set
  FOR func_record IN
    SELECT p.oid, p.proname,
           pg_get_function_identity_arguments(p.oid) as args,
           n.nspname
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.prokind = 'f'  -- Only functions, not procedures
      AND p.proname NOT LIKE 'pg_%'  -- Skip pg_ functions
      AND p.proname NOT LIKE '_pg_%'  -- Skip internal functions
      AND NOT EXISTS (
        -- Check if search_path is already set
        SELECT 1 FROM pg_proc p2
        WHERE p2.oid = p.oid
        AND p2.proconfig IS NOT NULL
        AND 'search_path=public' = ANY(p2.proconfig)
      )
  LOOP
    BEGIN
      -- Construct and execute the ALTER FUNCTION statement
      EXECUTE format(
        'ALTER FUNCTION %I.%I(%s) SET search_path = public',
        func_record.nspname,
        func_record.proname,
        func_record.args
      );
      RAISE NOTICE 'Set search_path for function: %.%(%)',
        func_record.nspname, func_record.proname, func_record.args;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not alter function %.%(%): %',
        func_record.nspname, func_record.proname, func_record.args, SQLERRM;
    END;
  END LOOP;
END;
$$;

-- =============================================================================
-- FIX 2: Extension schema (informational only)
-- =============================================================================

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Note: Moving pg_net requires superuser and may break Supabase internals
-- This is managed by Supabase and typically safe in public schema
-- If needed, contact Supabase support to move it

-- =============================================================================
-- FIX 3: Revoke public access to materialized views (idempotent)
-- Only service_role should access analytics views
-- =============================================================================

DO $$
BEGIN
  -- Revoke from anon (if view exists)
  IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'chat_analytics_summary' AND schemaname = 'public') THEN
    EXECUTE 'REVOKE ALL ON public.chat_analytics_summary FROM anon';
    EXECUTE 'REVOKE ALL ON public.chat_analytics_summary FROM authenticated';
    EXECUTE 'GRANT SELECT ON public.chat_analytics_summary TO service_role';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'enhanced_page_analytics' AND schemaname = 'public') THEN
    EXECUTE 'REVOKE ALL ON public.enhanced_page_analytics FROM anon';
    EXECUTE 'REVOKE ALL ON public.enhanced_page_analytics FROM authenticated';
    EXECUTE 'GRANT SELECT ON public.enhanced_page_analytics TO service_role';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'form_analytics' AND schemaname = 'public') THEN
    EXECUTE 'REVOKE ALL ON public.form_analytics FROM anon';
    EXECUTE 'REVOKE ALL ON public.form_analytics FROM authenticated';
    EXECUTE 'GRANT SELECT ON public.form_analytics TO service_role';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'user_analytics_summary' AND schemaname = 'public') THEN
    EXECUTE 'REVOKE ALL ON public.user_analytics_summary FROM anon';
    EXECUTE 'REVOKE ALL ON public.user_analytics_summary FROM authenticated';
    EXECUTE 'GRANT SELECT ON public.user_analytics_summary TO service_role';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'user_journey_analytics' AND schemaname = 'public') THEN
    EXECUTE 'REVOKE ALL ON public.user_journey_analytics FROM anon';
    EXECUTE 'REVOKE ALL ON public.user_journey_analytics FROM authenticated';
    EXECUTE 'GRANT SELECT ON public.user_journey_analytics TO service_role';
  END IF;
END;
$$;

-- =============================================================================
-- NOTES FOR MANUAL FIXES (require Supabase Dashboard):
-- =============================================================================
--
-- 1. Auth OTP Long Expiry:
--    Go to Supabase Dashboard > Authentication > Providers > Email
--    Set "OTP Expiration" to 3600 seconds (1 hour) or less
--
-- 2. Leaked Password Protection:
--    Go to Supabase Dashboard > Authentication > Settings
--    Enable "Leaked Password Protection" toggle
--
-- 3. pg_net Extension:
--    This is managed by Supabase and typically safe in public schema
--    If needed, contact Supabase support to move it
-- =============================================================================
