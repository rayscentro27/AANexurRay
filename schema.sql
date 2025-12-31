-- Supabase schema for Nexus Financial OS (env-only config)

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  role text not null default 'client',
  is_master_admin boolean not null default false,
  settings jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function set_first_master_admin()
returns trigger
language plpgsql
as $$
begin
  if not exists (select 1 from profiles where is_master_admin = true) then
    new.is_master_admin := true;
    new.role := 'admin';
  end if;
  return new;
end;
$$;

create trigger trg_first_master_admin
before insert on profiles
for each row execute function set_first_master_admin();

create table if not exists contacts (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists branding (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table contacts enable row level security;
alter table branding enable row level security;

-- Profiles: users can manage their own profile
create policy "Profiles: insert own" on profiles
for insert to authenticated
with check (id = auth.uid());

create policy "Profiles: select own" on profiles
for select to authenticated
using (id = auth.uid());

create policy "Profiles: update own" on profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Helper policy to identify admins
create policy "Contacts: admin read" on contacts
for select to authenticated
using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "Contacts: admin write" on contacts
for insert to authenticated
with check (
  exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "Contacts: admin update" on contacts
for update to authenticated
using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "Contacts: admin delete" on contacts
for delete to authenticated
using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

-- Branding: readable by all authenticated users, writable by admins
create policy "Branding: read" on branding
for select to authenticated
using (true);

create policy "Branding: admin write" on branding
for insert to authenticated
with check (
  exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "Branding: admin update" on branding
for update to authenticated
using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);
