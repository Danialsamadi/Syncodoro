
# Syncodoro

> A modern, offline-first Progressive Web App for supercharged productivity tracking

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8.svg)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-enabled-5a0fc8.svg)](https://web.dev/progressive-web-apps/)

Syncodoro transforms the classic Pomodoro Technique into a feature-rich, cloud-synced productivity platform. Track your focus sessions, analyze your patterns, and stay productive—online or offline.

## ✨ Features

### 🎯 Core Functionality
- **Smart Timer System** - Customizable Pomodoro, short break, and long break durations
- **Session Tracking** - Detailed logs with notes, tags, and timestamps
- **Tag Organization** - Categorize and filter your work sessions
- **Offline-First** - Full functionality without internet connection

### 📊 Analytics & Insights
- **Productivity Dashboard** - Visual stats and session summaries
- **Data Visualization** - Interactive charts powered by Recharts
- **Progress Tracking** - Monitor trends and patterns over time

### 🔄 Sync & Export
- **Cloud Synchronization** - Real-time sync across all your devices via Supabase
- **Multiple Export Formats** - CSV for data analysis, ICS for calendar integration
- **Detailed Reports** - Comprehensive productivity reports

### 👤 User Features
- **Authentication** - Secure login and profile management
- **Public Profiles** - Share your productivity stats (optional)
- **Customizable Settings** - Tailor the app to your workflow

### 📱 Progressive Web App
- **Install Anywhere** - Works on desktop, mobile, and tablet
- **Offline Support** - Service workers with smart caching
- **Native Experience** - App-like feel on all platforms

## 🚀 Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **State Management** | React Context API |
| **Database** | IndexedDB (Dexie.js), PostgreSQL (Supabase) |
| **Authentication** | Supabase Auth |
| **PWA** | Workbox, Service Workers |
| **Charts** | Recharts |
| **Export** | papaparse (CSV), ics.js (Calendar) |

## 📦 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Supabase account (for cloud features)

### Installation

```bash
# Clone the repository
git clone https://github.com/Danialsamadi/Syncodoro.git
cd Syncodoro

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_URL=http://localhost:3000
```

### Build for Production

```bash
npm run build
npm run preview
```

## 🏗️ Project Architecture

```
syncodoro/
├── src/
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React contexts (Auth, Sync, Timer)
│   ├── services/          # Database & API services
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Route pages
│   ├── types/             # TypeScript definitions
│   └── utils/             # Helper functions
├── public/                # Static assets & PWA files
└── supabase/              # Database migrations & functions
```

## 📈 Development Stages

This project follows an incremental development approach:

- [x] **Stage 1** - Project setup & configuration
- [x] **Stage 2** - Database schema & services (IndexedDB + Supabase)
- [x] **Stage 3** - Authentication & contexts
- [x] **Stage 4** - Core timer functionality
- [x] **Stage 5** - Complete UI components & pages
- [x] **Stage 6** - Export functionality (CSV, ICS, Reports)
- [ ] **Stage 7** - Analytics dashboard with charts
- [ ] **Stage 8** - PWA features & offline functionality
- [ ] **Stage 9** - Final deployment & optimization

## 🎨 Key Features Showcase

### Offline-First Architecture
Syncodoro works seamlessly without internet. All data is stored locally in IndexedDB and syncs automatically when online.

### Smart Sync System
Conflict resolution and intelligent merging ensure your data stays consistent across devices.

### Export & Integration
Export your productivity data in multiple formats:
- **CSV** - For spreadsheet analysis
- **ICS** - Import sessions into your calendar
- **Reports** - Detailed productivity summaries

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Pomodoro Technique® by Francesco Cirillo
- Built with modern web technologies
- Inspired by productivity enthusiasts worldwide

## 📧 Contact

**Danial Samadi** - [@Danialsamadi](https://github.com/Danialsamadi)

Project Link: [https://github.com/Danialsamadi/Syncodoro](https://github.com/Danialsamadi/Syncodoro)

---

⭐ Star this repo if you find it useful!

---
