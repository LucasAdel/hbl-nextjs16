-- =============================================================================
-- PERFORMANCE FIXES MIGRATION (FULLY IDEMPOTENT)
-- =============================================================================
-- Fixes all Supabase performance linter warnings:
-- 1. Unindexed foreign keys (adds covering indexes only if table exists)
-- 2. 1 table without primary key (legal_documents_backup)
-- =============================================================================

-- =============================================================================
-- FIX 1: Add indexes for all unindexed foreign keys
-- Using dynamic SQL to check table existence before creating index
-- =============================================================================

DO $$
DECLARE
  index_def RECORD;
BEGIN
  -- Define all indexes to create
  FOR index_def IN
    SELECT * FROM (VALUES
      ('ab_experiments', 'goal_id', 'idx_ab_experiments_goal_id'),
      ('admin_notifications', 'form_attempt_id', 'idx_admin_notifications_form_attempt_id'),
      ('annotations', 'resolved_by', 'idx_annotations_resolved_by'),
      ('applications', 'professional_id', 'idx_applications_professional_id'),
      ('audit_log', 'user_id', 'idx_audit_log_user_id'),
      ('blog_post_categories', 'category_id', 'idx_blog_post_categories_category_id'),
      ('blog_post_categories', 'post_id', 'idx_blog_post_categories_post_id'),
      ('blog_post_tags', 'post_id', 'idx_blog_post_tags_post_id'),
      ('blog_post_tags', 'tag_id', 'idx_blog_post_tags_tag_id'),
      ('blog_posts', 'author_id', 'idx_blog_posts_author_id'),
      ('bookings', 'client_id', 'idx_bookings_client_id'),
      ('bookings', 'professional_id', 'idx_bookings_professional_id'),
      ('bookings', 'service_id', 'idx_bookings_service_id'),
      ('chat_sessions', 'user_id', 'idx_chat_sessions_user_id'),
      ('client_groups', 'created_by', 'idx_client_groups_created_by'),
      ('client_invoices', 'client_id', 'idx_client_invoices_client_id'),
      ('client_invoices', 'created_by', 'idx_client_invoices_created_by'),
      ('client_invoices', 'project_id', 'idx_client_invoices_project_id'),
      ('client_portal_documents', 'client_id', 'idx_client_portal_documents_client_id'),
      ('client_projects', 'client_id', 'idx_client_projects_client_id'),
      ('client_projects', 'created_by', 'idx_client_projects_created_by'),
      ('client_tasks', 'assigned_to', 'idx_client_tasks_assigned_to'),
      ('client_tasks', 'client_id', 'idx_client_tasks_client_id'),
      ('client_tasks', 'created_by', 'idx_client_tasks_created_by'),
      ('client_tasks', 'project_id', 'idx_client_tasks_project_id'),
      ('clients', 'assigned_to', 'idx_clients_assigned_to'),
      ('clients', 'created_by', 'idx_clients_created_by'),
      ('clients', 'group_id', 'idx_clients_group_id'),
      ('comments', 'parent_id', 'idx_comments_parent_id'),
      ('comments', 'post_id', 'idx_comments_post_id'),
      ('comments', 'user_id', 'idx_comments_user_id'),
      ('contact_submissions', 'assigned_to', 'idx_contact_submissions_assigned_to'),
      ('document_annotations', 'document_id', 'idx_document_annotations_document_id'),
      ('document_permissions', 'document_id', 'idx_document_permissions_document_id'),
      ('document_permissions', 'granted_by', 'idx_document_permissions_granted_by'),
      ('document_permissions', 'user_id', 'idx_document_permissions_user_id'),
      ('document_versions', 'created_by', 'idx_document_versions_created_by'),
      ('document_versions', 'document_id', 'idx_document_versions_document_id'),
      ('documents', 'folder_id', 'idx_documents_folder_id'),
      ('documents', 'uploaded_by', 'idx_documents_uploaded_by'),
      ('email_sequence_events', 'enrollment_id', 'idx_email_sequence_events_enrollment_id'),
      ('folders', 'created_by', 'idx_folders_created_by'),
      ('folders', 'parent_id', 'idx_folders_parent_id'),
      ('form_field_values', 'attempt_id', 'idx_form_field_values_attempt_id'),
      ('form_field_values', 'field_id', 'idx_form_field_values_field_id'),
      ('form_fields', 'form_id', 'idx_form_fields_form_id'),
      ('gamification_rewards', 'user_id', 'idx_gamification_rewards_user_id'),
      ('knowledge_base_articles', 'author_id', 'idx_knowledge_base_articles_author_id'),
      ('knowledge_base_articles', 'category_id', 'idx_knowledge_base_articles_category_id'),
      ('knowledge_base_articles', 'parent_id', 'idx_knowledge_base_articles_parent_id'),
      ('legal_documents', 'category_id', 'idx_legal_documents_category_id'),
      ('messages', 'chat_session_id', 'idx_messages_chat_session_id'),
      ('notifications', 'user_id', 'idx_notifications_user_id'),
      ('page_views', 'session_id', 'idx_page_views_session_id'),
      ('page_views', 'user_id', 'idx_page_views_user_id'),
      ('professional_availability', 'professional_id', 'idx_professional_availability_professional_id'),
      ('professional_services', 'professional_id', 'idx_professional_services_professional_id'),
      ('progress_tracking', 'user_id', 'idx_progress_tracking_user_id'),
      ('reviews', 'booking_id', 'idx_reviews_booking_id'),
      ('reviews', 'professional_id', 'idx_reviews_professional_id'),
      ('reviews', 'reviewer_id', 'idx_reviews_reviewer_id'),
      ('stripe_customers', 'user_id', 'idx_stripe_customers_user_id'),
      ('user_achievements', 'user_id', 'idx_user_achievements_user_id'),
      ('user_consent_records', 'user_id', 'idx_user_consent_records_user_id'),
      ('user_preferences', 'user_id', 'idx_user_preferences_user_id'),
      ('user_sessions', 'user_id', 'idx_user_sessions_user_id'),
      ('user_streaks', 'user_id', 'idx_user_streaks_user_id')
    ) AS t(table_name, column_name, index_name)
  LOOP
    -- Check if table and column exist
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = index_def.table_name
        AND column_name = index_def.column_name
    ) THEN
      -- Check if index doesn't already exist
      IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public'
          AND indexname = index_def.index_name
      ) THEN
        BEGIN
          EXECUTE format(
            'CREATE INDEX %I ON public.%I(%I)',
            index_def.index_name,
            index_def.table_name,
            index_def.column_name
          );
          RAISE NOTICE 'Created index % on %.%',
            index_def.index_name, index_def.table_name, index_def.column_name;
        EXCEPTION WHEN OTHERS THEN
          RAISE NOTICE 'Could not create index % on %.%: %',
            index_def.index_name, index_def.table_name, index_def.column_name, SQLERRM;
        END;
      ELSE
        RAISE NOTICE 'Index % already exists, skipping', index_def.index_name;
      END IF;
    ELSE
      RAISE NOTICE 'Table %.% does not exist, skipping index %',
        index_def.table_name, index_def.column_name, index_def.index_name;
    END IF;
  END LOOP;
END;
$$;

-- =============================================================================
-- FIX 2: Add primary key to legal_documents_backup table
-- =============================================================================

DO $$
BEGIN
  -- Check if table exists and doesn't have a primary key
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'legal_documents_backup'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
    AND table_name = 'legal_documents_backup'
    AND constraint_type = 'PRIMARY KEY'
  ) THEN
    -- Check if 'id' column exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'legal_documents_backup'
      AND column_name = 'id'
    ) THEN
      -- Add primary key on existing id column
      EXECUTE 'ALTER TABLE public.legal_documents_backup ADD PRIMARY KEY (id)';
      RAISE NOTICE 'Added primary key on id column to legal_documents_backup';
    ELSE
      -- Add id column and make it primary key
      EXECUTE 'ALTER TABLE public.legal_documents_backup ADD COLUMN id UUID DEFAULT gen_random_uuid() PRIMARY KEY';
      RAISE NOTICE 'Added id column with primary key to legal_documents_backup';
    END IF;
  ELSE
    RAISE NOTICE 'legal_documents_backup either does not exist or already has a primary key';
  END IF;
END;
$$;

-- =============================================================================
-- NOTES:
-- =============================================================================
-- 1. All index creation is fully idempotent (checks table/column/index existence)
-- 2. Unused indexes are intentionally NOT removed per standing policy
-- 3. Primary key fix checks for existing id column before adding
-- =============================================================================
