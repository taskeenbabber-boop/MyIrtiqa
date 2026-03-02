-- Drop the security definer view and create it properly
DROP VIEW IF EXISTS public.certificate_public_view;

-- Create a non-security definer view for public certificate verification
CREATE OR REPLACE VIEW public.certificate_public_view 
WITH (security_invoker=true)
AS
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