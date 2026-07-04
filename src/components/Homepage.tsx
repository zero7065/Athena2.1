/*
 * ATHENA - Student Success Platform
 * Section: HOMEPAGE
 *
 * Plateau State University branded landing page.
 * Features: university imagery, student interaction, events, dark/light toggle
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight, BookOpen, Clock, Users, BarChart3, Brain, GraduationCap,
  Star, MapPin, Quote, Award, ChevronRight, Sun, Moon,
  Calendar, ChevronLeft, Sparkles, Zap, Trophy, ExternalLink, ChevronLeftCircle, ChevronRightCircle
} from 'lucide-react';

const carouselImages = [
  { src: 'https://images.unsplash.com/photo-1523050854058-8df90110c7f1?w=800&h=600&fit=crop', caption: 'PLASU Campus — Main Gate' },
  { src: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop', caption: 'University Library' },
  { src: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=600&fit=crop', caption: 'Graduation Ceremony' },
  { src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop', caption: 'Students Studying Together' },
  { src: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop', caption: 'Lecture Hall Session' },
  { src: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&h=600&fit=crop', caption: 'Library Reading Room' },
  { src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop', caption: 'Group Discussion' },
  { src: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&h=600&fit=crop', caption: 'Science Laboratory' },
  { src: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop', caption: 'Exam Preparation' },
  { src: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop', caption: 'Student Writing Exam' },
  { src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop', caption: 'Academic Achievement' },
  { src: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop', caption: 'Lecturer Teaching' },
  { src: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=800&h=600&fit=crop', caption: 'Computer Lab' },
  { src: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=800&h=600&fit=crop', caption: 'Collaborative Learning' },
  { src: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=600&fit=crop', caption: 'Campus Life' },
  { src: 'https://images.unsplash.com/photo-1526603426857-2da4c34c34ae?w=800&h=600&fit=crop', caption: 'Research & Innovation' },
];

// Animated counter hook
function useCountUp(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!startOnView) {
      animate();
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          animate();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  function animate() {
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  return { count, ref };
}

// Typewriter text effect
function useTypewriter(texts: string[], speed: number = 60, deleteSpeed: number = 30, pauseTime: number = 2000) {
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < texts[textIndex].length) {
          setDisplayText(prev => prev + texts[textIndex][charIndex]);
          setCharIndex(prev => prev + 1);
        } else {
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        if (charIndex > 0) {
          setDisplayText(prev => prev.slice(0, -1));
          setCharIndex(prev => prev - 1);
        } else {
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex, texts, speed, deleteSpeed, pauseTime]);

  return displayText;
}

// Testimonial carousel
const testimonials = [
  {
    quote: "ATHENA's gamified approach kept me consistent. I went from struggling to stay organized to having a perfect study routine.",
    name: "Amina Okafor",
    role: "Computer Science, Year 3",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  },
  {
    quote: "The AI tutor is a game-changer. I can ask questions anytime and get instant explanations. My GPA improved significantly.",
    name: "David Adewale",
    role: "Mathematics, Year 2",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    quote: "Study rooms with friends kept me accountable. We compete on leaderboards and share materials. Best study tool I've ever used.",
    name: "Grace Nnamdi",
    role: "Biology, Year 4",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
];

// Events data
const events = [
  { title: "Semester Exams Start", date: "June 15, 2025", type: "academic", color: "from-red-500 to-orange-500" },
  { title: "AI Study Workshop", date: "May 28, 2025", type: "workshop", color: "from-blue-500 to-cyan-500" },
  { title: "Project Submission Deadline", date: "July 1, 2025", type: "deadline", color: "from-purple-500 to-pink-500" },
  { title: "Matriculation Ceremony", date: "August 10, 2025", type: "event", color: "from-emerald-500 to-green-500" },
];

interface HomepageProps {
  onSignUp: () => void;
  onLecturer?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export default function Homepage({ onSignUp, onLecturer, theme = 'dark', onToggleTheme }: HomepageProps) {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval>>(null);
  const imageAutoRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(autoPlayRef.current);
  }, []);

  useEffect(() => {
    imageAutoRef.current = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(imageAutoRef.current);
  }, []);

  const goToImage = (index: number) => {
    setActiveImage(index);
    if (imageAutoRef.current) {
      clearInterval(imageAutoRef.current);
      imageAutoRef.current = setInterval(() => {
        setActiveImage((prev) => (prev + 1) % carouselImages.length);
      }, 4000);
    }
  };

  const prevImage = () => {
    setActiveImage((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
    if (imageAutoRef.current) {
      clearInterval(imageAutoRef.current);
      imageAutoRef.current = setInterval(() => {
        setActiveImage((prev) => (prev + 1) % carouselImages.length);
      }, 4000);
    }
  };

  const nextImage = () => {
    setActiveImage((prev) => (prev + 1) % carouselImages.length);
    if (imageAutoRef.current) {
      clearInterval(imageAutoRef.current);
      imageAutoRef.current = setInterval(() => {
        setActiveImage((prev) => (prev + 1) % carouselImages.length);
      }, 4000);
    }
  };

  const typedText = useTypewriter(
    ['organize your coursework', 'track your progress', 'ace your exams', 'collaborate with peers'],
    70, 35, 1800
  );

  const students = useCountUp(8000, 2500);
  const features = useCountUp(50, 2000);
  const studyHours = useCountUp(15000, 3000);
  const xpEarned = useCountUp(500000, 3000);

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen ${isLight ? 'bg-white text-slate-900' : 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white'} overflow-x-hidden`}>

      {/* Animated background particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full ${isLight ? 'bg-emerald-200/30' : 'bg-emerald-500/10'}`}
            style={{
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${15 + Math.random() * 25}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
            50% { transform: translateY(-100px) scale(1.5); opacity: 0.8; }
          }
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(0, 132, 61, 0.2); }
            50% { box-shadow: 0 0 40px rgba(0, 132, 61, 0.4); }
          }
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-slide-up { animation: slide-up 0.6s ease-out; }
          .animate-fade-in { animation: fade-in 0.8s ease-out; }
          .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        `}</style>
      </div>

      {/* Navbar */}
      <header className={`relative z-50 ${isLight ? 'bg-white/80 border-b border-emerald-100' : 'bg-slate-950/80 border-b border-slate-800/50'} backdrop-blur-xl sticky top-0`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 ${isLight ? 'bg-emerald-600' : 'bg-[#00843D]'}`}>
                <GraduationCap size={22} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className={`text-lg sm:text-xl font-black tracking-tight leading-none ${isLight ? 'text-emerald-800' : 'text-white'}`}>ATHENA</span>
                <span className={`text-[8px] font-bold uppercase tracking-[0.2em] leading-none mt-0.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>PLASU Edition</span>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Theme toggle */}
              {onToggleTheme && (
                <button
                  onClick={onToggleTheme}
                  className={`p-2.5 rounded-xl transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
                    isLight
                      ? 'hover:bg-emerald-100 text-emerald-600'
                      : 'hover:bg-slate-800 text-amber-400'
                  }`}
                  aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
                >
                  {isLight ? <Moon size={20} /> : <Sun size={20} />}
                </button>
              )}

              {/* CTA buttons */}
              <button
                onClick={onSignUp}
                className={`px-4 sm:px-6 py-2.5 font-bold rounded-xl transition-all text-sm whitespace-nowrap min-h-[44px] ${
                  isLight
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20'
                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/20'
                }`}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="relative z-10 pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left content */}
            <div className="space-y-6 sm:space-y-8 animate-slide-up">
              <div className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                isLight ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              }`}>
                <Zap size={14} /> Powered by AI for PLASU Students
              </div>

              <h1 className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Your Intelligent{' '}
                <br />
                <span className={isLight ? 'text-emerald-600' : 'text-emerald-400'}>Companion</span> at{' '}
                <br />
                Plateau State University
              </h1>

              <div className={`text-lg sm:text-xl lg:text-2xl ${isLight ? 'text-slate-500' : 'text-slate-300'} font-medium`}>
                AI-powered tools to{' '}
                <span className={`font-bold ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>
                  {typedText}
                </span>
                <span className="animate-pulse">|</span>
              </div>

              <p className={`text-base sm:text-lg leading-relaxed max-w-lg ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                ATHENA helps you master your studies, track your progress, and collaborate with peers using advanced AI-driven insights — built specifically for PLASU.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <button
                  onClick={onSignUp}
                  className={`flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 font-bold text-sm sm:text-base rounded-xl transition-all min-h-[48px] shadow-xl ${
                    isLight
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 hover:translate-y-[-2px]'
                      : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/30 hover:translate-y-[-2px]'
                  }`}
                >
                  <GraduationCap size={20} /> Student Sign In
                </button>
                <button
                  onClick={onLecturer}
                  className={`flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 font-bold text-sm sm:text-base rounded-xl transition-all min-h-[48px] shadow-xl ${
                    isLight
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30 hover:translate-y-[-2px]'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30 hover:translate-y-[-2px]'
                  }`}
                >
                  <BookOpen size={20} /> Lecturer Portal
                </button>
                <button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className={`flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 font-bold text-sm sm:text-base rounded-xl transition-all min-h-[48px] ${
                    isLight
                      ? 'border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                      : 'border-2 border-slate-600 text-slate-300 hover:border-emerald-500 hover:text-emerald-400'
                  }`}
                >
                  Explore Features <ChevronRight size={20} />
                </button>
              </div>

              <div className={`flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                <span className="flex items-center gap-1.5">✓ 8,000+ PLASU Students</span>
                <span className="flex items-center gap-1.5">✓ Free & Offline-First</span>
                <span className="flex items-center gap-1.5">✓ No Credit Card</span>
              </div>
            </div>

            {/* Right - Image Carousel */}
            <div className="relative animate-fade-in">
              <div className={`relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl ${
                isLight ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-900/50 border border-slate-700'
              }`}>
                <div className="aspect-[4/3] relative overflow-hidden">
                  {carouselImages.map((img, i) => (
                    <img key={i}
                      src={img.src}
                      alt={img.caption}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                        i === activeImage ? 'opacity-80' : 'opacity-0'
                      }`}
                      loading="lazy"
                    />
                  ))}
                  <div className={`absolute inset-0 bg-gradient-to-tr ${
                    isLight ? 'from-emerald-900/70 via-emerald-800/30 to-transparent' : 'from-slate-950/80 via-blue-950/40 to-transparent'
                  }`} />

                  {/* Caption */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={14} className="text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Plateau State University, Bokkos</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">{carouselImages[activeImage].caption}</h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1">Est. 2005 — 66th University in Nigeria</p>
                  </div>

                  {/* Arrows */}
                  <button onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 text-white/80 hover:bg-black/50 transition-all min-h-[36px] min-w-[36px] flex items-center justify-center">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 text-white/80 hover:bg-black/50 transition-all min-h-[36px] min-w-[36px] flex items-center justify-center">
                    <ChevronRight size={18} />
                  </button>

                  {/* Dots */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {carouselImages.slice(0, 8).map((_, i) => (
                      <button key={i} onClick={() => goToImage(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          i === activeImage
                            ? 'bg-white w-4'
                            : 'bg-white/40 hover:bg-white/60'
                        }`} />
                    ))}
                    {carouselImages.length > 8 && <span className="text-[10px] text-white/60 self-center">+{carouselImages.length - 8}</span>}
                  </div>

                  {/* Floating stat badge */}
                  <div className={`absolute top-3 right-3 px-3 py-2 rounded-xl backdrop-blur-md ${
                    isLight ? 'bg-white/80' : 'bg-slate-900/80'
                  } shadow-lg border ${isLight ? 'border-emerald-200' : 'border-slate-700'}`}>
                    <div className="flex items-center gap-2">
                      <Trophy size={16} className="text-emerald-500" />
                      <span className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>Top 5% National</span>
                    </div>
                  </div>

                  {/* Image counter */}
                  <div className="absolute bottom-16 right-4 px-2 py-1 rounded-lg bg-black/40 text-white text-[10px] font-bold">
                    {activeImage + 1} / {carouselImages.length}
                  </div>
                </div>
              </div>

              {/* Floating card - student count */}
              <div className={`absolute -bottom-4 -left-4 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md border ${
                isLight ? 'bg-white/90 border-emerald-200' : 'bg-slate-900/90 border-slate-700'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                    <Users size={20} className="text-white" />
                  </div>
                  <div>
                    <p className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{students.count.toLocaleString()}+</p>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Students Strong</p>
                  </div>
                </div>
              </div>

              {/* Floating card - AI */}
              <div className={`absolute -top-4 -right-4 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md border ${
                isLight ? 'bg-white/90 border-emerald-200' : 'bg-slate-900/90 border-slate-700'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                    <Brain size={20} className="text-slate-950" />
                  </div>
                  <div>
                    <p className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>AI-Powered</p>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>24/7 Tutoring</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section ref={students.ref} className={`relative z-10 py-16 sm:py-20 ${isLight ? 'bg-emerald-50/50' : 'bg-slate-900/30'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {[
              { icon: Users, value: `${students.count.toLocaleString()}+`, label: 'PLASU Students', color: 'text-emerald-500' },
              { icon: BookOpen, value: `${features.count}+`, label: 'Academic Programs', color: 'text-blue-500' },
              { icon: Clock, value: `${studyHours.count.toLocaleString()}+`, label: 'Study Hours Tracked', color: 'text-amber-500' },
              { icon: Star, value: `${(xpEarned.count / 1000).toFixed(0)}K+`, label: 'XP Earned', color: 'text-purple-500' },
            ].map((s, i) => (
              <div key={i} className={`text-center p-4 sm:p-6 rounded-2xl ${isLight ? 'bg-white border border-emerald-100' : 'bg-slate-900/50 border border-slate-800'} hover:scale-105 transition-transform`}>
                <s.icon size={28} className={`${s.color} mx-auto mb-3`} />
                <p className={`text-2xl sm:text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{s.value}</p>
                <p className={`text-xs sm:text-sm font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className={`relative z-10 py-16 sm:py-24 ${isLight ? 'bg-white' : 'bg-slate-950'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-4 ${
              isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
            }`}>
              <Sparkles size={14} /> Everything You Need
            </div>
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Built for <span className={isLight ? 'text-emerald-600' : 'text-emerald-400'}>PLASU Students</span>
            </h2>
            <p className={`text-base sm:text-lg mt-3 max-w-2xl mx-auto ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Real tools that fit your study rhythm. Track tasks, stay focused, compete with friends, and get AI-powered tutoring.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: BookOpen, title: 'Smart Task Board', desc: 'Drag-and-drop kanban. Organize by subject. Never miss a deadline.', color: 'from-emerald-500 to-green-500' },
              { icon: Clock, title: 'Focus Timer', desc: 'Pomodoro technique optimized for academic sessions. 25 min work, 5 min break.', color: 'from-blue-500 to-cyan-500' },
              { icon: Brain, title: 'AI Study Assistant', desc: 'Ask anything. Get instant answers powered by Groq AI. Available 24/7.', color: 'from-purple-500 to-pink-500' },
              { icon: Trophy, title: 'Gamified Learning', desc: 'Earn XP. Unlock achievements. Compete on leaderboards. Stay motivated.', color: 'from-amber-500 to-orange-500' },
              { icon: Users, title: 'Study Together', desc: 'Connect with classmates. Create study rooms. Share materials in real-time.', color: 'from-rose-500 to-red-500' },
              { icon: BarChart3, title: 'Progress Analytics', desc: 'Track your growth. View study streaks. Monitor your academic performance.', color: 'from-indigo-500 to-violet-500' },
            ].map((f, i) => (
              <div
                key={i}
                className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all hover:translate-y-[-4px] cursor-default ${
                  isLight
                    ? 'bg-emerald-50 border border-emerald-100 hover:shadow-xl hover:shadow-emerald-500/10'
                    : 'bg-slate-900/50 border border-slate-800 hover:shadow-xl hover:shadow-emerald-500/5'
                }`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br ${f.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon size={24} className="text-white" />
                </div>
                <h3 className={`text-lg sm:text-xl font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>{f.title}</h3>
                <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== UNIVERSITY INFO + EVENTS ===== */}
      <section className={`relative z-10 py-16 sm:py-24 ${isLight ? 'bg-emerald-50/50' : 'bg-slate-900/30'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* University info */}
            <div className={`lg:col-span-2 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 relative overflow-hidden ${
              isLight ? 'bg-white border border-emerald-100' : 'bg-slate-900/50 border border-slate-800'
            }`}>
              <div className={`absolute top-0 right-0 p-6 sm:p-8 opacity-5`}>
                <GraduationCap size={120} className={isLight ? 'text-emerald-600' : 'text-emerald-400'} />
              </div>
              <div className="relative z-10 space-y-4 sm:space-y-5">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                  isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/10 text-emerald-300'
                }`}>
                  <BookOpen size={14} /> About PLASU
                </div>
                <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Plateau State University, Bokkos
                </h2>
                <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Established in March 2005 and granted recognition by the National Universities Commission (NUC) on April 29, 2005,
                  as the 66th University in Nigeria and the 24th state-owned university. Located in Diram Village along the Butura-Tarangol
                  axis in Bokkos LGA, about 70 km from Jos, the state capital.
                </p>
                <div className="flex flex-wrap gap-4 sm:gap-6 pt-2">
                  <div className={`flex items-center gap-2 text-xs sm:text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <MapPin size={16} className="text-emerald-500 shrink-0" /> Bokkos, Plateau State
                  </div>
                  <div className={`flex items-center gap-2 text-xs sm:text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Quote size={16} className="text-emerald-500 shrink-0" /> Knowledge, Diligence & Integrity
                  </div>
                  <div className={`flex items-center gap-2 text-xs sm:text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Award size={16} className="text-emerald-500 shrink-0" /> 66th University in Nigeria
                  </div>
                </div>
              </div>
            </div>

            {/* Events sidebar */}
            <div className={`rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border-l-4 ${
              isLight ? 'bg-white border-emerald-500' : 'bg-slate-900/50 border-emerald-500'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <Calendar size={20} className="text-emerald-500" />
                <h3 className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Upcoming Events</h3>
              </div>
              <div className="space-y-4">
                {events.map((event, i) => (
                  <div key={i} className="flex gap-3 group cursor-pointer">
                    <div className={`w-1.5 rounded-full bg-gradient-to-b ${event.color} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold group-hover:${isLight ? 'text-emerald-600' : 'text-emerald-400'} transition-colors ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                        {event.title}
                      </p>
                      <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{event.date}</p>
                    </div>
                    <ChevronRight size={16} className={`${isLight ? 'text-slate-400' : 'text-slate-600'} group-hover:translate-x-1 transition-transform`} />
                  </div>
                ))}
              </div>
              <button className={`mt-6 text-xs font-bold flex items-center gap-1 transition-colors ${
                isLight ? 'text-emerald-600 hover:text-emerald-700' : 'text-emerald-400 hover:text-emerald-300'
              }`}>
                View Full Calendar <ExternalLink size={12} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className={`relative z-10 py-16 sm:py-24 ${isLight ? 'bg-white' : 'bg-slate-950'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-4 ${
            isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
          }`}>
            <Quote size={14} /> Student Voices
          </div>
          <h2 className={`text-3xl sm:text-4xl font-black mb-8 sm:mb-12 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Trusted by <span className={isLight ? 'text-emerald-600' : 'text-emerald-400'}>PLASU Students</span>
          </h2>

          <div className="relative">
            <div className={`rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 ${isLight ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-900/50 border border-slate-800'}`}>
              <div className="flex items-center justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className={`text-lg sm:text-xl md:text-2xl italic leading-relaxed mb-8 transition-opacity ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                "{testimonials[activeTestimonial].quote}"
              </p>
              <div className="flex items-center justify-center gap-4">
                <img
                  src={testimonials[activeTestimonial].avatar}
                  alt={testimonials[activeTestimonial].name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
                />
                <div className="text-left">
                  <p className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{testimonials[activeTestimonial].name}</p>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{testimonials[activeTestimonial].role}</p>
                </div>
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === activeTestimonial
                      ? (isLight ? 'bg-emerald-600 w-8' : 'bg-emerald-400 w-8')
                      : (isLight ? 'bg-emerald-200' : 'bg-slate-700')
                  }`}
                />
              ))}
            </div>

            {/* Nav buttons */}
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={() => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className={`p-2 rounded-xl transition-all ${
                  isLight ? 'hover:bg-emerald-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length)}
                className={`p-2 rounded-xl transition-all ${
                  isLight ? 'hover:bg-emerald-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA FOOTER ===== */}
      <footer className={`relative z-10 ${isLight ? 'bg-emerald-900 text-white' : 'bg-slate-950 border-t border-slate-800'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main CTA */}
          <div className={`py-16 sm:py-20 text-center border-b ${isLight ? 'border-emerald-800' : 'border-slate-800'}`}>
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={14} /> Start Your Journey
              </div>
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black ${isLight ? 'text-white' : 'text-white'}`}>
                Ready to Transform Your <span className="text-emerald-400">Academic Life</span>?
              </h2>
              <p className={`text-base sm:text-lg ${isLight ? 'text-emerald-200' : 'text-slate-400'} max-w-xl mx-auto`}>
                Join thousands of PLASU students already using ATHENA to organize, focus, and excel. Free to start.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button
                  onClick={onSignUp}
                  className={`px-8 py-4 font-bold text-lg rounded-xl transition-all min-h-[48px] ${
                    isLight
                      ? 'bg-white text-emerald-900 hover:bg-emerald-50 shadow-xl hover:scale-105'
                      : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xl shadow-amber-500/20 hover:scale-105'
                  }`}
                >
                  <GraduationCap size={20} className="inline mr-2" /> Student Access
                </button>
                <button
                  onClick={onLecturer}
                  className={`px-8 py-4 font-bold text-lg rounded-xl transition-all min-h-[48px] ${
                    isLight
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 hover:scale-105'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 hover:scale-105'
                  }`}
                >
                  <BookOpen size={20} className="inline mr-2" /> Lecturer Portal
                </button>
                <button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className={`px-8 py-4 font-bold text-lg rounded-xl transition-all min-h-[48px] border-2 ${
                    isLight
                      ? 'border-emerald-400 text-emerald-200 hover:bg-emerald-800'
                      : 'border-slate-600 text-slate-300 hover:border-emerald-500'
                  }`}
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>

          {/* Bottom footer */}
          <div className="py-8 sm:py-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <GraduationCap size={18} className="text-white" />
              </div>
              <span className={`font-bold text-sm ${isLight ? 'text-emerald-200' : 'text-white'}`}>ATHENA — PLASU Edition</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-md bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center text-white text-[6px] font-bold">J</div>
                <span className="text-[9px] font-bold tracking-wider text-emerald-400">JADAI STUDIOS</span>
              </div>
              <p className={`text-xs text-center ${isLight ? 'text-emerald-300' : 'text-slate-500'}`}>
                &copy; 2025 ATHENA — Designed to empower every student at Plateau State University, Bokkos.
              </p>
            </div>
            <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm font-medium">
              <a href="https://plasu.edu.ng" target="_blank" rel="noopener noreferrer" className={`transition-colors ${isLight ? 'text-emerald-300 hover:text-white' : 'text-slate-400 hover:text-emerald-400'}`}>
                PLASU Website
              </a>
              <a href="#" className={`transition-colors ${isLight ? 'text-emerald-300 hover:text-white' : 'text-slate-400 hover:text-emerald-400'}`}>
                Privacy
              </a>
              <a href="#" className={`transition-colors ${isLight ? 'text-emerald-300 hover:text-white' : 'text-slate-400 hover:text-emerald-400'}`}>
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}