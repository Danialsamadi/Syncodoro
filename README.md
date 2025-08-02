# Syncodoro - Pomodoro Productivity Tracker

A Progressive Web App (PWA) for tracking Pomodoro sessions with offline-first functionality, analytics, and data export capabilities.

## Features

### Core Timer Features
- ⏱️ Customizable Pomodoro timer (25/5/15 minute defaults)
- 🏷️ Session tagging and categorization
- 🔔 Browser notifications and sound alerts
- ⏸️ Pause, resume, and skip functionality
- 📝 Session notes and completion tracking

### Data Storage & Sync
- 💾 **Offline-first** with IndexedDB storage
- 🔄 **Full data sync** with Supabase backend
- 📊 **All data types synced**: sessions, tags, settings, profiles
- 🌐 **Cross-device sync** - access your data anywhere
- 🔒 **Secure storage** with Row Level Security (RLS)
- 💪 **Works offline** - never lose your productivity flow

### Analytics & Export
- 📊 Productivity analytics and insights
- 📤 Export data (CSV, ICS calendar, reports)
- 📈 Session history and streak tracking
- 🎯 Tag-based productivity analysis

### Social & Sharing
- 👤 Public shareable profiles
- 🔗 Custom profile URLs (/u/username)
- 📱 Progressive Web App (installable)
- 🎨 Modern, responsive UI with Tailwind CSS

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **PWA**: Workbox (Service Workers, Offline caching)
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Local Storage**: IndexedDB using Dexie.js
- **Charts**: Recharts
- **Export**: papaparse (CSV), ics.js (ICS)

## Development Stages

This project is built in incremental stages:

1. ✅ **Stage 1**: Project setup & configuration files
2. ✅ **Stage 2**: Database schema & services (IndexedDB + Supabase)
3. ✅ **Stage 3**: Authentication & contexts (Auth, Sync, Timer)
4. ✅ **Stage 4**: Core timer functionality & basic UI
5. ✅ **Stage 5**: Complete UI components & pages
6. ✅ **Stage 6**: Export functionality (CSV, ICS, Reports)
7. 🔄 **Stage 7**: Analytics dashboard with charts
8. 🔄 **Stage 8**: PWA features & offline functionality
9. 🔄 **Stage 9**: Final deployment & optimization

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure Supabase credentials
4. Start development server: `npm run dev`
5. Build for production: `npm run build`

## Current Status

**Completed Features:**
- ✅ Project setup with Vite, React, TypeScript, Tailwind
- ✅ IndexedDB database with Dexie.js for offline storage
- ✅ Supabase integration for cloud sync and authentication
- ✅ Complete timer functionality with customizable settings
- ✅ Tag system for categorizing sessions
- ✅ Session notes and tracking
- ✅ Dashboard with productivity stats
- ✅ User profile management
- ✅ Public profile sharing
- ✅ Data export (CSV, ICS calendar, detailed reports)
- ✅ Responsive design for mobile and desktop
- ✅ Offline-first architecture

**Next Steps:**
- 📊 Analytics charts with Recharts
- 🔔 Enhanced PWA features
- 🚀 Production deployment

## Environment Setup

Create a `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_URL=http://localhost:3000
```

## License

MIT License
