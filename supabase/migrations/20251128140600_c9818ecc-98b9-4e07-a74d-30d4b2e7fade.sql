-- Make payment-proofs bucket public so URLs work
UPDATE storage.buckets 
SET public = true 
WHERE id = 'payment-proofs';