-- Fix for missing sound_type column in user_settings table
-- This script adds the sound_type column if it doesn't exist

-- Check if the column exists and add it if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'user_settings'
        AND column_name = 'sound_type'
    ) THEN
        ALTER TABLE public.user_settings 
        ADD COLUMN sound_type TEXT NOT NULL DEFAULT 'beep';
        
        RAISE NOTICE 'Added sound_type column to user_settings table';
    ELSE
        RAISE NOTICE 'sound_type column already exists in user_settings table';
    END IF;
END $$;

-- Verify the column exists now
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'user_settings'
AND column_name = 'sound_type';

-- Update the handle_new_user function to ensure it includes sound_type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (NEW.id, NULL, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_settings (
    user_id, 
    pomodoro_length, 
    short_break_length, 
    long_break_length, 
    sessions_until_long_break, 
    auto_start_breaks, 
    auto_start_pomodoros, 
    sound_enabled, 
    sound_type, 
    notifications_enabled
  )
  VALUES (
    NEW.id, 
    25, -- default pomodoro length (minutes)
    5,  -- default short break length (minutes)
    15, -- default long break length (minutes)
    4,  -- default sessions until long break
    false, -- default auto start breaks
    false, -- default auto start pomodoros
    true,  -- default sound enabled
    'beep', -- default sound type
    true   -- default notifications enabled
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Refresh the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add sound_type to existing user settings that are missing it
UPDATE public.user_settings 
SET sound_type = 'beep' 
WHERE sound_type IS NULL;
