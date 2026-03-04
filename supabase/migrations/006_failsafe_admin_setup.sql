-- ============================================================
-- FAIL-SAFE ADMIN ROLE SETUP 
-- (Use this if the previous SQL gave an ON CONFLICT error)
-- ============================================================

-- 1. First, delete any existing roles for this email to avoid duplicates
DELETE FROM public.user_roles 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'jkharry04@gmail.com');

-- 2. Then, insert the super_admin role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin' FROM auth.users WHERE email = 'jkharry04@gmail.com';

-- 3. (Optional) Fix the table structure for the future
ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;

ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);
