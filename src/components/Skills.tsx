import { useState, useMemo } from 'react';
import { BookOpen, Sparkles, TrendingUp, Zap, Timer, Brain, GraduationCap, Code, Award, Mic, Globe } from 'lucide-react';
import { getSkillProgress, updateSkillXp, DEFAULT_SKILLS } from '../lib/storage';
import { cn } from '../lib/utils';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Programming: Code,
  Mathematics: Zap,
  Physics: AtomIconPlaceholder,
  Chemistry: FlaskIconPlaceholder,
  Biology: LeafIconPlaceholder,
  Communication: Mic,
  Tools: Timer,
};

function AtomIconPlaceholder() { return <Globe size={20} className="text-blue-400" />; }
function FlaskIconPlaceholder() { return <Zap size={20} className="text-amber-400" />; }
function LeafIconPlaceholder() { return <Brain size={20} className="text-emerald-400" />; }

interface SkillsProps {}

const SKILL_XP_GAIN = 15;

const Skills: React.FC<SkillsProps> = () => {
  const [skills, setSkills] = useState(getSkillProgress());
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  const categories = useMemo(() => {
    return [...new Set(skills.map(s => s.category))];
  }, [skills]);

  const skillsByCategory = useMemo(() => {
    return categories.map(cat => ({
      category: cat,
      skills: skills.filter(s => s.category === cat),
    }));
  }, [categories, skills]);

  const totalSkills = skills.length;
  const masteredSkills = skills.filter(s => s.level >= 5).length;
  const avgLevel = skills.length > 0 ? skills.reduce((acc, s) => acc + s.level, 0) / skills.length : 0;
  const totalXp = skills.reduce((acc, s) => acc + s.xp, 0);

  const handlePractice = (skillId: string) => {
    const { skills: updated, leveledUp } = updateSkillXp(skillId, SKILL_XP_GAIN);
    setSkills(updated);
    if (leveledUp) {
      // Re-fetch to reflect any persistence
      setTimeout(() => setSkills(getSkillProgress()), 100);
    }
  };

  const handleToggleExpand = (id: string) => {
    setExpandedSkill(expandedSkill === id ? null : id);
  };

  return (
    <div className="p-3 sm:p-5 md:p-8 space-y-4 sm:space-y-6 h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <BookOpen size={28} className="text-primary" /> Skills Mastery
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Track your abilities, level up, and match skills to courses.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="glass p-3 sm:p-4 rounded-2xl flex items-center gap-2 sm:gap-3 border-primary/20">
            <Sparkles size={20} className="text-primary" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Level</p>
              <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">{Math.floor(avgLevel)}/5</p>
            </div>
          </div>
          <div className="glass p-3 sm:p-4 rounded-2xl flex items-center gap-2 sm:gap-3 border-amber-500/20">
            <Award size={20} className="text-amber-500" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Mastered</p>
              <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">{masteredSkills}/{totalSkills}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Overview */}
      <div className="glass p-4 sm:p-5 rounded-[24px] sm:rounded-[32px]">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[{
            label: 'Total Skills', value: totalSkills, icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10'
          }, {
            label: 'Mastered', value: masteredSkills, icon: Award, color: 'text-amber-500', bg: 'bg-amber-50'
          }, {
            label: 'Avg Level', value: avgLevel.toFixed(1), icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50'
          }, {
            label: 'Skill XP', value: totalXp, icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50'
          }].map((s, i) => (
            <div key={i} className="p-3 sm:p-4 rounded-xl flex items-center gap-3 sm:gap-4 border border-slate-100 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50">
              <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0", s.bg, s.color)}>
                <s.icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{s.label}</p>
                <p className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Sections */}
      <div className="space-y-4">
        {skillsByCategory.map((catGroup) => {
          const CatIcon = CATEGORY_ICONS[catGroup.category] || BookOpen;
          return (
            <section key={catGroup.category} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <CatIcon size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white">{catGroup.category}</h3>
                    <p className="text-[10px] text-slate-400 font-medium">{catGroup.skills.length} skills</p>
                  </div>
                </div>
                <button onClick={() => handleToggleExpand(catGroup.category)}
                  className="text-[10px] font-bold text-primary hover:text-emerald-700 transition-colors flex items-center gap-1">
                  {expandedSkill === catGroup.category ? 'Collapse' : 'Expand'} <span className="text-xs">{expandedSkill === catGroup.category ? '▲' : '▼'}</span>
                </button>
              </div>
              {expandedSkill === catGroup.category && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {catGroup.skills.map((skill) => {
                    const pct = skill.xp;
                    return (
                      <div key={skill.id} className="glass-card p-4 sm:p-5 rounded-[24px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-primary shrink-0">
                              <Sparkles size={18} />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">{skill.name}</h4>
                              <p className="text-[10px] text-slate-400 font-medium">{skill.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-primary">
                            <span>Lv {skill.level}</span>
                            {skill.level >= 5 && <span className="text-amber-500">★</span>}
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 mb-3 overflow-hidden border border-slate-200 dark:border-slate-600">
                          <div className={`h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-2">
                          <span>{pct}% to next level</span>
                          <span>{skill.lastPracticed ? 'Practiced' : 'Not started'}</span>
                        </div>
                        <button onClick={() => handlePractice(skill.id)}
                          className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-primary text-primary font-bold text-xs sm:text-sm hover:bg-primary hover:text-white transition-all min-h-[44px] flex items-center justify-center gap-2">
                          <Zap size={14} /> Practice Skill
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Skill-to-Course Matching */}
      <div className="glass p-4 sm:p-5 rounded-[24px] sm:rounded-[32px]">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap size={20} className="text-indigo-500" />
          <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white">Recommended Courses for Your Skills</h3>
        </div>
        <p className="text-[11px] text-slate-500 mb-4">Courses that help you level up the skills you're practicing.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {DEFAULT_SKILLS.slice(0, 6).map((skill) => (
            <div key={skill.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">{skill.name}</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-bold">Courses</span>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-2 mb-3">Build your {skill.name.toLowerCase()} skill through targeted coursework and practice.</p>
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                <Sparkles size={12} className="text-indigo-400" />
                <span>Start learning</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Skills;
