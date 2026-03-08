-- Create trip status enum
CREATE TYPE trip_status AS ENUM ('draft', 'submitted', 'quoted', 'confirmed', 'paid', 'completed');

-- Create trips table
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status trip_status NOT NULL DEFAULT 'draft',
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  destination_id TEXT,
  destination_name TEXT,
  start_date DATE,
  end_date DATE,
  travelers INTEGER NOT NULL DEFAULT 2,
  budget NUMERIC,
  budget_type TEXT DEFAULT 'total',
  currency TEXT DEFAULT 'EUR',
  selected_activities JSONB DEFAULT '[]'::jsonb,
  selected_accommodation JSONB,
  selected_transport JSONB,
  schedule JSONB,
  group_id UUID REFERENCES trip_groups(id) ON DELETE SET NULL,
  total_cost NUMERIC,
  notes TEXT,
  preferred_contact_method TEXT DEFAULT 'email',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trips_status ON trips(status);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a trip" ON trips
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users read own trips" ON trips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users update own trips" ON trips
  FOR UPDATE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_trips_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION update_trips_updated_at();
