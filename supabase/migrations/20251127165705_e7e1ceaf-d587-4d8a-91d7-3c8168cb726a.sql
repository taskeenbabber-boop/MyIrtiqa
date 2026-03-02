-- Add RLS policies for team_profiles table

-- Allow everyone to view team profiles
CREATE POLICY "Team profiles viewable by everyone"
ON public.team_profiles
FOR SELECT
USING (true);

-- Allow editors, admins, and super_admins to manage team profiles
CREATE POLICY "Editors, admins, and super_admins can manage team profiles"
ON public.team_profiles
FOR ALL
USING (
  has_role(auth.uid(), 'editor'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'editor'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);