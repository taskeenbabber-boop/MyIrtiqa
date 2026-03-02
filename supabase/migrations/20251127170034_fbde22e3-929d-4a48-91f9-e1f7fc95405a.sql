-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-proofs',
  'payment-proofs',
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Storage policies for payment proofs
CREATE POLICY "Users can upload their own payment proofs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'payment-proofs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own payment proofs"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'payment-proofs' AND
  (auth.uid()::text = (storage.foldername(name))[1] OR
   has_role(auth.uid(), 'admin'::app_role) OR
   has_role(auth.uid(), 'super_admin'::app_role))
);

CREATE POLICY "Admins can view all payment proofs"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'payment-proofs' AND
  (has_role(auth.uid(), 'admin'::app_role) OR
   has_role(auth.uid(), 'super_admin'::app_role))
);

-- Add payment_proof_url column to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_proof_url text;

-- Add bank_account_details to site_settings if not exists
INSERT INTO public.site_settings (key, value)
VALUES (
  'bank_account_details',
  '{"bank_name": "HBL Bank", "account_title": "Your Organization Name", "account_number": "1234567890", "iban": "PK12HABB0000001234567890", "branch": "Main Branch"}'::jsonb
)
ON CONFLICT (key) DO NOTHING;