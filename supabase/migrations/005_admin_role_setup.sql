-- ============================================================
-- ADMIN ROLE SETUP — Run in Supabase SQL Editor
-- ============================================================
-- 
-- HOW TO USE:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Find the user you want to make admin and copy their UUID (the "id" column)
-- 3. Replace 'YOUR_USER_ID_HERE' below with the actual UUID
-- 4. Run this in SQL Editor
-- ============================================================

-- ═══════════ STEP 1: Make sure user_roles table exists ═══════════
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    role text NOT NULL CHECK (role IN ('admin', 'super_admin', 'user')),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can read own roles') THEN
        CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated
            USING (user_id = auth.uid());
    END IF;
END $$;

-- Allow super_admins to manage all roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Super admins can manage roles') THEN
        CREATE POLICY "Super admins can manage roles" ON public.user_roles FOR ALL TO authenticated
            USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin'));
    END IF;
END $$;

-- ═══════════ STEP 2: Insert your admin role ═══════════
-- ┌──────────────────────────────────────────────────────────────────┐
-- │ REPLACE the UUID below with your actual user ID from Supabase   │
-- │ Go to: Authentication > Users > click your user > copy the ID   │
-- └──────────────────────────────────────────────────────────────────┘

-- Example: Make yourself a super_admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID_HERE', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- ═══════════ OTHER EXAMPLES ═══════════

-- Make someone a regular admin:
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('THEIR_USER_ID_HERE', 'admin')
-- ON CONFLICT (user_id, role) DO NOTHING;

-- Remove someone's admin role:
-- DELETE FROM public.user_roles WHERE user_id = 'THEIR_USER_ID_HERE';

-- View all admins:
-- SELECT ur.*, u.email FROM public.user_roles ur
-- JOIN auth.users u ON ur.user_id = u.id;

-- ═══════════ QUICK METHOD (if you know your email) ═══════════
-- This finds your user by email and inserts the role automatically:

-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'super_admin' FROM auth.users WHERE email = 'your-email@example.com'
-- ON CONFLICT (user_id, role) DO NOTHING;
