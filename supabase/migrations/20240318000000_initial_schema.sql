-- Drop existing objects if they exist
do $$ 
declare
  _sql text;
begin
    -- First drop the trigger that depends on the function
    drop trigger if exists on_auth_user_created on auth.users;
    
    -- Then drop the function
    drop function if exists public.handle_new_user();
    
    -- Drop all policies from all tables in public schema
    for _sql in 
        select format('drop policy if exists %I on %I.%I', 
               pol.polname, 
               quote_ident(n.nspname),
               quote_ident(c.relname))
        from pg_policy pol
        join pg_class c on c.oid = pol.polrelid
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public'
    loop
        execute _sql;
    end loop;

    -- Drop tables with cascade
    drop table if exists public.bookings cascade;
    drop table if exists public.profiles cascade;
end $$;

-- Create necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Create tables
create table public.profiles (
  id uuid references auth.users on delete cascade,
  email text,
  first_name text,
  last_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (id)
);

create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  status text check (status in ('pending', 'confirmed', 'cancelled')) default 'pending',
  total_price numeric(10,2) not null,
  destination text not null,
  activities text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.bookings enable row level security;

-- Create policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can view own bookings"
  on public.bookings for select
  using (auth.uid() = user_id);

create policy "Users can insert own bookings"
  on public.bookings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own bookings"
  on public.bookings for update
  using (auth.uid() = user_id);

-- Create functions
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Create triggers
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user(); 