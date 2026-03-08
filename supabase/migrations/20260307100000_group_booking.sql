-- Group booking tables for bachelor/bachelorette trip planning

-- Trip groups: organizer creates a group for a trip
CREATE TABLE IF NOT EXISTS trip_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  organizer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  destination_id text,
  start_date date,
  end_date date,
  trip_data jsonb DEFAULT '{}',
  status text NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'quoted', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Group members: people invited to join the trip
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES trip_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text,
  phone text,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('organizer', 'member')),
  rsvp_status text NOT NULL DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'confirmed', 'declined')),
  dietary_restrictions text,
  arrival_info text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(group_id, email)
);

-- RLS policies
ALTER TABLE trip_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Organizer can do everything with their groups
CREATE POLICY "organizer_full_access" ON trip_groups
  FOR ALL USING (organizer_id = auth.uid());

-- Members can view groups they belong to
CREATE POLICY "members_can_view_group" ON trip_groups
  FOR SELECT USING (
    id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

-- Organizer can manage members
CREATE POLICY "organizer_manages_members" ON group_members
  FOR ALL USING (
    group_id IN (SELECT id FROM trip_groups WHERE organizer_id = auth.uid())
  );

-- Members can view their own group's members
CREATE POLICY "members_can_view_members" ON group_members
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

-- Members can update their own record (RSVP, dietary, etc.)
CREATE POLICY "members_update_own" ON group_members
  FOR UPDATE USING (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_trip_groups_organizer ON trip_groups(organizer_id);
CREATE INDEX idx_trip_groups_invite_code ON trip_groups(invite_code);
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_group_members_email ON group_members(email);
