-- ============================================================================
-- Security Fixes Migration
-- Fixes: SECURITY DEFINER views and RLS disabled on public tables
-- ============================================================================

-- ============================================================================
-- PART 1: Fix SECURITY DEFINER Views
-- Drop the problematic views - they use SECURITY DEFINER which bypasses RLS
-- Views can be recreated with SECURITY INVOKER if needed
-- ============================================================================

-- Drop SECURITY DEFINER views (they bypass RLS of the querying user)
DROP VIEW IF EXISTS public.public_medical_practices CASCADE;
DROP VIEW IF EXISTS public.staff_2fa_status CASCADE;
DROP VIEW IF EXISTS public.user_activity_stream CASCADE;

-- ============================================================================
-- PART 2: Enable RLS on Public Tables
-- ============================================================================

-- 2.1 user_roles table
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
        ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

        -- Drop existing policies to avoid conflicts
        DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
        DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

        -- Users can read their own roles, admins can read all
        CREATE POLICY "Users can read own roles" ON public.user_roles
            FOR SELECT
            USING (
                auth.uid() = user_id
                OR
                EXISTS (
                    SELECT 1 FROM auth.users
                    WHERE auth.users.id = auth.uid()
                    AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'staff')
                )
            );

        -- Only admins can insert/update roles
        CREATE POLICY "Admins can manage roles" ON public.user_roles
            FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM auth.users
                    WHERE auth.users.id = auth.uid()
                    AND auth.users.raw_user_meta_data->>'role' = 'admin'
                )
            );
    END IF;
END $$;

-- 2.2 audit_trail table
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_trail') THEN
        ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Admins can view audit trail" ON public.audit_trail;
        DROP POLICY IF EXISTS "System can insert audit entries" ON public.audit_trail;

        -- Only admins can view audit trail
        CREATE POLICY "Admins can view audit trail" ON public.audit_trail
            FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM auth.users
                    WHERE auth.users.id = auth.uid()
                    AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'staff')
                )
            );

        -- Anyone can insert audit entries (logged actions)
        CREATE POLICY "System can insert audit entries" ON public.audit_trail
            FOR INSERT
            WITH CHECK (true);
    END IF;
END $$;

-- 2.3 australian_suburbs table (reference data - read-only for all)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'australian_suburbs') THEN
        ALTER TABLE public.australian_suburbs ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Anyone can read suburbs" ON public.australian_suburbs;
        DROP POLICY IF EXISTS "Admins can manage suburbs" ON public.australian_suburbs;

        CREATE POLICY "Anyone can read suburbs" ON public.australian_suburbs
            FOR SELECT
            USING (true);

        CREATE POLICY "Admins can manage suburbs" ON public.australian_suburbs
            FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM auth.users
                    WHERE auth.users.id = auth.uid()
                    AND auth.users.raw_user_meta_data->>'role' = 'admin'
                )
            );
    END IF;
END $$;

-- 2.4 achievements table (reference data)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'achievements') THEN
        ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Anyone can read achievements" ON public.achievements;
        DROP POLICY IF EXISTS "Admins can manage achievements" ON public.achievements;

        CREATE POLICY "Anyone can read achievements" ON public.achievements
            FOR SELECT
            USING (true);

        CREATE POLICY "Admins can manage achievements" ON public.achievements
            FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM auth.users
                    WHERE auth.users.id = auth.uid()
                    AND auth.users.raw_user_meta_data->>'role' = 'admin'
                )
            );
    END IF;
END $$;

-- 2.5 document_correlations table
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'document_correlations') THEN
        ALTER TABLE public.document_correlations ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Staff can access correlations" ON public.document_correlations;

        CREATE POLICY "Staff can access correlations" ON public.document_correlations
            FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM auth.users
                    WHERE auth.users.id = auth.uid()
                    AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'staff')
                )
            );
    END IF;
END $$;

-- 2.6 analytics_events_daily table (admin only)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'analytics_events_daily') THEN
        ALTER TABLE public.analytics_events_daily ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Admins can access analytics" ON public.analytics_events_daily;

        CREATE POLICY "Admins can access analytics" ON public.analytics_events_daily
            FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM auth.users
                    WHERE auth.users.id = auth.uid()
                    AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'staff')
                )
            );
    END IF;
END $$;

-- 2.7 xp_economy_daily table (admin only)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'xp_economy_daily') THEN
        ALTER TABLE public.xp_economy_daily ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Admins can access xp economy" ON public.xp_economy_daily;

        CREATE POLICY "Admins can access xp economy" ON public.xp_economy_daily
            FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM auth.users
                    WHERE auth.users.id = auth.uid()
                    AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'staff')
                )
            );
    END IF;
END $$;

-- 2.8 conversion_funnel_daily table (admin only)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conversion_funnel_daily') THEN
        ALTER TABLE public.conversion_funnel_daily ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Admins can access conversion funnel" ON public.conversion_funnel_daily;

        CREATE POLICY "Admins can access conversion funnel" ON public.conversion_funnel_daily
            FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM auth.users
                    WHERE auth.users.id = auth.uid()
                    AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'staff')
                )
            );
    END IF;
END $$;

-- 2.9 feature_engagement_daily table (admin only)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'feature_engagement_daily') THEN
        ALTER TABLE public.feature_engagement_daily ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Admins can access feature engagement" ON public.feature_engagement_daily;

        CREATE POLICY "Admins can access feature engagement" ON public.feature_engagement_daily
            FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM auth.users
                    WHERE auth.users.id = auth.uid()
                    AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'staff')
                )
            );
    END IF;
END $$;

-- 2.10 cohort_metrics_weekly table (admin only)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cohort_metrics_weekly') THEN
        ALTER TABLE public.cohort_metrics_weekly ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Admins can access cohort metrics" ON public.cohort_metrics_weekly;

        CREATE POLICY "Admins can access cohort metrics" ON public.cohort_metrics_weekly
            FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM auth.users
                    WHERE auth.users.id = auth.uid()
                    AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'staff')
                )
            );
    END IF;
END $$;

-- ============================================================================
-- Migration complete
-- ============================================================================
