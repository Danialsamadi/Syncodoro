# Supabase Setup Guide for Syncodoro

This guide explains how to set up Supabase to store and sync all your Pomodoro data, not just authentication.

## What Data Gets Synced

Syncodoro stores and syncs the following data types to Supabase:

### 1. **User Profiles** (`profiles` table)
- Username and display name
- Bio and profile visibility settings
- Public profile sharing preferences

### 2. **Pomodoro Sessions** (`sessions` table)
- Session start/end times and duration
- Session type (pomodoro, short-break, long-break)
- Tags associated with each session
- Session notes and completion status
- All your productivity data and history

### 3. **User Settings** (`user_settings` table)
- Timer durations (pomodoro, short break, long break)
- Auto-start preferences
- Sound and notification settings
- Sessions until long break count

### 4. **Tags** (`tags` table)
- Custom tags for categorizing sessions
- Tag colors and names
- User-specific tag collections

## Setup Instructions

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned
3. Note your project URL and anon key from the API settings

### Step 2: Run Database Schema
1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql` 
4. Click "Run" to create all tables, indexes, and security policies

### Step 3: Configure Authentication Providers
1. Go to Authentication → Providers in your Supabase dashboard
2. Enable Google OAuth:
   - Toggle "Enable Google provider"
   - Add your Google OAuth client ID and secret
   - Set redirect URL to: `http://localhost:3000/dashboard` (for development)
3. Enable GitHub OAuth (optional):
   - Toggle "Enable GitHub provider" 
   - Add your GitHub OAuth app credentials

### Step 4: Set Environment Variables
1. Copy `.env.example` to `.env` in your project root
2. Fill in your actual Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_APP_URL=http://localhost:3000
   ```

## How Data Sync Works

### Offline-First Architecture
- **Local Storage**: All data is stored locally in IndexedDB using Dexie.js
- **Background Sync**: When online, data automatically syncs to Supabase
- **Conflict Resolution**: Local data takes precedence, with server as backup

### Automatic Sync Triggers
- **On Login**: Full sync when user signs in
- **On Network Reconnection**: Sync when going from offline to online
- **Periodic Sync**: Every 5 minutes when online and logged in
- **Manual Sync**: Users can trigger sync via the sync indicator

### Sync Process
1. **Upload Local Changes**: Unsynced local data is uploaded to Supabase
2. **Download Remote Changes**: New server data is downloaded and merged
3. **Mark as Synced**: Successfully synced items are marked to avoid duplicates

### Data Flow Example
```
User creates Pomodoro session
    ↓
Saved to local IndexedDB immediately
    ↓
App continues working offline
    ↓
When online: Session uploaded to Supabase
    ↓
Other devices download the session
    ↓
All devices stay in sync
```

## Security Features

### Row Level Security (RLS)

- Users can only access their own data
- All tables have proper RLS policies to ensure data privacy
- Authentication triggers automatically create user profiles and settings

## Troubleshooting

### Fixing User Settings Sync Issues

If user settings are not being properly saved to Supabase, follow these steps:

1. **Run the SQL scripts in the Supabase SQL Editor**
   - Run `supabase-table-schema.sql` to ensure the table structure is correct
   - Run `supabase-triggers.sql` to set up the necessary triggers
   - Run `supabase-security-fix.sql` to apply security fixes and function definitions
   - Run `supabase-fix-sound-type.sql` to add the missing `sound_type` column (if you're seeing errors about this column)

2. **Manual Fix for Existing Users**:
   - If you already have users without settings records, run this SQL:

   ```sql
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
   SELECT 
     id, 
     25, 
     5, 
     15, 
     4, 
     false, 
     false, 
     true, 
     'beep', 
     true
   FROM auth.users
   WHERE id NOT IN (SELECT user_id FROM public.user_settings);
   ```

3. **Verify Environment Variables**:
   - Ensure your `.env` file has the correct Supabase URL and anon key
   - Restart the application after making changes to environment variables

### Privacy Controls

- Public profiles are viewable by everyone when enabled
- All database operations are secured by user authentication

### Data Privacy
- Sessions, settings, and tags are private by default
- Users control profile visibility
- No data is shared without explicit permission

### Additional Troubleshooting

#### Common Issues

**1. Sync Not Working**
- Check internet connection
- Verify Supabase credentials in `.env`
- Check browser console for error messages

**2. Authentication Errors**
- Ensure OAuth providers are properly configured
- Check redirect URLs match your domain
- Verify client IDs and secrets are correct

**3. Data Not Appearing**
- Check if user is logged in
- Verify RLS policies are set up correctly
- Look for sync errors in browser console

### Debug Sync Status
The app includes a sync indicator that shows:
- 🟢 Online and synced
- 🟡 Syncing in progress  
- 🔴 Offline or sync error
- ⚪ Idle/no sync needed

## Benefits of Full Data Sync

### 1. **Cross-Device Continuity**
- Start a session on your phone, finish on your laptop
- Settings and preferences sync across all devices
- Complete productivity history available everywhere

### 2. **Data Backup & Recovery**
- Your data is safely backed up in Supabase
- Never lose your productivity tracking history
- Easy account recovery on new devices

### 3. **Collaboration Features**
- Share public profiles with productivity stats
- Export data for reporting and analysis
- Future: Team productivity tracking

### 4. **Offline Reliability**
- App works completely offline
- Data syncs automatically when back online
- No interruption to your productivity flow

## Next Steps

1. Run the SQL schema in your Supabase dashboard
2. Configure OAuth providers for authentication
3. Set up your `.env` file with Supabase credentials
4. Test the app - create sessions and watch them sync!

Your Pomodoro data will now be safely stored and synced across all your devices! 🍅✨
