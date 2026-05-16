import React, { useState } from 'react';
import { ArrowRight, BookOpen, Zap, Trophy, Brain, Users, GraduationCap, Star } from 'lucide-react';

export default function Homepage({ onSignUp }: { onSignUp: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Nav */}
      <header className="relative border-b border-slate-800/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="text-2xl font-black tracking-tighter">
            <GraduationCap size={24} className="inline text-amber-400 mr-2" />
            <span className="text-amber-400">ATHENA</span>
          </div>
          <button onClick={onSignUp} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition-all hover:shadow-lg hover:shadow-amber-500/20">
            Sign In
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-24 pb-32 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block px-4 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-sm font-bold text-amber-300">
                📚 For PLASU Students
              </div>

              <h1 className="text-6xl md:text-7xl font-black leading-tight tracking-tight">
                Master your{' '}
                <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
                  exams
                </span>
              </h1>

              <p className="text-xl text-slate-300 leading-relaxed max-w-xl">
                Gamified study tools designed for PLASU. Tasks, pomodoro sessions, AI tutoring, games, and exam prep that works.
              </p>

              <div className="flex gap-4 flex-wrap">
                <button onClick={onSignUp} className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-lg rounded-lg flex items-center gap-3 transition-all hover:translate-x-1 shadow-xl shadow-amber-500/20">
                  Start Free <ArrowRight size={20} />
                </button>
                <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 border-2 border-slate-600 hover:border-amber-400 text-white font-bold text-lg rounded-lg transition-colors">
                  See Features
                </button>
              </div>

              <div className="text-sm text-slate-400">
                ✓ 500+ PLASU students | ✓ Free & offline-first | ✓ No ads
              </div>
            </div>

            {/* Demo placeholder */}
            <div className="relative aspect-video bg-slate-900/50 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 p-6">
                <Brain size={56} className="text-amber-400 mb-4" />
                <p className="text-slate-300 font-semibold text-center">ATHENA Dashboard</p>
                <p className="text-xs text-slate-500 mt-2">Sign in to access your study tools</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { val: '8,000+', label: 'PLASU Students' },
              { val: '95%', label: 'Pass Rate Target' },
              { val: '50+', label: 'Programs' },
              { val: 'Free', label: 'Monthly Cost' },
            ].map((s, i) => (
              <div key={i} className="bg-slate-900/40 border border-slate-700 rounded-xl p-4 hover:border-amber-400/50 transition-colors group">
                <p className="text-3xl md:text-4xl font-black text-amber-400 group-hover:text-amber-300 transition-colors">{s.val}</p>
                <p className="text-xs text-slate-400 mt-2">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-24 px-6 md:px-12 bg-slate-900/30 border-y border-slate-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-black text-center mb-4 text-white">
            Everything you need to <span className="text-amber-400">ace JAMB/WAEC</span>
          </h2>
          <p className="text-center text-slate-400 mb-16 max-w-2xl mx-auto text-lg">
            Built by students, for students. Real tools that fit your study rhythm.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: <BookOpen size={32} className="text-amber-400" />,
                title: 'Kanban Task Board',
                desc: 'Organize by subject. Drag-drop workflow. Real-time progress.',
              },
              {
                icon: <Zap size={32} className="text-amber-400" />,
                title: 'Pomodoro Focus Timer',
                desc: '25-min study bursts. Earn XP. Gamified consistency.',
              },
              {
                icon: <Trophy size={32} className="text-amber-400" />,
                title: 'Brain Games & Exam Prep',
                desc: 'Chess, Memory, Sudoku + JAMB/WAEC simulator with feedback.',
              },
              {
                icon: <Brain size={32} className="text-amber-400" />,
                title: 'AI Tutor (Gemini/Groq)',
                desc: 'Ask anything. Get instant answers. Personalized explanations.',
              },
              {
                icon: <Users size={32} className="text-amber-400" />,
                title: 'Study With Friends',
                desc: 'Invite classmates. Share materials. Study rooms.',
              },
              {
                icon: <Star size={32} className="text-amber-400" />,
                title: 'Achievements & Leaderboards',
                desc: 'Unlock badges. Climb ranks. Real motivation.',
              },
            ].map((f, i) => (
              <div key={i} className="bg-slate-900/40 border border-slate-700 rounded-2xl p-8 hover:border-amber-400/50 hover:bg-slate-900/60 transition-all group">
                <div className="mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h3 className="text-2xl font-bold mb-3 text-white">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 px-6 md:px-12 max-w-4xl mx-auto text-center">
        <p className="text-2xl text-slate-300 italic font-light mb-6 leading-relaxed">
          "ATHENA's game approach kept me consistent. I went from 45% to 78% in 3 months."
        </p>
        <p className="font-bold text-amber-400 text-lg">— Amina Okafor, PLASU Final Year</p>
      </section>

      {/* CTA Footer */}
      <footer className="relative border-t border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h3 className="text-2xl font-black mb-2 text-white">
              Ready to dominate <span className="text-amber-400">your exams</span>?
            </h3>
            <p className="text-slate-400 text-lg">
              Join PLASU students. Start free. No card needed.
            </p>
          </div>
          <button onClick={onSignUp} className="px-10 py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-lg rounded-lg transition-all hover:scale-105 whitespace-nowrap shadow-xl shadow-amber-500/20">
            Get Started →
          </button>
        </div>
      </footer>
    </div>
  );
}