-- 1. Add is_admin to existing profiles table (user_profiles migration assumed
--    a different table name; profiles already exists with FK references)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- 2. Fix trips SELECT policy: allow anonymous submissions to be read back
--    after INSERT + .select('id'), and allow admins to read all trips
DROP POLICY IF EXISTS "Users read own trips" ON trips;
DROP POLICY IF EXISTS "Users and admins read trips" ON trips;

CREATE POLICY "Users and admins read trips" ON trips
  FOR SELECT USING (
    auth.uid() = user_id
    OR user_id IS NULL
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );
