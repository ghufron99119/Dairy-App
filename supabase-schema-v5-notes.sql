-- =============================================
-- Smart Notes Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Create Notes Table
create table if not exists notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text,
  content text,
  category text check (category in ('general', 'todo', 'reminder')), -- Adjusted categories based on requirements
  schedule_id uuid references schedules(id) on delete cascade, -- Optional link to a schedule
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Enable RLS
alter table notes enable row level security;

-- 3. RLS Policies
create policy "Users can view own notes" on notes for select using (auth.uid() = user_id);
create policy "Users can insert own notes" on notes for insert with check (auth.uid() = user_id);
create policy "Users can update own notes" on notes for update using (auth.uid() = user_id);
create policy "Users can delete own notes" on notes for delete using (auth.uid() = user_id);

-- 4. Create Index for Performance
create index if not exists notes_user_id_idx on notes(user_id);
create index if not exists notes_schedule_id_idx on notes(schedule_id);
