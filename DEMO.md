# ATHENA Demo Guide

### 1. Login / Register
- Open the app and click "Get Started" or "Login".
- Use the test credentials shown on the login form, or register a new account.
- Choose your role: Student, Lecturer, or Admin.

### 2. Dashboard
- View your XP bar, streak, and level progress.
- Quick-access widgets: AI assistant, task preview, focus score, achievements.
- Real PLASU info section with VC's message and university statistics.

### 3. Task Management
- Go to **Tasks** from the navigation.
- Create a new task with title, priority, and due date.
- On desktop: drag between To Do / In Progress / Done columns.
- On mobile: tap the chevron on a task, then "Move to...".
- Overdue tasks show a red flag. Completing a task awards +25 XP.

### 4. Study Tracker (Pomodoro)
- Start a 25-minute work session.
- Timer uses requestAnimationFrame with Date.now() delta for accuracy.
- On completion: log your subject, earn +50 XP.
- After 4 sessions, a 15-minute long break is offered.
- Browser notifications fire on session complete.

### 5. Games Center
- **Chess AI**: Click a piece to select, click a highlighted square to move. AI plays legal moves using material evaluation. Share game via clipboard (PGN + FEN).
- **Memory Match**: Flip cards to find pairs. Completion awards +50 XP.
- **Sudoku**: 3 difficulty levels. Conflicts highlighted in real-time. Unique solution guaranteed.
- **AI Art Guesser**: Guess the prompt that generated each image. Use the Groq-powered "Get Hint" button. Each playthrough generates fresh challenges.
- **CBT Exam**: 15 JAMB-style questions across 5 subjects. 20-minute timer. Auto-graded with XP rewards.

### 6. Achievements
- 14 achievements across tasks, Pomodoro, games, streaking, and XP milestones.
- Progress bar shows level and XP toward next level.
- Toast notification on every unlock.

### 7. AI Academic Assistant
- Ask questions about your courses, study tips, or PLASU.
- Powered by Groq (llama-3.3-70b). Press `?` for keyboard shortcuts.

### 8. Social
- Add friends by their registered name.
- Remove friends with confirmation.
- See online/offline status.

### 9. Profile
- Edit name, department, year of study.
- Choose AI personality (Charming / Strict / Sarcastic / Zen).
- Pick accent color from 8 options.
- Toggle anonymous mode.

### 10. Admin Panel (Admin role only)
- View registered users, task stats, XP totals, games played.
- Date range filter on tasks.
- Export CSV with all analytics.
- User list from all registered accounts.

### Keyboard Shortcuts
Press `g` then a key:
- `g+d` → Dashboard
- `g+t` → Tasks
- `g+s` → Study
- `g+g` → Games
- `g+a` → Achievements
- `g+f` → Friends
- `g+p` → Profile
- Press `?` for help
