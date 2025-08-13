-- Create active_timer_state table for syncing timer state between browsers
CREATE TABLE IF NOT EXISTS public.active_timer_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  time_left INTEGER NOT NULL,
  is_running BOOLEAN NOT NULL DEFAULT false,
  is_paused BOOLEAN NOT NULL DEFAULT false,
  current_type TEXT NOT NULL CHECK (current_type IN ('pomodoro', 'short-break', 'long-break')),
  session_count INTEGER NOT NULL DEFAULT 0,
  current_tags TEXT[] DEFAULT '{}',
  session_notes TEXT,
  session_start_time TIMESTAMP WITH TIME ZONE,
  current_session_id UUID,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.active_timer_state ENABLE ROW LEVEL SECURITY;

-- Policy for selecting user's own timer state
CREATE POLICY "Users can view their own timer state" 
  ON public.active_timer_state 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy for inserting user's own timer state
CREATE POLICY "Users can insert their own timer state" 
  ON public.active_timer_state 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy for updating user's own timer state
CREATE POLICY "Users can update their own timer state" 
  ON public.active_timer_state 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS active_timer_state_user_id_idx ON public.active_timer_state (user_id);

-- Grant permissions
GRANT ALL ON public.active_timer_state TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.active_timer_state TO authenticated;
