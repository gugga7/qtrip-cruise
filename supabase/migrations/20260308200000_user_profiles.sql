-- Add admin flag and ensure RLS on existing profiles table
-- (profiles table already exists with FK to auth.users)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Idempotent policy creation
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users read own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users update own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can insert profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Anyone can insert profile" ON profiles FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Auto-create profile on user signup (if not already handled)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Update catalog table RLS to check is_admin for write operations
DO $$ BEGIN
  -- Drop old policies that allowed any authenticated user to write
  DROP POLICY IF EXISTS "Authenticated manage destinations" ON destinations;
  DROP POLICY IF EXISTS "Authenticated manage activities" ON activities;
  DROP POLICY IF EXISTS "Authenticated manage accommodations" ON accommodations;
  DROP POLICY IF EXISTS "Authenticated manage transports" ON transports;
  DROP POLICY IF EXISTS "Authenticated manage ai_configs" ON ai_configs;

  -- Create admin-only write policies (idempotent)
  DROP POLICY IF EXISTS "Admin manage destinations" ON destinations;
  CREATE POLICY "Admin manage destinations" ON destinations
    FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );
  DROP POLICY IF EXISTS "Admin manage activities" ON activities;
  CREATE POLICY "Admin manage activities" ON activities
    FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );
  DROP POLICY IF EXISTS "Admin manage accommodations" ON accommodations;
  CREATE POLICY "Admin manage accommodations" ON accommodations
    FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );
  DROP POLICY IF EXISTS "Admin manage transports" ON transports;
  CREATE POLICY "Admin manage transports" ON transports
    FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );
  DROP POLICY IF EXISTS "Admin manage ai_configs" ON ai_configs;
  CREATE POLICY "Admin manage ai_configs" ON ai_configs
    FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

  -- Trip read policy (allow own trips + admin read all)
  DROP POLICY IF EXISTS "Users read own trips" ON trips;
  DROP POLICY IF EXISTS "Users and admins read trips" ON trips;
  CREATE POLICY "Users and admins read trips" ON trips
    FOR SELECT USING (
      auth.uid() = user_id
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );
END $$;
