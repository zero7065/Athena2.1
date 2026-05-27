import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Clock, Trophy, CheckCircle2, ChevronRight, ChevronLeft, RotateCcw, BookOpen, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { safeGroq } from '../lib/groq';

interface Question {
  id: number;
  subject: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

const QUESTION_BANK: Question[] = [
  { id: 1, subject: 'Mathematics', question: 'If log₁₀2 = 0.3010 and log₁₀3 = 0.4771, find log₁₀6 without using tables.', options: ['0.7781', '0.7782', '0.7780', '0.1761'], answer: 0, explanation: 'log₁₀6 = log₁₀(2×3) = log₁₀2 + log₁₀3 = 0.3010 + 0.4771 = 0.7781' },
  { id: 2, subject: 'Mathematics', question: 'The sum of the interior angles of a regular polygon is 1080°. How many sides does it have?', options: ['6', '7', '8', '10'], answer: 2, explanation: '(n-2) × 180° = 1080°, n-2 = 6, n = 8' },
  { id: 3, subject: 'English', question: 'Choose the option nearest in meaning: The teacher said the student was "indefatigable" in his efforts.', options: ['Lazy', 'Tireless', 'Careless', 'Brilliant'], answer: 1, explanation: 'Indefatigable means never showing signs of tiredness — tireless.' },
  { id: 4, subject: 'English', question: 'Pick the correct spelling:', options: ['Accommodation', 'Acommodation', 'Accomodation', 'Acomodation'], answer: 0, explanation: 'The correct spelling is A-c-c-o-m-m-o-d-a-t-i-o-n (double c, double m).' },
  { id: 5, subject: 'Physics', question: 'A body is projected vertically upward with a speed of 20 m/s. How high will it rise? (g = 10 m/s²)', options: ['10 m', '20 m', '30 m', '40 m'], answer: 1, explanation: 'v² = u² - 2gs, 0 = 400 - 20s, s = 20 m' },
  { id: 6, subject: 'Physics', question: 'The resultant of two forces 5N and 12N acting at right angles is:', options: ['7N', '13N', '17N', '60N'], answer: 1, explanation: 'R² = 5² + 12² = 25 + 144 = 169, R = 13N' },
  { id: 7, subject: 'Chemistry', question: 'Which of the following is a strong acid?', options: ['CH₃COOH', 'H₂CO₃', 'HCl', 'H₂O'], answer: 2, explanation: 'HCl (hydrochloric acid) completely dissociates in water, making it a strong acid.' },
  { id: 8, subject: 'Chemistry', question: 'The number of moles in 36g of water (H₂O) is: [H=1, O=16]', options: ['1', '2', '3', '4'], answer: 1, explanation: 'Molar mass of H₂O = 18g/mol. 36g ÷ 18g/mol = 2 moles.' },
  { id: 9, subject: 'Biology', question: 'The organelle responsible for energy production in cells is the:', options: ['Nucleus', 'Ribosome', 'Mitochondrion', 'Golgi body'], answer: 2, explanation: 'The mitochondrion is the powerhouse of the cell, generating ATP through cellular respiration.' },
  { id: 10, subject: 'Biology', question: 'What is the main function of red blood cells?', options: ['Fight infection', 'Carry oxygen', 'Clot blood', 'Produce antibodies'], answer: 1, explanation: 'Red blood cells contain hemoglobin which binds and transports oxygen throughout the body.' },
  { id: 11, subject: 'Mathematics', question: 'Find the value of x if 2x + 5 = 3x - 7.', options: ['10', '11', '12', '13'], answer: 2, explanation: '2x + 5 = 3x - 7, 5 + 7 = 3x - 2x, x = 12' },
  { id: 12, subject: 'English', question: 'Choose the correct preposition: He is interested _____ learning programming.', options: ['in', 'on', 'at', 'for'], answer: 0, explanation: 'The correct phrase is "interested in" something.' },
  { id: 13, subject: 'Physics', question: 'The S.I. unit of force is:', options: ['Joule', 'Newton', 'Watt', 'Pascal'], answer: 1, explanation: 'Force is measured in Newtons (N). 1N = 1kg·m/s².' },
  { id: 14, subject: 'Chemistry', question: 'The pH of a neutral solution is:', options: ['0', '7', '14', '1'], answer: 1, explanation: 'A neutral solution has pH 7 at 25°C. pH < 7 is acidic, pH > 7 is alkaline.' },
  { id: 15, subject: 'Biology', question: 'Which vitamin is produced when the skin is exposed to sunlight?', options: ['Vitamin A', 'Vitamin B', 'Vitamin C', 'Vitamin D'], answer: 3, explanation: 'Sunlight triggers vitamin D synthesis in the skin, essential for calcium absorption.' },
];

const SUBJECTS = ['All', 'Mathematics', 'English', 'Physics', 'Chemistry', 'Biology'];

const FALLBACK_QUESTIONS: Question[] = QUESTION_BANK.slice(0, 3);

const generateQuestions = async (subject: string): Promise<Question[]> => {
  const prompt = subject === 'All'
    ? 'Generate 10 JAMB-style exam questions covering Mathematics, English, Physics, Chemistry, and Biology. Mix subjects evenly.'
    : `Generate 10 JAMB-style exam questions for the subject: ${subject}.`;
  const result = await safeGroq(
    'You are a JAMB exam question generator for Nigerian university entrance exams. Return ONLY a JSON array of objects with fields: id (number), subject (string), question (string), options (string array of 4), answer (number index 0-3), explanation (string). No markdown, no code fences, pure JSON array only.',
    prompt,
    'mixtral-8x7b-32768',
    JSON.stringify(FALLBACK_QUESTIONS),
  );
  try {
    const cleaned = result.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed as Question[];
    return FALLBACK_QUESTIONS;
  } catch {
    return FALLBACK_QUESTIONS;
  }
};

const CBTExam: React.FC = () => {
  const { addUserXp, updateAppData } = useAuth();
  const [subject, setSubject] = useState('All');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [questions, setQuestions] = useState<Question[]>(QUESTION_BANK);
  const [generating, setGenerating] = useState(true);
  const [genError, setGenError] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const filteredQuestions = useMemo(() =>
    subject === 'All' ? questions : questions.filter(q => q.subject === subject),
    [subject, questions]
  );

  const handleGenerate = useCallback(async (subj?: string) => {
    setGenerating(true);
    setGenError('');
    const targetSubject = subj || subject;
    const generated = await generateQuestions(targetSubject);
    if (generated.length > 0) {
      setQuestions(generated);
    } else {
      setGenError('Failed to generate questions. Using default set.');
    }
    setGenerating(false);
  }, [subject]);

  useEffect(() => {
    if (!started && !finished) {
      handleGenerate(subject);
    }
  }, [subject]);

  const handleStart = () => {
    setStarted(true);
    setTimeLeft(20 * 60);
    setAnswers({});
    setCurrentQ(0);
    setFinished(false);
    setShowResults(false);
  };

  useEffect(() => {
    if (!started || finished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, finished]);

  const handleAnswer = (idx: number) => {
    if (finished) return;
    setAnswers(prev => ({ ...prev, [currentQ]: idx }));
  };

  const handleFinish = useCallback(() => {
    setFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const score = useMemo(() => {
    if (!finished) return 0;
    return questions.reduce((sum, q, i) => sum + (answers[i] === q.answer ? 1 : 0), 0);
  }, [finished, questions, answers]);

  useEffect(() => {
    if (finished && !showResults) {
      setShowResults(true);
      const xpEarned = Math.round((score / questions.length) * 100);
      addUserXp(xpEarned);
      updateAppData(prev => ({ ...prev, gameScores: { ...prev.gameScores, cbtExam: (prev.gameScores.cbtExam || 0) + 1 } }));
    }
  }, [finished, showResults, score, questions.length, addUserXp, updateAppData]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto py-8">
        <div className="flex flex-wrap justify-center gap-2 p-1 glass rounded-2xl">
          {SUBJECTS.map(s => (
            <button key={s} onClick={() => setSubject(s)}
              className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px]", subject === s ? "bg-primary text-white shadow-md" : "text-slate-500")}>{s}</button>
          ))}
        </div>

        <div className="glass p-6 sm:p-10 rounded-[40px] text-center space-y-6 max-w-md w-full">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto">
            <BookOpen size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">CBT Exam Simulator</h2>
            <p className="text-sm text-slate-500 mt-2">Test your knowledge with JAMB-style questions</p>
          </div>
          {generating ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 size={32} className="animate-spin text-primary" />
              <p className="text-sm text-slate-500">Generating questions with AI...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-lg font-bold text-primary">{questions.length}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Questions</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-lg font-bold text-primary">20</p>
                  <p className="text-[10px] text-slate-400 font-medium">Minutes</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-lg font-bold text-primary">{subject}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Subject</p>
                </div>
              </div>
              {genError && <p className="text-xs text-red-500">{genError}</p>}
              <button onClick={handleStart} className="w-full btn-primary py-3 sm:py-4 text-base min-h-[48px]">Start Exam</button>
              <button onClick={() => handleGenerate(subject)}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-primary border-2 border-primary/30 rounded-2xl hover:bg-primary/5 transition-all min-h-[48px]">
                <Sparkles size={16} /> Generate New Set
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (showResults) {
    const pct = Math.round((score / questions.length) * 100);
    const grade = pct >= 70 ? 'A' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 40 ? 'D' : 'F';
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto py-4">
        <div className="glass p-6 sm:p-10 rounded-[40px] text-center space-y-6 max-w-md w-full">
          <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mx-auto",
            pct >= 50 ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500")}>
            {pct >= 50 ? <Trophy size={40} /> : <AlertCircle size={40} />}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Exam Complete!</h2>
            <p className="text-4xl font-black gradient-text mt-3">{score}/{questions.length}</p>
            <p className="text-lg font-bold mt-1">{pct}% &mdash; Grade {grade}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <p className="text-[10px] text-slate-400 font-medium uppercase">XP Earned</p>
              <p className="text-lg font-bold text-primary">+{Math.round((score / questions.length) * 100)}</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <p className="text-[10px] text-slate-400 font-medium uppercase">Time Used</p>
              <p className="text-lg font-bold text-primary">{formatTime(20 * 60 - timeLeft)}</p>
            </div>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto text-left">
            {questions.map((q, i) => (
              <div key={q.id} className={cn("p-3 rounded-xl border text-xs",
                answers[i] === q.answer ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20" : "bg-red-50 border-red-200 dark:bg-red-900/20")}>
                <p className="font-bold mb-1">{i + 1}. {q.question}</p>
                <p className="text-slate-500">Correct: {q.options[q.answer]}</p>
              </div>
            ))}
          </div>
          <button onClick={() => { setStarted(false); setShowResults(false); }}
            className="w-full btn-secondary flex items-center justify-center gap-2 py-3 text-sm min-h-[44px]">
            <RotateCcw size={16} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];
  if (!q) return null;

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between w-full max-w-2xl">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Clock size={18} className={timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-primary'} />
          <span className={timeLeft < 300 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}>{formatTime(timeLeft)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
          <span>{currentQ + 1}/{questions.length}</span>
          <span className="text-xs text-slate-400">({Object.keys(answers).length} answered)</span>
        </div>
      </div>

      <div className="w-full max-w-2xl bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
        <div className="h-full bg-primary transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
      </div>

      <div className="glass p-5 sm:p-8 rounded-[32px] sm:rounded-[40px] w-full max-w-2xl space-y-6">
        <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-wider">
          <BookOpen size={14} /> {q.subject}
        </div>
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 dark:text-white leading-relaxed">
          {currentQ + 1}. {q.question}
        </h3>
        <div className="space-y-3">
          {q.options.map((opt, idx) => (
            <button key={idx} onClick={() => handleAnswer(idx)}
              className={cn(
                "w-full p-3 sm:p-4 rounded-2xl text-left transition-all border-2 text-sm sm:text-base min-h-[48px]",
                answers[currentQ] === idx
                  ? "bg-primary text-white border-primary shadow-md"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary text-slate-700 dark:text-slate-200"
              )}>
              <span className="font-bold mr-3">{String.fromCharCode(65 + idx)}.</span> {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between w-full max-w-2xl gap-3">
        <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}
          className="px-4 sm:px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-30 min-h-[44px] flex items-center gap-2">
          <ChevronLeft size={16} /> Previous
        </button>

        <div className="flex gap-1 max-w-[200px] overflow-x-auto px-2">
          {questions.map((_, i) => (
            <button key={i} onClick={() => setCurrentQ(i)}
              className={cn(
                "w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[10px] sm:text-xs font-bold transition-all shrink-0",
                currentQ === i ? "bg-primary text-white" :
                answers[i] !== undefined ? "bg-primary/20 text-primary" :
                "bg-slate-100 dark:bg-slate-800 text-slate-400"
              )}>
              {i + 1}
            </button>
          ))}
        </div>

        {currentQ < questions.length - 1 ? (
          <button onClick={() => setCurrentQ(currentQ + 1)}
            className="px-4 sm:px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all min-h-[44px] flex items-center gap-2">
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={handleFinish}
            className="px-4 sm:px-6 py-3 rounded-xl bg-primary text-white text-xs sm:text-sm font-bold hover:bg-emerald-700 transition-all min-h-[44px] flex items-center gap-2">
            Submit <CheckCircle2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default CBTExam;
