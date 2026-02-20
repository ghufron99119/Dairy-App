-- =============================================
-- Nexus Personal Website - Schema V2 Updates
-- Run this AFTER the original supabase-schema.sql
-- =============================================

-- 1. Extend Profiles with Student Data
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS nim text,
ADD COLUMN IF NOT EXISTS major text,
ADD COLUMN IF NOT EXISTS semester text;

-- 2. Extend Schedules with Detailed Info
ALTER TABLE schedules 
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS lecturer text,
ADD COLUMN IF NOT EXISTS sks integer,
ADD COLUMN IF NOT EXISTS class_group text,
ADD COLUMN IF NOT EXISTS description text;

-- 3. Create Checklist Items Table (Templates - e.g. prayer list)
CREATE TABLE IF NOT EXISTS checklist_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  category text DEFAULT 'daily' CHECK (category IN ('daily', 'weekly', 'custom')),
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Create Checklist Logs Table (Daily completion tracking)
CREATE TABLE IF NOT EXISTS checklist_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES checklist_items ON DELETE CASCADE NOT NULL,
  log_date date DEFAULT current_date,
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  UNIQUE(user_id, item_id, log_date)
);

-- 5. Enable RLS for new tables
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_logs ENABLE ROW LEVEL SECURITY;

-- 6. Policies for checklist_items
CREATE POLICY "Users can view own checklist_items" ON checklist_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checklist_items" ON checklist_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checklist_items" ON checklist_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own checklist_items" ON checklist_items FOR DELETE USING (auth.uid() = user_id);

-- 7. Policies for checklist_logs
CREATE POLICY "Users can view own checklist_logs" ON checklist_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checklist_logs" ON checklist_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checklist_logs" ON checklist_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own checklist_logs" ON checklist_logs FOR DELETE USING (auth.uid() = user_id);
