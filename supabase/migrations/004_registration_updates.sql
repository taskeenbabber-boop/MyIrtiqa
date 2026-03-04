-- ============================================================
-- 004: Registration Form Updates — New Columns & Competition Tables
-- Run this in Supabase SQL Editor AFTER 001, 002, 003
-- ============================================================

-- ═══════════════════════════════════════════════
-- 1. Add missing columns to symposium_registrations
-- ═══════════════════════════════════════════════

-- Track whether registrant is NWSM student
ALTER TABLE public.symposium_registrations
    ADD COLUMN IF NOT EXISTS is_nwsm_student boolean DEFAULT false;

-- Track which days registrant signed up for
ALTER TABLE public.symposium_registrations
    ADD COLUMN IF NOT EXISTS wants_workshops boolean DEFAULT false;

ALTER TABLE public.symposium_registrations
    ADD COLUMN IF NOT EXISTS wants_conference boolean DEFAULT true;

-- Workshop fee per workshop (for record-keeping)
ALTER TABLE public.symposium_registrations
    ADD COLUMN IF NOT EXISTS workshop_fee_per integer DEFAULT 0;

-- Conference day fee (for record-keeping)
ALTER TABLE public.symposium_registrations
    ADD COLUMN IF NOT EXISTS conference_fee integer DEFAULT 0;

-- ═══════════════════════════════════════════════
-- 2. Quiz Competition Submissions  
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.symposium_quiz_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    institution text,
    roll_number text,
    status text NOT NULL DEFAULT 'pending',
    admin_notes text,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.symposium_quiz_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert quiz" ON public.symposium_quiz_submissions
    FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view quiz" ON public.symposium_quiz_submissions
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'superadmin'))
    );
CREATE POLICY "Admins can update quiz" ON public.symposium_quiz_submissions
    FOR UPDATE TO authenticated USING (
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'superadmin'))
    );

-- ═══════════════════════════════════════════════
-- 3. Meme Competition Submissions
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.symposium_meme_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    institution text,
    meme_url text,           -- uploaded meme image
    description text,        -- caption / context
    status text NOT NULL DEFAULT 'pending',
    admin_notes text,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.symposium_meme_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert meme" ON public.symposium_meme_submissions
    FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view meme" ON public.symposium_meme_submissions
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'superadmin'))
    );
CREATE POLICY "Admins can update meme" ON public.symposium_meme_submissions
    FOR UPDATE TO authenticated USING (
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'superadmin'))
    );

-- ═══════════════════════════════════════════════
-- 4. Symposium Speakers table (if not already from 002)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.symposium_speakers (
    id text PRIMARY KEY,
    name text NOT NULL,
    role text,
    image_url text,
    event_title text NOT NULL,
    event_category text NOT NULL,
    location text,
    time text,
    date text,
    description text,
    fee text,
    capacity text,
    display_order integer DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for speakers (public read, admin write)
ALTER TABLE public.symposium_speakers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'symposium_speakers' AND policyname = 'Public can read speakers') THEN
        CREATE POLICY "Public can read speakers" ON public.symposium_speakers FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'symposium_speakers' AND policyname = 'Admins can manage speakers') THEN
        CREATE POLICY "Admins can manage speakers" ON public.symposium_speakers FOR ALL TO authenticated
            USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'superadmin')));
    END IF;
END $$;

-- ═══════════════════════════════════════════════
-- 5. User Roles table (if not already existing)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('admin', 'super_admin', 'superadmin', 'user')),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can read own roles') THEN
        CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated
            USING (user_id = auth.uid());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Admins can manage roles') THEN
        CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated
            USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'superadmin')));
    END IF;
END $$;

-- ═══════════════════════════════════════════════
-- 6. Achievements table (Gallery page)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.achievements (
    id serial PRIMARY KEY,
    title text NOT NULL,
    description text,
    image_url text NOT NULL,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'achievements' AND policyname = 'Public can read achievements') THEN
        CREATE POLICY "Public can read achievements" ON public.achievements FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'achievements' AND policyname = 'Admins can manage achievements') THEN
        CREATE POLICY "Admins can manage achievements" ON public.achievements FOR ALL TO authenticated
            USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'superadmin')));
    END IF;
END $$;

-- ═══════════════════════════════════════════════
-- 7. Storage bucket (ensure it exists)
-- ═══════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public) 
VALUES ('symposium-uploads', 'symposium-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════
-- SUMMARY OF ALL TABLES
-- ═══════════════════════════════════════════════
-- symposium_registrations  — Main registration form data (with is_nwsm_student, wants_workshops, wants_conference)
-- symposium_speakers       — Event speakers/sessions data
-- symposium_pitch_submissions — AI Pitch competition entries
-- symposium_poster_submissions — AI Poster competition entries
-- symposium_quiz_submissions  — AI Quiz competition entries (NEW)
-- symposium_meme_submissions  — Meme competition entries (NEW)
-- team_profiles             — Team page members
-- certificates              — Certificate verification system
-- user_roles                — Admin/user role assignments
-- achievements              — Gallery page content
