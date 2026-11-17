import React, { useMemo, useRef, useState } from 'react';
import {
  MessageCircle, Heart, Share2, Send, Trash2, Pencil, Check, X,
  Sparkles, Trophy, BookOpen, Award, Timer, HelpCircle, Users,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import {
  getPosts, createPost, toggleLike, addComment, deleteComment,
  deletePost, editPost, sharePost, type SocialPost, type PostType,
} from '../lib/social';

const TYPE_META: Record<PostType, { icon: React.ElementType; label: string; color: string }> = {
  update: { icon: Users, label: 'Update', color: 'text-slate-500' },
  achievement: { icon: Trophy, label: 'Achievement', color: 'text-amber-500' },
  resource: { icon: BookOpen, label: 'Resource', color: 'text-emerald-500' },
  result: { icon: Award, label: 'Result', color: 'text-blue-500' },
  study: { icon: Timer, label: 'Study', color: 'text-indigo-500' },
  question: { icon: HelpCircle, label: 'Question', color: 'text-rose-500' },
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}

const Avatar: React.FC<{ name: string; size?: string }> = ({ name, size = 'w-10 h-10' }) => (
  <div className={cn(size, 'rounded-xl bg-gradient-to-br from-[#00843D] to-emerald-500 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm')}>
    {name?.[0]?.toUpperCase() || '?'}
  </div>
);

const CampusFeed: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<SocialPost[]>(() => getPosts());
  const [composer, setComposer] = useState('');
  const [composerType, setComposerType] = useState<PostType>('update');
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const me = useMemo(
    () => ({ name: user?.name || 'You', email: user?.email || 'you@local' }),
    [user?.name, user?.email]
  );

  const submitPost = () => {
    const text = composer.trim();
    if (!text) return;
    createPost({ authorName: me.name, authorEmail: me.email, authorRole: user?.role, text, type: composerType });
    setPosts(getPosts());
    setComposer('');
    setComposerType('update');
  };

  const like = (id: string) => setPosts(toggleLike(id, me.email, me.name));
  const comment = (id: string) => {
    const next = addComment(id, me, commentDraft);
    setPosts(next);
    setCommentDraft('');
  };
  const removePost = (id: string) => setPosts(deletePost(id, me.email));
  const saveEdit = (id: string) => {
    setPosts(editPost(id, me.email, editDraft));
    setEditingId(null);
    setEditDraft('');
  };

  const share = async (post: SocialPost) => {
    const res = await sharePost(post, me);
    setPosts(getPosts());
    setShareMsg(res.shared ? 'Shared!' : 'Link copied to clipboard');
    setTimeout(() => setShareMsg(null), 2200);
  };

  return (
    <div className="p-3 sm:p-5 md:p-8 space-y-4 max-w-3xl mx-auto h-full overflow-y-auto">
      <header>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
          <Sparkles size={26} className="text-primary" /> Campus Feed
        </h1>
        <p className="text-sm text-slate-500">Share progress, ask questions, and cheer on your classmates.</p>
      </header>

      {/* Composer */}
      <div className="glass rounded-[24px] p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Avatar name={me.name} />
          <textarea
            ref={composerRef}
            value={composer}
            onChange={e => setComposer(e.target.value)}
            placeholder={`What's on your mind, ${me.name.split(' ')[0]}? Share an update, a resource, or a question…`}
            className="flex-1 min-h-[76px] resize-none bg-transparent outline-none text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(Object.keys(TYPE_META) as PostType[]).map(t => {
            const meta = TYPE_META[t];
            const Icon = meta.icon;
            const active = composerType === t;
            return (
              <button
                key={t}
                onClick={() => setComposerType(t)}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all min-h-[36px]',
                  active ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary'
                )}
              >
                <Icon size={12} /> {meta.label}
              </button>
            );
          })}
          <button
            onClick={submitPost}
            disabled={!composer.trim()}
            className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-emerald-700 transition-all min-h-[40px] disabled:opacity-40"
          >
            <Send size={14} /> Post
          </button>
        </div>
      </div>

      {shareMsg && (
        <div className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2">
          {shareMsg}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="glass p-10 rounded-[24px] text-center text-slate-400">
          <Sparkles size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">The feed is quiet. Be the first to post.</p>
        </div>
      ) : (
        posts.map(post => {
          const meta = TYPE_META[post.type] || TYPE_META.update;
          const Icon = meta.icon;
          const liked = post.likes.includes(me.email);
          const mine = post.authorEmail === me.email;
          const showComments = openComments === post.id;
          return (
            <article key={post.id} className="glass rounded-[24px] p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <Avatar name={post.authorName} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{post.authorName}</p>
                    <span className={cn('text-[10px] font-bold uppercase tracking-wider flex items-center gap-1', meta.color)}>
                      <Icon size={11} /> {meta.label}
                    </span>
                    <span className="text-[10px] text-slate-400">· {timeAgo(post.createdAt)}</span>
                  </div>
                  {post.meta && <p className="text-[10px] text-slate-400 mt-0.5">{post.meta}</p>}

                  {editingId === post.id ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={editDraft}
                        onChange={e => setEditDraft(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-primary resize-none min-h-[70px]"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(post.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-[11px] font-bold min-h-[34px]"><Check size={13} /> Save</button>
                        <button onClick={() => setEditingId(null)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px] font-bold min-h-[34px]"><X size={13} /> Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-700 dark:text-slate-200 mt-1.5 whitespace-pre-wrap break-words">{post.text}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => like(post.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all min-h-[36px]',
                    liked ? 'text-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  <Heart size={14} className={liked ? 'fill-rose-500' : ''} /> {post.likes.length || ''} Like
                </button>
                <button
                  onClick={() => { setOpenComments(showComments ? null : post.id); setCommentDraft(''); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all min-h-[36px]"
                >
                  <MessageCircle size={14} /> {post.comments.length || ''} Comment
                </button>
                <button
                  onClick={() => share(post)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all min-h-[36px]"
                >
                  <Share2 size={14} /> {post.shares || ''} Share
                </button>
                {mine && editingId !== post.id && (
                  <>
                    <button
                      onClick={() => { setEditingId(post.id); setEditDraft(post.text); }}
                      className="ml-auto p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Edit post"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => removePost(post.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Delete post"
                    >
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>

              {/* Comments */}
              {showComments && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  {post.comments.length === 0 && <p className="text-[11px] text-slate-400 italic">No comments yet — start the discussion.</p>}
                  {post.comments.map(c => (
                    <div key={c.id} className="flex items-start gap-2 group">
                      <Avatar name={c.authorName} size="w-7 h-7" />
                      <div className="min-w-0 flex-1">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                          <p className="text-[11px] font-bold text-slate-800 dark:text-white">
                            {c.authorName} <span className="text-[9px] font-medium text-slate-400 ml-1">{timeAgo(c.createdAt)}</span>
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 break-words">{c.text}</p>
                        </div>
                      </div>
                      {c.authorEmail === me.email && (
                        <button
                          onClick={() => setPosts(deleteComment(post.id, c.id, me.email))}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete comment"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-1">
                    <Avatar name={me.name} size="w-7 h-7" />
                    <input
                      value={commentDraft}
                      onChange={e => setCommentDraft(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') comment(post.id); }}
                      placeholder="Write a comment…"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-primary min-h-[38px]"
                    />
                    <button
                      onClick={() => comment(post.id)}
                      disabled={!commentDraft.trim()}
                      className="p-2 rounded-xl bg-primary text-white disabled:opacity-40 min-h-[38px] min-w-[38px] flex items-center justify-center"
                      aria-label="Send comment"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })
      )}
    </div>
  );
};

export default CampusFeed;
