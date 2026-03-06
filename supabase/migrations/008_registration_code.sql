-- Add unique registration code column
ALTER TABLE symposium_registrations ADD COLUMN IF NOT EXISTS registration_code TEXT UNIQUE;

-- Create index for faster lookups if needed (e.g. for check-in app later)
CREATE INDEX IF NOT EXISTS idx_registration_code ON symposium_registrations(registration_code);
