-- Security Fix for Syncodoro Functions
-- Run this to fix the search_path security warnings

-- Drop and recreate functions with proper security settings
DROP FUNCTION IF EXISTS public.handle_updated_at();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create functions for automatic updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Function to automatically create user profile and settings on signup
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
