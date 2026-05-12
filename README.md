# ATHENA — AI-Powered Student Success Platform
## Plateau State University, Bokkos Edition

ATHENA is a comprehensive student success platform for Plateau State University (PLASU). It combines task management, Pomodoro study tracking, gamified achievements, cognitive games, and AI assistance to help students achieve their academic goals. Fully offline-capable with localStorage persistence — no backend required.

### Features

- **Kanban Task Manager** — Drag-and-drop columns, overdue flags, priority levels, XP rewards on completion
- **Pomodoro Study Tracker** — 25/5/15 min sessions with Date.now()-delta accuracy, browser notifications, auto-advance after 4 sessions
- **4 Cognitive Games** — Chess (legal-move AI with alpha-beta pruning), Memory Match, Sudoku (unique-solution guaranteed), AI Art Guesser (Groq-powered dynamic challenges)
- **CBT Exam Simulator** — 15 JAMB-style questions across 5 subjects with auto-grading, timer, XP rewards
- **Achievement / XP System** — 14 achievements, level progression, toast notifications on unlock
- **AI Academic Assistant** — Groq-powered (llama-3.3-70b) chat with PLASU context and personality preferences
- **Friends & Study Rooms** — Add friends, see online status, shared study spaces
- **Admin Analytics Panel** — Multi-user overview, tasks by status, CSV export, date range filtering
- **Full Role-Based Access** — Student, Lecturer, and Admin roles with respective portals
- **Keyboard Shortcuts** — g+t → Tasks, g+s → Study, g+g → Games, + shift navigation

### Tech Stack

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS 4, Motion, Recharts
- **AI**: Groq SDK (llama-3.3-70b, mixtral-8x7b, gemma2-9b-it)
- **Games**: Chess.js, custom board renderer
- **Storage**: localStorage (namespace `athena_` prefix, corruption-safe)
- **PWA**: Manifest inline, apple-mobile-web-app meta tags, installable

### Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or build for production
npm run build
npm run preview
```

The app runs fully **offline** — no server or database needed. All data is stored in your browser's localStorage.

### Test Credentials

| Role     | Email                     | Password      |
|----------|---------------------------|---------------|
| Admin    | admin@plasu.edu.ng        | admin123      |
| Lecturer | lecturer@plasu.edu.ng     | lecturer123   |
| Student  | student@plasu.edu.ng      | student123    |

Or register a new account with any email and choose your role during sign-up.

### Deployment

1. Build: `npm run build`
2. Serve the `dist/` folder with any static server:

```bash
npx serve dist -l 80
```

Or deploy to Vercel, Netlify, Cloudflare Pages, or any static host. For the AI features, set `VITE_GROQ_API_KEY` as an environment variable in your deployment platform.
