-- Update certificates table schema for public verification
-- Make verification_code unique and indexed for fast lookups
ALTER TABLE public.certificates 
  DROP CONSTRAINT IF EXISTS certificates_verification_code_key;

ALTER TABLE public.certificates 
  ADD CONSTRAINT certificates_verification_code_key UNIQUE (verification_code);

-- Create index for case-insensitive verification code lookups
CREATE INDEX IF NOT EXISTS idx_certificates_verification_code_lower 
  ON public.certificates (LOWER(verification_code));

-- Add RLS policy for public certificate verification by code
DROP POLICY IF EXISTS "Public can verify certificates by code" ON public.certificates;

CREATE POLICY "Public can verify certificates by code"
ON public.certificates
FOR SELECT
USING (true);  -- Allow public read access for verification