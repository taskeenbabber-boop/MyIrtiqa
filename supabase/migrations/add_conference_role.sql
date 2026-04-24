-- Add conference_role and selected_competitions columns to symposium_registrations
ALTER TABLE symposium_registrations 
    ADD COLUMN IF NOT EXISTS conference_role TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS selected_competitions TEXT[] DEFAULT '{}';
