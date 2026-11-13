/**
 * UniPulse — How to Use Guide
 *
 * An in-app guide/tutorial that helps students and lecturers navigate
 * every feature. Can be opened from a help button or sidebar menu item.
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, ChevronRight, X, HelpCircle, Gamepad2, Brain, CheckSquare, Timer, Trophy, Users, UserCircle, Sparkles, ShieldCheck, Rss, GraduationCap, LayoutDashboard } from 'lucide-react';

const GUIDES = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    color: 'bg-blue-500',
    steps: [
      'Open the sidebar to navigate between sections.',
      'Use the search bar at the top to find content quickly.',
      'Click any card to view more details.',
      'Use the theme toggle to switch between light and dark modes.',
      'On mobile, use the bottom navigation tabs to move between features.',
    ],
  },
  {
    id: 'tasks',
    title: 'Task Board',
    icon: CheckSquare,
    color: 'bg-orange-500',
    steps: [
      'Click "Add Task" to create a new task.',
      'Set a due date and priority level.',
      'Drag and drop tasks between columns (todo, in-progress, done).',
      'Click the pencil icon to edit an existing task.',
      'Click the trash icon to delete a task.',
      'Completed tasks earn XP and unlock achievements.',
    ],
  },
  {
    id: 'study',
    title: 'Study Timer',
    icon: Timer,
    color: 'bg-red-500',
    steps: [
      'Choose a preset session length or set custom time.',
      'Start the timer when you begin studying.',
      'Take breaks between sessions to stay fresh.',
      'Track your study streak across days.',
      'View your study history in the calendar.',
    ],
  },
  {
    id: 'games',
    title: 'Games & Chess',
    icon: Gamepad2,
    color: 'bg-purple-500',
    steps: [
      'Play chess against the AI or a friend.',
      'Use the beginner-friendly difficulty level for learning.',
      'Solve puzzles to improve your tactics.',
      'Check the move history to review your games.',
      'Each game completed earns XP and achievements.',
    ],
  },
  {
    id: 'social',
    title: 'Social',
    icon: Users,
    color: 'bg-pink-500',
    steps: [
      'Browse fellow students and send friend requests.',
      'Use the search and filter tools to find students by interests.',
      'Click on a profile card to view detailed information.',
      'Add students to your study group or message them.',
      'View your friend list in the Social tab.',
    ],
  },
  {
    id: 'content',
    title: 'Content Library',
    icon: BookOpen,
    color: 'bg-green-500',
    steps: [
      'Browse notes, PDFs, links, and slides uploaded by lecturers.',
      'Search by subject, tags, or title.',
      'Download or view content directly from the app.',
      'Add your own content using the upload button.',
      'Organize content into folders or tags for easy access.',
    ],
  },
  {
    id: 'syllabus',
    title: 'Syllabus Manager',
    icon: GraduationCap,
    color: 'bg-indigo-500',
    steps: [
      'View the curriculum for your courses.',
      'See module topics, learning objectives, and required resources.',
      'Use the syllabus as a study guide for exams.',
      'Download the syllabus as a PDF for offline reference.',
      'Contact your lecturer for clarification on any module.',
    ],
  },
  {
    id: 'rss',
    title: 'Education RSS',
    icon: Rss,
    color: 'bg-teal-500',
    steps: [
      'Browse the latest education news from trusted sources.',
      'Use the feed selector to switch between topics.',
      'Click an article to read the full story.',
      'Refresh the feed to get the latest updates.',
      'Save articles to your reading list for later.',
    ],
  },
  {
    id: 'ai',
    title: 'AI Chatbot',
    icon: Brain,
    color: 'bg-cyan-500',
    steps: [
      'Ask questions about your studies, assignments, or campus life.',
      'Use the prompt suggestions for common questions.',
      'The AI can help with study plans, explanations, and more.',
      'If the AI is offline, a friendly message will appear.',
      'Clear the chat history by clicking the clear button.',
    ],
  },
  {
    id: 'achievements',
    title: 'Achievements',
    icon: Trophy,
    color: 'bg-yellow-500',
    steps: [
      'Earn XP by completing tasks, studying, and playing games.',
      'Unlock achievements by reaching milestones.',
      'View your progress on the achievements page.',
      'Share your achievements with friends.',
      'Use the XP to level up and unlock new features.',
    ],
  },
  {
    id: 'profile',
    title: 'Profile & Settings',
    icon: UserCircle,
    color: 'bg-gray-500',
    steps: [
      'Update your bio, interests, and skills.',
      'Change your theme color and font preference.',
      'Set your privacy preferences.',
      'View your stats, XP, and achievements.',
      'Manage your notification settings.',
    ],
  },
  {
    id: 'admin',
    title: 'Admin Panel',
    icon: ShieldCheck,
    color: 'bg-red-600',
    steps: [
      'View all users and their profiles.',
      'Manage lecturer and student accounts.',
      'Review pending management requests.',
      'Approve or reject access requests.',
      'View system logs and activity.',
    ],
  },
];

export const HowToGuide: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>('dashboard');

  if (!user) return null;

  const activeGuide = GUIDES.find(g => g.id === activeId) || GUIDES[0];
  const ActiveIcon = activeGuide.icon;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 p-3 rounded-full bg-[#00843D] text-white shadow-lg hover:bg-[#004E7A] transition-colors"
        aria-label="Open guide"
      >
        <HelpCircle size={24} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">How to Use UniPulse</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-6">
                {GUIDES.map(guide => (
                  <button
                    key={guide.id}
                    onClick={() => setActiveId(guide.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                      activeId === guide.id
                        ? 'border-[#00843D] bg-[#00843D]/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-[#00843D]'
                    }`}
                  >
                    <guide.icon size={20} className="text-[#00843D]" />
                    <span className="text-xs font-medium text-center text-slate-700 dark:text-slate-300">
                      {guide.title}
                    </span>
                  </button>
                ))}
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <ActiveIcon size={28} className="text-[#00843D]" />
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">{activeGuide.title}</h3>
                </div>
                <ol className="space-y-2">
                  {activeGuide.steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#00843D] text-white text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HowToGuide;