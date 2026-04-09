-- Disable RLS on registrations to allow admin dashboard fetching
-- This fixes the issue where the frontend receives an empty array [] 
-- despite there being data in the database because of restrictive read policies.

ALTER TABLE public.symposium_registrations DISABLE ROW LEVEL SECURITY;

-- If there are any stray restrictive policies, drop them:
DROP POLICY IF EXISTS "Admins can view registrations" ON public.symposium_registrations;
DROP POLICY IF EXISTS "Anyone can insert registrations" ON public.symposium_registrations;
DROP POLICY IF EXISTS "Admins can update registrations" ON public.symposium_registrations;
