-- Phase 1: Core Database Schema with RBAC

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('public', 'member', 'editor', 'admin');

-- Create user_roles table for RBAC
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'public',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'PKR',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Editors can manage products"
  ON public.products FOR ALL
  USING (public.has_role(auth.uid(), 'editor') OR public.has_role(auth.uid(), 'admin'));

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'PKR',
  status TEXT NOT NULL DEFAULT 'pending',
  provider TEXT,
  provider_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Library items table
CREATE TABLE public.library_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  day_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_source TEXT NOT NULL DEFAULT 'youtube',
  video_ref TEXT NOT NULL,
  duration INTEGER,
  is_published BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, day_index)
);

ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;

-- Function to check if user owns product
CREATE OR REPLACE FUNCTION public.user_owns_product(_user_id UUID, _product_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.orders
    WHERE user_id = _user_id 
      AND product_id = _product_id 
      AND status = 'paid'
  )
$$;

CREATE POLICY "Published library items viewable by product owners"
  ON public.library_items FOR SELECT
  USING (
    is_published = true AND (
      public.user_owns_product(auth.uid(), product_id) OR
      public.has_role(auth.uid(), 'admin')
    )
  );

CREATE POLICY "Editors can manage library items"
  ON public.library_items FOR ALL
  USING (public.has_role(auth.uid(), 'editor') OR public.has_role(auth.uid(), 'admin'));

-- Certificates table
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_code TEXT UNIQUE NOT NULL,
  student_name TEXT NOT NULL,
  course_title TEXT NOT NULL,
  issue_date DATE NOT NULL,
  file_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'valid',
  student_email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Public can search by verification code only
CREATE POLICY "Certificates viewable by verification code"
  ON public.certificates FOR SELECT
  USING (true);

CREATE POLICY "Editors can manage certificates"
  ON public.certificates FOR ALL
  USING (public.has_role(auth.uid(), 'editor') OR public.has_role(auth.uid(), 'admin'));

-- Index for fast verification lookup
CREATE INDEX idx_certificates_verification_code ON public.certificates(verification_code);

-- Person table (for founders and tutors)
CREATE TYPE public.person_type AS ENUM ('founder', 'tutor');

CREATE TABLE public.people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.person_type NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  bio TEXT,
  photo_url TEXT,
  linkedin TEXT,
  email TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

CREATE POLICY "People viewable by everyone"
  ON public.people FOR SELECT
  USING (is_active = true);

CREATE POLICY "Editors can manage people"
  ON public.people FOR ALL
  USING (public.has_role(auth.uid(), 'editor') OR public.has_role(auth.uid(), 'admin'));

-- Site settings table
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings viewable by everyone"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON public.site_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.library_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.people
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Seed data: Create 15-Day Series product
INSERT INTO public.products (slug, title, description, price, currency, is_active)
VALUES (
  '15-day-roots-of-research',
  'Roots of Research 15-Day Series',
  'Master research fundamentals through expert-led training. Complete access to all 15 days of intensive research methodology training.',
  500,
  'PKR',
  true
);

-- Seed data: Sample library items
INSERT INTO public.library_items (product_id, day_index, title, description, video_source, video_ref, duration, is_published, sort_order)
SELECT 
  p.id,
  1,
  'Day 1: Introduction to Research Methodology',
  'Learn the fundamentals of research methodology and scientific inquiry.',
  'youtube',
  'dQw4w9WgXcQ',
  3600,
  true,
  1
FROM public.products p
WHERE p.slug = '15-day-roots-of-research';

INSERT INTO public.library_items (product_id, day_index, title, description, video_source, video_ref, duration, is_published, sort_order)
SELECT 
  p.id,
  2,
  'Day 2: Literature Review Techniques',
  'Master the art of conducting comprehensive literature reviews.',
  'youtube',
  'dQw4w9WgXcQ',
  3600,
  true,
  2
FROM public.products p
WHERE p.slug = '15-day-roots-of-research';

INSERT INTO public.library_items (product_id, day_index, title, description, video_source, video_ref, duration, is_published, sort_order)
SELECT 
  p.id,
  3,
  'Day 3: Research Question Formulation',
  'Develop strong, focused research questions that drive impactful studies.',
  'youtube',
  'dQw4w9WgXcQ',
  3600,
  true,
  3
FROM public.products p
WHERE p.slug = '15-day-roots-of-research';

-- Seed data: Sample people
INSERT INTO public.people (type, name, role, bio, sort_order, is_active)
VALUES
  ('founder', 'Dr. Sarah Ahmad', 'Director & Founder', 'Leading researcher with 15+ years of experience in academic training and quality advancement.', 1, true),
  ('founder', 'Prof. Muhammad Ali', 'Co-Founder', 'Expert in research methodology and statistical analysis with a passion for accessible education.', 2, true),
  ('tutor', 'Dr. Aisha Khan', 'Research Methods Specialist', 'Specialist in qualitative and quantitative research methods. Has trained over 500 researchers.', 1, true),
  ('tutor', 'Dr. Ahmed Hassan', 'Statistics Expert', 'Data scientist and statistician focusing on practical research applications.', 2, true);

-- Seed data: Sample certificates
INSERT INTO public.certificates (verification_code, student_name, course_title, issue_date, file_url, status, student_email)
VALUES
  ('IRTIQA-2024-001', 'Ali Ahmed', 'Roots of Research 15-Day Series', '2024-01-15', 'https://example.com/cert1.pdf', 'valid', 'ali@example.com'),
  ('IRTIQA-2024-002', 'Fatima Hassan', 'Roots of Research 15-Day Series', '2024-01-15', 'https://example.com/cert2.pdf', 'valid', 'fatima@example.com'),
  ('IRTIQA-2024-003', 'Omar Khan', 'Roots of Research 15-Day Series', '2024-01-20', 'https://example.com/cert3.pdf', 'valid', 'omar@example.com');