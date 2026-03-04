-- ============================================================
-- BULLETPROOF FIX FOR INFINITE RECURSION
-- ============================================================

-- 1. Drop ALL existing policies on user_roles to start fresh
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage roles" ON public.user_roles;

-- 2. Create ONE simple, non-recursive policy that just lets the user see their own role
CREATE POLICY "Users can read own roles" ON public.user_roles 
    FOR SELECT 
    TO authenticated
    USING (user_id = auth.uid());

-- 3. (Optional) If you want admins to edit roles later, do it from the Supabase Dashboard UI instead of SQL, 
-- or create a separate table/function. 
-- For now, this completely removes the recursion loop.
