import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, ArrowRight, ShieldCheck, Zap, Users, Brain, BookOpen, MapPin, Globe, Award, School, Quote, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import Auth from './Auth';

const Landing: React.FC = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const features = [
    { icon: Brain, title: 'AI Insights', desc: 'Personalized tips and weakness detection based on your study habits.' },
    { icon: Zap, title: 'Smart Scheduling', desc: 'Automatically suggests the best times to study for maximum focus.' },
    { icon: Users, title: 'Study Rooms', desc: 'Collaborate with friends and track group productivity in real-time.' },
    { icon: ShieldCheck, title: 'Achievements', desc: 'Earn badges and climb the leaderboard as you crush your goals.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]" />

      <nav className="relative z-10 px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
            <GraduationCap size={20} />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xl sm:text-2xl font-bold gradient-text leading-none">ATHENA</span>
            <span className="text-[8px] sm:text-[10px] text-primary font-semibold uppercase tracking-widest leading-none mt-0.5">PLASU Edition</span>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
          <button onClick={() => { setAuthMode('login'); setShowAuth(true); }}
            className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-primary transition-colors min-h-[44px] px-3">
            Login
          </button>
          <button onClick={() => { setAuthMode('register'); setShowAuth(true); }}
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-primary text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:scale-105 transition-all min-h-[44px] whitespace-nowrap">
            Get Started
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pt-12 sm:pt-20 pb-20 sm:pb-32">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              <Zap size={12} /> Powered by AI for PLASU Students
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-[1.1]">
              Your Intelligent <br />
              <span className="gradient-text">Companion</span> at <br />
              Plateau State University
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-lg leading-relaxed">
              ATHENA helps you master your studies, track your progress, and collaborate with peers using advanced AI-driven insights.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 pt-2 sm:pt-4">
              <button onClick={() => { setAuthMode('register'); setShowAuth(true); }}
                className="btn-primary flex items-center justify-center gap-2 text-sm w-full sm:w-auto min-h-[48px]">
                Create Account <ArrowRight size={18} />
              </button>
              <button onClick={() => { setAuthMode('login'); setShowAuth(true); }}
                className="btn-secondary text-sm w-full sm:w-auto min-h-[48px] flex items-center justify-center">
                Login to Dashboard
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }} className="relative">
            <div className="glass p-4 sm:p-6 md:p-8 rounded-[32px] sm:rounded-[40px] shadow-2xl relative z-10">
              <img src="https://picsum.photos/seed/athena-campus/800/600" alt="ATHENA Dashboard Preview"
                className="rounded-2xl sm:rounded-3xl shadow-lg border border-white/20 w-full h-auto"
                referrerPolicy="no-referrer" width="800" height="600" loading="lazy" />
            </div>
            <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-6 sm:-top-10 -right-4 sm:-right-8 glass p-4 sm:p-5 md:p-6 rounded-2xl shadow-xl z-20">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                  <Zap size={18} />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Focus Score</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-800">9.4/10</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* PLASU Info Section */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mt-16 sm:mt-24">
          <div className="lg:col-span-2 glass p-6 sm:p-8 md:p-10 rounded-[32px] sm:rounded-[40px] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 sm:p-8 opacity-5">
              <School size={100} className="text-primary" />
            </div>
            <div className="relative z-10 space-y-4 sm:space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                <BookOpen size={14} /> About PLASU
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                Plateau State University, Bokkos
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Established in March 2005 and granted recognition by the National Universities Commission (NUC) on April 29, 2005, 
                as the 66th University in Nigeria and the 24th state-owned university. Located in Diram Village along the Butura-Tarangol 
                axis in Bokkos LGA, about 70 km from Jos, the state capital.
              </p>
              <div className="flex flex-wrap gap-4 sm:gap-6 pt-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                  <MapPin size={16} className="text-primary shrink-0" /> Bokkos, Plateau State
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                  <Quote size={16} className="text-primary shrink-0" /> Knowledge, Diligence &amp; Integrity
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                  <Award size={16} className="text-primary shrink-0" /> 66th University in Nigeria
                </div>
              </div>
            </div>
          </div>

          <div className="glass p-6 sm:p-8 md:p-10 rounded-[32px] sm:rounded-[40px] border-l-4 border-primary">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Globe size={18} className="text-primary" /> VC's Message
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
              "It is my pleasure to welcome you to Plateau State University, where our mission is to provide an outstanding 
              educational experience through a flexible and inclusive learning environment."
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] sm:text-xs font-bold text-primary">Prof. Shedrack Gaya Best, PhD</p>
              <p className="text-[10px] text-slate-400">Vice-Chancellor</p>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mt-12 sm:mt-16">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              className="glass p-6 sm:p-8 rounded-3xl hover:translate-y-[-8px] transition-all group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 sm:mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <f.icon size={22} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1 sm:mb-2">{f.title}</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-12 sm:mt-16">
          {[
            { label: 'Students', value: '8,000+' },
            { label: 'Faculties', value: '8' },
            { label: 'Programs', value: '50+' },
            { label: 'Founded', value: '2005' },
          ].map((s, i) => (
            <div key={i} className="glass p-4 sm:p-6 rounded-2xl sm:rounded-3xl text-center">
              <p className="text-2xl sm:text-3xl font-black gradient-text">{s.value}</p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase mt-1 sm:mt-2">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </main>

      <footer className="relative z-10 border-t border-slate-200 py-8 sm:py-12 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <GraduationCap size={18} />
            </div>
            <span className="font-bold text-slate-800 text-sm sm:text-base">ATHENA</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 text-center">
            &copy; 2025 ATHENA &ndash; PLASU Edition | Designed to empower every student at Plateau State University, Bokkos.
          </p>
          <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-slate-400">
            <a href="https://plasu.edu.ng" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">PLASU Website</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showAuth && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowAuth(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md" onClick={e => e.stopPropagation()}>
              <Auth mode={authMode} setMode={setAuthMode} onClose={() => setShowAuth(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Landing;
