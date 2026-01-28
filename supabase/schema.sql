-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PHOTOS TABLE
create table photos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  image_url text not null,
  created_at timestamp with time zone default now()
);

-- RATINGS TABLE
create table ratings (
  id uuid primary key default uuid_generate_v4(),
  photo_id uuid references photos(id) on delete cascade not null,
  score int,
  jawline int,
  skin int,
  symmetry int,
  eyes int,
  hair int,
  recommendations jsonb,
  created_at timestamp with time zone default now()
);

-- RLS: PHOTOS
alter table photos enable row level security;

create policy "Users can view their own photos"
on photos for select
using (auth.uid() = user_id);

create policy "Users can insert their own photos"
on photos for insert
with check (auth.uid() = user_id);

create policy "Admins can view all photos"
on photos for select
using (
  auth.jwt() ->> 'role' = 'admin'
);

-- RLS: RATINGS
alter table ratings enable row level security;

create policy "Users can view ratings of their own photos"
on ratings for select
using (
  exists (
    select 1 from photos
    where photos.id = ratings.photo_id
    and photos.user_id = auth.uid()
  )
);

create policy "Admins can view all ratings"
on ratings for select
using (
  auth.jwt() ->> 'role' = 'admin'
);

create policy "Users can insert ratings for their own photos"
on ratings for insert
with check (
  exists (
    select 1 from photos
    where photos.id = photo_id
    and photos.user_id = auth.uid()
  )
);

-- STORAGE POLICIES (Conceptual, needs to be applied in Supabase Storage dashboard or via SQL if using triggers/functions, but usually SQL for storage policies looks like this if storage schema is exposed)
-- We attempt to insert into storage.objects if the user doesn't use the dashboard.
-- However, standard practice often involves setting this up in the dashboard. 
-- We will provide SQL compatible with Supabase Storage RLS.

insert into storage.buckets (id, name, public) 
values ('photos', 'photos', false)
on conflict (id) do nothing;

create policy "Users can upload their own photos"
on storage.objects for insert
with check (
  bucket_id = 'photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can view their own photos"
on storage.objects for select
using (
  bucket_id = 'photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Admins can select all photos"
on storage.objects for select
using (
  bucket_id = 'photos' AND
  auth.jwt() ->> 'role' = 'admin'
);
