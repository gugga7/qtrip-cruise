-- Trip planning schema additions
-- NOTE: Catalog tables (destinations, activities, accommodations, transports)
-- are created in 20260308100000_catalog_tables.sql with the correct schema.
-- This migration only handles bookings enhancements and schedules.

-- Create schedules table for detailed itineraries
create table if not exists public.schedules (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references public.bookings(id) on delete cascade,
  day_number integer not null,
  date date not null,
  activities uuid[],
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.schedules enable row level security;

-- Policies
create policy "Users can view own schedules"
  on public.schedules for select
  using (
    auth.uid() in (
      select user_id from public.bookings where id = booking_id
    )
  );
