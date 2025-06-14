
-- 1. Create the announcements table
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  created_by uuid references auth.users(id) not null,
  organization_id uuid references organizations(id),
  is_global boolean not null default false,
  is_active boolean not null default true,
  expires_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- 2. Create the user_announcement_reads table
create table public.user_announcement_reads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  announcement_id uuid references announcements(id) not null,
  read_at timestamp with time zone not null default now(),
  unique (user_id, announcement_id)
);

-- 3. Enable RLS on both tables
alter table public.announcements enable row level security;
alter table public.user_announcement_reads enable row level security;

-- 4. Policy: Only admins can insert/update/delete announcements (assuming you use 'organization_members' for admin role)
create policy "Admins can manage announcements"
on public.announcements
for all
using (
  (
    select role = 'admin'
    from organization_members
    where user_id = auth.uid()
    and (organization_id = organization_id or is_global)
    limit 1
  )
);

-- 5. Policy: Any authenticated user can select announcements relevant to them
create policy "Users can read global or their org announcements"
on public.announcements
for select
using (
  is_active
  and (
    is_global
    or (organization_id is not null and organization_id in (
      select organization_id from organization_members where user_id = auth.uid()
    ))
  )
  and (expires_at is null or expires_at > now())
);

-- 6. Policy: Users can insert/select their own announcement_reads
create policy "Users can mark announcements as read"
on public.user_announcement_reads
for insert
with check (user_id = auth.uid());
create policy "Users can view their own announcement reads"
on public.user_announcement_reads
for select
using (user_id = auth.uid());

