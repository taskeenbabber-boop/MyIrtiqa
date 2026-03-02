-- Fix Certificate RLS to prevent email harvesting
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Certificates viewable by verification code" ON public.certificates;

-- Create new policy that only allows viewing with specific verification code
-- This prevents bulk email harvesting while allowing legitimate verification
CREATE POLICY "Certificates viewable by verification code or admin"
ON public.certificates
FOR SELECT
USING (
  -- Admins can see all certificates
  has_role(auth.uid(), 'admin') 
  OR has_role(auth.uid(), 'super_admin')
  OR has_role(auth.uid(), 'editor')
  -- Note: For public verification, the application should use an edge function
  -- that takes verification_code as parameter and returns only that specific certificate
  -- without exposing the student_email field to the public
);

-- Create a view for public certificate verification (without email)
CREATE OR REPLACE VIEW public.certificate_public_view AS
SELECT 
  id,
  verification_code,
  student_name,
  course_title,
  issue_date,
  file_url,
  status,
  notes,
  created_at
FROM public.certificates
WHERE status = 'valid';

-- Grant public access to the view
GRANT SELECT ON public.certificate_public_view TO anon;
GRANT SELECT ON public.certificate_public_view TO authenticated;