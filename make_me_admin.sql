-- ==============================================================================
-- RUN THIS SCRIPT IN YOUR SUPABASE SQL EDITOR TO MAKE YOURSELF AN ADMIN
-- ==============================================================================

-- 1. Replace 'your_email@example.com' with the exact email you use to sign in
-- 2. Click "Run" in the Supabase SQL Editor
-- 3. You will now be able to see all Registration, Pitch, and Poster data in the Admin Dashboard!

INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'your_email@example.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
