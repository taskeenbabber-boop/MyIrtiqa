-- ============================================================
-- AI SYMPOSIUM — Supabase Migration
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- Project: rvfkmlhlsnoosugldscq
-- ============================================================

-- 1. Symposium Registrations
CREATE TABLE IF NOT EXISTS public.symposium_registrations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_type text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    institution text,
    roll_number text,
    team_members jsonb,
    selected_workshops text[] DEFAULT '{}',
    total_amount integer NOT NULL DEFAULT 0,
    receipt_url text,
    status text NOT NULL DEFAULT 'pending',
    admin_notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Pitch Competition Submissions
CREATE TABLE IF NOT EXISTS public.symposium_pitch_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    institution text,
    roll_number text,
    pitch_description text NOT NULL,
    document_url text,
    status text NOT NULL DEFAULT 'pending',
    admin_notes text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Poster Competition Submissions
CREATE TABLE IF NOT EXISTS public.symposium_poster_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    institution text,
    roll_number text,
    topic_description text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    admin_notes text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.symposium_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symposium_pitch_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symposium_poster_submissions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies — Public can insert, admins can read/update
CREATE POLICY "Anyone can insert registrations" ON public.symposium_registrations
    FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view registrations" ON public.symposium_registrations
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
    );
CREATE POLICY "Admins can update registrations" ON public.symposium_registrations
    FOR UPDATE TO authenticated USING (
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

CREATE POLICY "Anyone can insert pitch" ON public.symposium_pitch_submissions
    FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view pitch" ON public.symposium_pitch_submissions
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
    );
CREATE POLICY "Admins can update pitch" ON public.symposium_pitch_submissions
    FOR UPDATE TO authenticated USING (
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

CREATE POLICY "Anyone can insert poster" ON public.symposium_poster_submissions
    FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view poster" ON public.symposium_poster_submissions
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
    );
CREATE POLICY "Admins can update poster" ON public.symposium_poster_submissions
    FOR UPDATE TO authenticated USING (
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

-- 6. Storage bucket for uploads (receipts, pitch docs)
-- Run this separately or create via Supabase Dashboard > Storage:
-- Bucket name: symposium-uploads
-- Public: false
INSERT INTO storage.buckets (id, name, public) VALUES ('symposium-uploads', 'symposium-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: anyone can upload, admins can read
CREATE POLICY "Anyone can upload symposium files" ON storage.objects
    FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'symposium-uploads');
CREATE POLICY "Admins can view symposium files" ON storage.objects
    FOR SELECT TO authenticated USING (
        bucket_id = 'symposium-uploads' AND
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
    );
