-- Enterprise RLS Hardening
-- Purpose:
--   1. Enable Row Level Security on every current public table.
--   2. Keep backend service-role routes working while blocking accidental anon access.
--   3. Add narrow policies for public catalog reads, authenticated own-row reads, and admin operations.
--
-- Safe to run multiple times.
-- Run from Supabase SQL Editor or:
--   psql "$DATABASE_URL" -f scripts/migrations/005_enable_rls_public_tables.sql

BEGIN;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role::text
    FROM public.users
    WHERE id::text = auth.uid()::text
    LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.current_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;

CREATE OR REPLACE FUNCTION pg_temp.has_public_table(p_table TEXT)
RETURNS BOOLEAN
LANGUAGE sql
AS $$
    SELECT to_regclass(format('public.%I', p_table)) IS NOT NULL
$$;

CREATE OR REPLACE FUNCTION pg_temp.has_public_column(p_table TEXT, p_column TEXT)
RETURNS BOOLEAN
LANGUAGE sql
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = p_table
          AND column_name = p_column
    )
$$;

CREATE OR REPLACE FUNCTION pg_temp.ensure_policy(p_table TEXT, p_policy TEXT, p_command TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT pg_temp.has_public_table(p_table) THEN
        RETURN;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = p_table
          AND policyname = p_policy
    ) THEN
        EXECUTE p_command;
    END IF;
END;
$$;

-- Supabase warnings are triggered when public tables have RLS disabled.
DO $$
DECLARE
    target_table RECORD;
BEGIN
    FOR target_table IN
        SELECT n.nspname AS schema_name, c.relname AS table_name
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relkind IN ('r', 'p')
          AND c.relrowsecurity = FALSE
    LOOP
        EXECUTE format(
            'ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',
            target_table.schema_name,
            target_table.table_name
        );
    END LOOP;
END $$;

-- Admins can manage all public tables through authenticated Supabase clients.
-- Backend service-role clients bypass RLS and do not need policies.
DO $$
DECLARE
    target_table RECORD;
    policy_name TEXT;
BEGIN
    FOR target_table IN
        SELECT n.nspname AS schema_name, c.relname AS table_name
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relkind IN ('r', 'p')
    LOOP
        policy_name := 'admin_manage_' || target_table.table_name;
        IF NOT EXISTS (
            SELECT 1
            FROM pg_policies
            WHERE schemaname = 'public'
              AND tablename = target_table.table_name
              AND policyname = policy_name
        ) THEN
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.current_user_role() = %L) WITH CHECK (public.current_user_role() = %L)',
                policy_name,
                target_table.table_name,
                'admin',
                'admin'
            );
        END IF;
    END LOOP;
END $$;

-- Non-sensitive public catalog/SEO surfaces.
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY ARRAY[
        'subjects',
        'chapters',
        'topics',
        'questions',
        'ncert_books',
        'ncert_content',
        'seo_pages'
    ]
    LOOP
        PERFORM pg_temp.ensure_policy(
            table_name,
            'public_read_catalog',
            format(
                'CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (true)',
                'public_read_catalog',
                table_name
            )
        );
    END LOOP;
END $$;

-- Own profile.
SELECT pg_temp.ensure_policy(
    'users',
    'users_read_own_profile',
    'CREATE POLICY "users_read_own_profile" ON public.users FOR SELECT TO authenticated USING (auth.uid()::text = id::text)'
);

SELECT pg_temp.ensure_policy(
    'users',
    'users_update_own_profile',
    'CREATE POLICY "users_update_own_profile" ON public.users FOR UPDATE TO authenticated USING (auth.uid()::text = id::text) WITH CHECK (auth.uid()::text = id::text)'
);

-- Standard own-row read policies for user-owned tables.
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY ARRAY[
        'payments',
        'payment_events',
        'payment_timeline',
        'subscriptions',
        'tests',
        'user_performance',
        'study_plans',
        'doubt_conversations',
        'doubt_messages',
        'user_achievements',
        'user_chapter_progress',
        'battle_elo',
        'question_reports',
        'user_usage',
        'user_topic_mastery',
        'revision_schedule',
        'mistake_log',
        'test_attempts',
        'user_sessions',
        'weekly_parent_reports',
        'parent_report_logs',
        'user_devices'
    ]
    LOOP
        IF pg_temp.has_public_column(table_name, 'user_id') THEN
            PERFORM pg_temp.ensure_policy(
                table_name,
                table_name || '_read_own_user_rows',
                format(
                    'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (auth.uid()::text = user_id::text)',
                    table_name || '_read_own_user_rows',
                    table_name
                )
            );
        END IF;
    END LOOP;
END $$;

-- Test answers are owned through their parent test.
DO $$
BEGIN
    IF pg_temp.has_public_table('test_answers')
       AND pg_temp.has_public_column('test_answers', 'test_id')
       AND pg_temp.has_public_table('tests') THEN
        PERFORM pg_temp.ensure_policy(
            'test_answers',
            'test_answers_read_own_test_rows',
            'CREATE POLICY "test_answers_read_own_test_rows" ON public.test_answers FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.tests t WHERE t.id::text = test_id::text AND t.user_id::text = auth.uid()::text))'
        );
    END IF;
END $$;

-- Classroom access: teachers manage their classroom, students read their own memberships.
DO $$
BEGIN
    IF pg_temp.has_public_table('classrooms') AND pg_temp.has_public_column('classrooms', 'teacher_id') THEN
        PERFORM pg_temp.ensure_policy(
            'classrooms',
            'teachers_read_own_classrooms',
            'CREATE POLICY "teachers_read_own_classrooms" ON public.classrooms FOR SELECT TO authenticated USING (auth.uid()::text = teacher_id::text)'
        );
        PERFORM pg_temp.ensure_policy(
            'classrooms',
            'teachers_insert_own_classrooms',
            'CREATE POLICY "teachers_insert_own_classrooms" ON public.classrooms FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = teacher_id::text)'
        );
        PERFORM pg_temp.ensure_policy(
            'classrooms',
            'teachers_update_own_classrooms',
            'CREATE POLICY "teachers_update_own_classrooms" ON public.classrooms FOR UPDATE TO authenticated USING (auth.uid()::text = teacher_id::text) WITH CHECK (auth.uid()::text = teacher_id::text)'
        );
    END IF;

    IF pg_temp.has_public_table('classroom_students') AND pg_temp.has_public_column('classroom_students', 'student_id') THEN
        PERFORM pg_temp.ensure_policy(
            'classroom_students',
            'students_read_own_classroom_memberships',
            'CREATE POLICY "students_read_own_classroom_memberships" ON public.classroom_students FOR SELECT TO authenticated USING (auth.uid()::text = student_id::text)'
        );
    END IF;
END $$;

-- Device registry may be called from authenticated clients/native shell.
DO $$
BEGIN
    IF pg_temp.has_public_table('user_devices') AND pg_temp.has_public_column('user_devices', 'user_id') THEN
        PERFORM pg_temp.ensure_policy(
            'user_devices',
            'users_insert_own_devices',
            'CREATE POLICY "users_insert_own_devices" ON public.user_devices FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id::text)'
        );
        PERFORM pg_temp.ensure_policy(
            'user_devices',
            'users_update_own_devices',
            'CREATE POLICY "users_update_own_devices" ON public.user_devices FOR UPDATE TO authenticated USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text)'
        );
    END IF;
END $$;

COMMIT;

-- Verification query. It must return zero rows after this migration.
SELECT
    n.nspname AS schema_name,
    c.relname AS table_name
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind IN ('r', 'p')
  AND c.relrowsecurity = FALSE
ORDER BY c.relname;
