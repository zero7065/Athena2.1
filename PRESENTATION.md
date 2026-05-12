# ATHENA: Empowering PLASU Students

## Stakeholder Presentation Summary

### The Problem
Students at Plateau State University struggle with time management, focus, and tracking academic progress across multiple subjects. Tools are fragmented — Google Classroom for assignments, WhatsApp for study groups, paper notes for planning. No single platform connects tasks, study habits, and performance data.

### The Solution: ATHENA
ATHENA is a centralized platform that acts as a digital academic companion. It combines task management, Pomodoro study tracking, gamified achievements, and AI-powered assistance into one cohesive experience. Every interaction earns XP and contributes to the student's growth profile.

### Key Value Propositions

1. **AI-Powered Assistance** — Groq-powered chat assistant with real PLASU context. Helps with coursework, study strategies, and university inquiries.
2. **Gamified Engagement** — 14 achievements, level progression, XP economy across tasks, study sessions, and games.
3. **Cognitive Training** — Chess AI, Sudoku, Memory Match, and AI Art Guesser built in as study break activities that sharpen focus.
4. **JAMB Preparation** — Built-in CBT exam simulator with 15 practice questions across 5 subjects, auto-grading, and XP rewards.
5. **Role-Based Access** — Student, Lecturer, and Admin portals with distinct views and permissions.
6. **Fully Offline-Capable** — No backend required. All data persists in browser localStorage. Deploy as static site anywhere.

### Visual Identity
The platform uses PLASU's official green (#00843D) and gold (#FFD700), combined with glassmorphism (backdrop-blur, frosted panels, subtle shadows) for a modern, professional feel. Supports dark mode.

### Architecture
- **Single-page application** built with React 19 + TypeScript + Vite
- **Tailwind CSS 4** for responsive design (320px to 1440px)
- **Groq API** for AI chat and dynamic game content
- **localStorage** for persistence with namespace prefix and corruption recovery
- **PWA-ready** with manifest, apple-mobile-web-app meta, installable offline

### Deployment
Static build output in `dist/`. Deploy to any static host (Vercel, Netlify, Cloudflare Pages) or serve with `npx serve dist`.

Set `VITE_GROQ_API_KEY` as an environment variable on your deployment platform for AI features.
