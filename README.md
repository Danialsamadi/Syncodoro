# Syncodoro - Pomodoro Productivity Tracker

A Progressive Web App (PWA) for tracking Pomodoro sessions with offline-first functionality, analytics, and data export capabilities.

## Features

- 🍅 **Customizable Pomodoro Timer** - Start/Stop/Reset with session logging
- 🏷️ **Tagging System** - Categorize sessions (Study, Work, etc.)
- 📱 **Offline-First** - Works without internet using IndexedDB
- 🔄 **Cloud Sync** - Syncs data across devices via Supabase
- 🔐 **OAuth Login** - Google/GitHub authentication
- 📊 **Analytics Dashboard** - Visual charts for productivity insights
- 📤 **Export Data** - CSV and ICS calendar exports
- 🌐 **Public Profiles** - Shareable productivity stats
- 📲 **PWA Installable** - Add to home screen on mobile/desktop

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
2. 🔄 **Stage 2**: Database schema & services
3. 🔄 **Stage 3**: Authentication & contexts
4. 🔄 **Stage 4**: Core timer functionality
5. 🔄 **Stage 5**: UI components & layout
6. 🔄 **Stage 6**: Analytics & dashboard
7. 🔄 **Stage 7**: Export functionality
8. 🔄 **Stage 8**: Public profiles
9. 🔄 **Stage 9**: PWA features & deployment

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure Supabase credentials
4. Start development server: `npm run dev`
5. Build for production: `npm run build`

## Environment Setup

Create a `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_URL=http://localhost:3000
```

## License

MIT License
