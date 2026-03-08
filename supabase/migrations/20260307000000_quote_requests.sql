create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text not null,
  preferred_contact_method text not null default 'email',
  destination_name text not null,
  start_date date,
  end_date date,
  travelers integer not null check (travelers > 0),
  budget numeric,
  currency text,
  estimated_total numeric,
  notes text,
  selected_activities jsonb,
  selected_accommodation jsonb,
  selected_transport jsonb,
  itinerary jsonb,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.quote_requests enable row level security;

create policy "Anyone can submit quote requests"
  on public.quote_requests
  for insert
  with check (true);

create policy "Users can view their own quote requests"
  on public.quote_requests
  for select
  using (auth.uid() = user_id);

create or replace function public.set_quote_requests_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_quote_requests_updated_at on public.quote_requests;

create trigger set_quote_requests_updated_at
before update on public.quote_requests
for each row
execute function public.set_quote_requests_updated_at();