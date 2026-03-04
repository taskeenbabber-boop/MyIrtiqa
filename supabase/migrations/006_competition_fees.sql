-- ============================================================
-- 006: Add Drill & Debate Competitions + Payment Receipts
-- ============================================================

-- Add receipt_url to existing paid competitions (Fee: 500 PKR)
ALTER TABLE public.symposium_pitch_submissions ADD COLUMN IF NOT EXISTS receipt_url text;
ALTER TABLE public.symposium_poster_submissions ADD COLUMN IF NOT EXISTS receipt_url text;
ALTER TABLE public.symposium_quiz_submissions ADD COLUMN IF NOT EXISTS receipt_url text;

-- ═══════════════════════════════════════════════
-- AI Drill Competition
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.symposium_drill_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    institution text,
    roll_number text,
    receipt_url text, -- for the 500 PKR fee
    status text NOT NULL DEFAULT 'pending',
    admin_notes text,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.symposium_drill_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert drill" ON public.symposium_drill_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view drill" ON public.symposium_drill_submissions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'superadmin')));
CREATE POLICY "Admins can update drill" ON public.symposium_drill_submissions FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'superadmin')));

-- ═══════════════════════════════════════════════
-- AI Debate Competition
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.symposium_debate_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    institution text,
    roll_number text,
    receipt_url text, -- for the 500 PKR fee
    status text NOT NULL DEFAULT 'pending',
    admin_notes text,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.symposium_debate_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert debate" ON public.symposium_debate_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view debate" ON public.symposium_debate_submissions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'superadmin')));
CREATE POLICY "Admins can update debate" ON public.symposium_debate_submissions FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'superadmin')));
