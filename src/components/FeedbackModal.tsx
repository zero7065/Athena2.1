import React, { useState } from 'react';
import { Star, X, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { submitFeedback, addXp, checkAndUnlockAchievements, logAudit, FeedbackEntry } from '../lib/storage';

interface FeedbackModalProps {
  onClose: () => void;
  onUnlockAchievement: (a: any) => void;
}

const categories = ['General', 'Feature Request', 'Bug Report', 'Study Tools', 'AI Chat', 'Games', 'UI/UX'];

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose, onUnlockAchievement }) => {
  const { user, appData, updateAppData, addUserXp } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [category, setCategory] = useState('General');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) return;
    const fb: FeedbackEntry = {
      id: Date.now().toString(),
      userId: user?.studentId || '',
      userName: user?.name || '',
      userEmail: user?.email || '',
      rating,
      comment,
      category,
      createdAt: Date.now(),
    };
    submitFeedback(fb);

    updateAppData(prev => {
      let data = { ...prev, user: { ...prev.user, feedbackCount: (prev.user.feedbackCount || 0) + 1 } };
      if (rating === 5) data.user.gaveFiveStar = true;
      data = addXp(data, 25);
      const checked = checkAndUnlockAchievements(data);
      if (checked.newlyUnlocked.length > 0) {
        setTimeout(() => checked.newlyUnlocked.forEach(a => onUnlockAchievement(a)), 500);
      }
      return checked.data;
    });

    if (user) logAudit(user.email, user.name, 'feedback', `Rating: ${rating}/5, Category: ${category}`);

    setSubmitted(true);
    setTimeout(onClose, 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-t-[32px] sm:rounded-[32px] shadow-2xl w-full sm:max-w-md sm:m-4 animate-slide-up"
        onClick={e => e.stopPropagation()}>
        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
              <Send size={28} className="text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Thank You!</h3>
            <p className="text-sm text-slate-500">Your feedback helps us improve ATHENA. +25 XP earned!</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Rate Your Experience</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                <X size={20} />
              </button>
            </div>

            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setRating(n)} onMouseEnter={() => setHoverRating(n)} onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-all hover:scale-110 min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <Star size={36} className={`transition-colors ${n <= (hoverRating || rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                </button>
              ))}
            </div>

            {rating > 0 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(c => (
                      <button key={c} onClick={() => setCategory(c)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${category === c ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea placeholder={rating <= 2 ? "What went wrong? How can we improve?" : "What do you love? Any suggestions?"}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary h-24 resize-none text-base"
                  value={comment} onChange={e => setComment(e.target.value)} />

                <div className="flex gap-3">
                  <button onClick={onClose}
                    className="flex-1 py-3 font-bold text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Skip</button>
                  <button onClick={handleSubmit}
                    className="flex-1 py-3 font-bold text-sm bg-primary text-white rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                    <Send size={16} /> Submit
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 text-center">+25 XP for submitting feedback</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
