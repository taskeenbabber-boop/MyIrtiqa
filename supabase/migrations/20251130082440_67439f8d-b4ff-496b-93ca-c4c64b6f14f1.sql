-- Add user info columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS user_email TEXT,
ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Create achievements table for gallery
CREATE TABLE IF NOT EXISTS public.achievements (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  display_order SMALLINT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS on achievements
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Public can view active achievements
CREATE POLICY "Active achievements viewable by everyone"
ON public.achievements
FOR SELECT
USING (is_active = true);

-- Editors, admins, and super_admins can manage achievements
CREATE POLICY "Editors, admins, and super_admins can manage achievements"
ON public.achievements
FOR ALL
USING (
  has_role(auth.uid(), 'editor'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Create index on display_order for sorting
CREATE INDEX IF NOT EXISTS idx_achievements_display_order 
ON public.achievements(display_order);
