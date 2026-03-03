-- ==============================================================================
-- 003: Team Profiles & Certificates Tables
-- ==============================================================================

-- 1. Team Profiles (if it doesn't already exist)
CREATE TABLE IF NOT EXISTS team_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT '',
    bio TEXT DEFAULT '',
    email TEXT DEFAULT '',
    linkedin_url TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    featured BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE team_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read team profiles (public page)
CREATE POLICY IF NOT EXISTS "team_profiles_public_read"
    ON team_profiles FOR SELECT USING (true);

-- Only admins can modify
CREATE POLICY IF NOT EXISTS "team_profiles_admin_write"
    ON team_profiles FOR ALL
    USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
    );

-- 2. Certificates table for verification system
CREATE TABLE IF NOT EXISTS certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    verification_code TEXT UNIQUE NOT NULL,
    student_name TEXT NOT NULL,
    course_title TEXT NOT NULL DEFAULT 'AI Symposium 2026',
    issue_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'valid' CHECK (status IN ('valid', 'revoked')),
    file_url TEXT DEFAULT '',
    certificate_image_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Anyone can read certificates (public verification)
CREATE POLICY IF NOT EXISTS "certificates_public_read"
    ON certificates FOR SELECT USING (true);

-- Only admins can modify certificates
CREATE POLICY IF NOT EXISTS "certificates_admin_write"
    ON certificates FOR ALL
    USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
    );
