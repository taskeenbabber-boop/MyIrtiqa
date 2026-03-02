-- Update RLS policies to include super_admin access

-- User roles table: super_admin can manage all roles
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins and super_admins can manage all roles"
ON public.user_roles
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins and super_admins can view all roles"
ON public.user_roles
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Orders table: super_admin can update and view all
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins and super_admins can update orders"
ON public.orders
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins and super_admins can view all orders"
ON public.orders
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Products table: super_admin can manage all
DROP POLICY IF EXISTS "Editors can manage products" ON public.products;
CREATE POLICY "Editors, admins, and super_admins can manage products"
ON public.products
FOR ALL
USING (
  has_role(auth.uid(), 'editor'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Library items: super_admin can manage all
DROP POLICY IF EXISTS "Editors can manage library items" ON public.library_items;
CREATE POLICY "Editors, admins, and super_admins can manage library items"
ON public.library_items
FOR ALL
USING (
  has_role(auth.uid(), 'editor'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

DROP POLICY IF EXISTS "Published library items viewable by product owners" ON public.library_items;
CREATE POLICY "Published library items viewable by product owners and admins"
ON public.library_items
FOR SELECT
USING (
  (is_published = true AND user_owns_product(auth.uid(), product_id)) OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Certificates: super_admin can manage all
DROP POLICY IF EXISTS "Editors can manage certificates" ON public.certificates;
CREATE POLICY "Editors, admins, and super_admins can manage certificates"
ON public.certificates
FOR ALL
USING (
  has_role(auth.uid(), 'editor'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- People: super_admin can manage all
DROP POLICY IF EXISTS "Editors can manage people" ON public.people;
CREATE POLICY "Editors, admins, and super_admins can manage people"
ON public.people
FOR ALL
USING (
  has_role(auth.uid(), 'editor'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Site settings: super_admin can manage all
DROP POLICY IF EXISTS "Admins can manage settings" ON public.site_settings;
CREATE POLICY "Admins and super_admins can manage settings"
ON public.site_settings
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);
