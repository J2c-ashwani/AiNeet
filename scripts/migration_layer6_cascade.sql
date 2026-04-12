-- migration_layer6_cascade.sql
-- Enforces 'Right to be Forgotten' by ensuring all child data is deleted when a user is deleted.

DO $$ 
DECLARE
    row record;
BEGIN
    FOR row IN 
        SELECT 
            tc.table_name, 
            kcu.column_name, 
            tc.constraint_name
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
        WHERE constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'users'
    LOOP
        EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT %I', row.table_name, row.constraint_name);
        EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES public.users(id) ON DELETE CASCADE', row.table_name, row.constraint_name, row.column_name);
    END LOOP;
END $$;
