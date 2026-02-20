-- =============================================
-- Nexus Personal Website - Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles (Extends Supabase Auth)
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, username)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for auto-profile creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Tasks
create table if not exists tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  is_complete boolean default false,
  due_date timestamp with time zone,
  category text check (category in ('mahad', 'campus', 'work', 'personal')),
  priority integer default 0,
  created_at timestamp with time zone default now()
);

-- 3. Transactions (Finance / Vault)
create table if not exists transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  amount numeric not null,
  type text check (type in ('income', 'expense')) not null,
  category text,
  description text,
  created_at timestamp with time zone default now()
);

-- 4. Schedules
create table if not exists schedules (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  day_of_week integer check (day_of_week >= 0 and day_of_week <= 6), -- 0=Mon, 6=Sun
  start_time time not null,
  end_time time,
  type text check (type in ('mahad', 'campus', 'work')),
  created_at timestamp with time zone default now()
);

-- 5. Activity Logs
create table if not exists activity_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  score integer check (score >= 0 and score <= 100),
  log_date date default current_date unique,
  created_at timestamp with time zone default now()
);

-- RLS Policies: Users can only access their own data
alter table profiles enable row level security;
alter table tasks enable row level security;
alter table transactions enable row level security;
alter table schedules enable row level security;
alter table activity_logs enable row level security;

-- Profiles policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Tasks policies
create policy "Users can view own tasks" on tasks for select using (auth.uid() = user_id);
create policy "Users can insert own tasks" on tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks" on tasks for update using (auth.uid() = user_id);
create policy "Users can delete own tasks" on tasks for delete using (auth.uid() = user_id);

-- Transactions policies
create policy "Users can view own transactions" on transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on transactions for update using (auth.uid() = user_id);
create policy "Users can delete own transactions" on transactions for delete using (auth.uid() = user_id);

-- Schedules policies
create policy "Users can view own schedules" on schedules for select using (auth.uid() = user_id);
create policy "Users can insert own schedules" on schedules for insert with check (auth.uid() = user_id);
create policy "Users can update own schedules" on schedules for update using (auth.uid() = user_id);
create policy "Users can delete own schedules" on schedules for delete using (auth.uid() = user_id);

-- Activity logs policies
create policy "Users can view own activity_logs" on activity_logs for select using (auth.uid() = user_id);
create policy "Users can insert own activity_logs" on activity_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own activity_logs" on activity_logs for update using (auth.uid() = user_id);
