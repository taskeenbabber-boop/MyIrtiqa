-- ======================================================
-- Supabase SQL: Ambassador Applications Table
-- Run this in the Supabase SQL Editor
-- ======================================================

CREATE TABLE IF NOT EXISTS symposium_ambassador_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    social_url TEXT,
    institution TEXT NOT NULL,
    year_of_study TEXT NOT NULL,
    leadership_experience TEXT NOT NULL,
    promotional_strategy TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE symposium_ambassador_applications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public form)
CREATE POLICY "Allow public inserts" ON symposium_ambassador_applications
    FOR INSERT WITH CHECK (true);

-- Allow authenticated users (admin) to read all
CREATE POLICY "Allow authenticated to read" ON symposium_ambassador_applications
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users (admin) to update
CREATE POLICY "Allow authenticated to update" ON symposium_ambassador_applications
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Also allow anon to select (for admin dashboard using anon key)
CREATE POLICY "Allow anon to read" ON symposium_ambassador_applications
    FOR SELECT USING (true);

-- Allow anon to update (for admin dashboard using anon key)
CREATE POLICY "Allow anon to update" ON symposium_ambassador_applications
    FOR UPDATE USING (true);
