-- Add registration_code column to symposium_registrations
ALTER TABLE symposium_registrations
ADD COLUMN IF NOT EXISTS registration_code TEXT UNIQUE;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_registration_code ON symposium_registrations(registration_code);
