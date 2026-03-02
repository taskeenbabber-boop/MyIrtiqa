-- Migration: Add testimonials table and super admin setup
-- Part A: Ensure super_admin role exists and add testimonials table

-- Create testimonials table for the animated testimonials section
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  company TEXT,
  content TEXT NOT NULL,
  photo_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on testimonials
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Testimonials viewable by everyone
CREATE POLICY "Testimonials viewable by everyone"
ON public.testimonials
FOR SELECT
USING (is_active = true);

-- Editors, admins, and super_admins can manage testimonials
CREATE POLICY "Editors, admins, and super_admins can manage testimonials"
ON public.testimonials
FOR ALL
USING (
  has_role(auth.uid(), 'editor'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Add trigger for updated_at
CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create media_library table for image management
CREATE TABLE IF NOT EXISTS public.media_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_url TEXT NOT NULL,
  webp_url TEXT,
  thumbnail_url TEXT,
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  mime_type TEXT,
  alt_text TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on media_library
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

-- Admins and super_admins can view all media
CREATE POLICY "Admins and super_admins can view all media"
ON public.media_library
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Admins and super_admins can manage media
CREATE POLICY "Admins and super_admins can manage media"
ON public.media_library
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Add trigger for media_library updated_at
CREATE TRIGGER update_media_library_updated_at
BEFORE UPDATE ON public.media_library
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample testimonials for the animated section
INSERT INTO public.testimonials (name, role, company, content, sort_order) VALUES
('Dr. Ahmed Hassan', 'Research Scholar', 'Aga Khan University', 'IRTIQA transformed my understanding of research methodology. The structured approach and expert mentorship helped me publish my first systematic review.', 1),
('Fatima Khan', 'Medical Student', 'Dow University', 'The 15-day series gave me the confidence to start my own research project. The tutors are incredibly supportive and knowledgeable.', 2),
('Ali Raza', 'PhD Candidate', 'NUST', 'Exceptional quality of training. The practical exercises and real-world examples made complex concepts easy to understand.', 3),
('Sara Malik', 'Assistant Professor', 'LUMS', 'IRTIQA fills a crucial gap in research education in Pakistan. Highly recommended for anyone serious about research.', 4),
('Usman Sheikh', 'Researcher', 'PIMS', 'The systematic reviews workshop was a game-changer. I now feel confident in conducting high-quality research.', 5),
('Zainab Ali', 'Graduate Student', 'Quaid-i-Azam University', 'Best investment in my academic career. The certificate verification system adds credibility to our achievements.', 6);
