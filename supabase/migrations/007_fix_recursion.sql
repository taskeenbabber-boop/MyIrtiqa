-- ============================================================
-- FIX "INFINITE RECURSION" IN USER ROLES POLICY
-- ============================================================

-- First, drop the recursive policy
DROP POLICY IF EXISTS "Super admins can manage roles" ON public.user_roles;

-- Create a non-recursive policy that safely allows reading all roles
-- It uses a slightly different syntax to avoid pinging the same table via a subquery
CREATE POLICY "Super admins can manage roles" ON public.user_roles 
    FOR ALL 
    TO authenticated
    USING (
        (SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1) = 'super_admin'
    );
