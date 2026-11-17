/**
 * AcademiaIQ — Campus Social Layer
 *
 * Local-first social graph: posts, likes, comments and shares persisted in
 * localStorage so the feed feels alive with no backend. When the API backend
 * is connected (VITE_API_BASE), these same shapes map 1:1 onto server tables.
 */

const POSTS_KEY = 'unipulse_posts';
const NOTIF_KEY = 'unipulse_notifications';

export type PostType = 'update' | 'achievement' | 'resource' | 'result' | 'study' | 'question';

export interface SocialComment {
  id: string;
  authorName: string;
  authorEmail: string;
  text: string;
  createdAt: number;
}

export interface SocialPost {
  id: string;
  authorName: string;
  authorEmail: string;
  authorRole?: string;
  type: PostType;
  text: string;
  meta?: string;
  link?: string;
  createdAt: number;
  likes: string[];
  comments: SocialComment[];
  shares: number;
}

export interface SocialNotification {
  id: string;
  forEmail: string;
  fromName: string;
  kind: 'like' | 'comment' | 'share' | 'achievement';
  text: string;
  postId?: string;
  createdAt: number;
  read: boolean;
}

/* ------------------------------------------------------------------ */
/* Storage                                                             */
/* ------------------------------------------------------------------ */

export function getPosts(): SocialPost[] {
  try {
    const raw = localStorage.getItem(POSTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.sort((a, b) => b.createdAt - a.createdAt);
    }
  } catch { /* seed below */ }
  const seeded = seedPosts();
  savePosts(seeded);
  return seeded.sort((a, b) => b.createdAt - a.createdAt);
}

function savePosts(posts: SocialPost[]) {
  try { localStorage.setItem(POSTS_KEY, JSON.stringify(posts)); } catch { /* ignore */ }
}

export function getNotifications(email?: string): SocialNotification[] {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    const all: SocialNotification[] = raw ? JSON.parse(raw) : [];
    return (email ? all.filter(n => n.forEmail === email) : all).sort((a, b) => b.createdAt - a.createdAt);
  } catch { return []; }
}

function saveNotifications(list: SocialNotification[]) {
  try { localStorage.setItem(NOTIF_KEY, JSON.stringify(list.slice(0, 100))); } catch { /* ignore */ }
}

function pushNotification(n: Omit<SocialNotification, 'id' | 'createdAt' | 'read'>) {
  const all = getNotifications();
  all.unshift({ ...n, id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, createdAt: Date.now(), read: false });
  saveNotifications(all);
}

export function markNotificationsRead(email: string) {
  const all = getNotifications();
  const updated = all.map(n => (n.forEmail === email ? { ...n, read: true } : n));
  saveNotifications(updated);
}

export function unreadNotificationCount(email?: string): number {
  return getNotifications(email).filter(n => !n.read).length;
}

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

export function createPost(input: {
  authorName: string;
  authorEmail: string;
  authorRole?: string;
  text: string;
  type?: PostType;
  meta?: string;
  link?: string;
}): SocialPost {
  const all = getPosts();
  const post: SocialPost = {
    id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    authorName: input.authorName,
    authorEmail: input.authorEmail,
    authorRole: input.authorRole,
    type: input.type || 'update',
    text: input.text,
    meta: input.meta,
    link: input.link,
    createdAt: Date.now(),
    likes: [],
    comments: [],
    shares: 0,
  };
  savePosts([post, ...all]);
  return post;
}

export function deletePost(postId: string, email: string): SocialPost[] {
  const all = getPosts().filter(p => !(p.id === postId && p.authorEmail === email));
  savePosts(all);
  return all;
}

export function editPost(postId: string, email: string, text: string): SocialPost[] {
  const all = getPosts().map(p => (p.id === postId && p.authorEmail === email ? { ...p, text } : p));
  savePosts(all);
  return all;
}

export function toggleLike(postId: string, userEmail: string, userName: string): SocialPost[] {
  const all = getPosts().map(p => {
    if (p.id !== postId) return p;
    const liked = p.likes.includes(userEmail);
    if (!liked && p.authorEmail !== userEmail) {
      pushNotification({ forEmail: p.authorEmail, fromName: userName, kind: 'like', text: `liked your post`, postId });
    }
    return { ...p, likes: liked ? p.likes.filter(e => e !== userEmail) : [...p.likes, userEmail] };
  });
  savePosts(all);
  return all;
}

export function addComment(postId: string, user: { name: string; email: string }, text: string): SocialPost[] {
  const trimmed = text.trim();
  if (!trimmed) return getPosts();
  const all = getPosts().map(p => {
    if (p.id !== postId) return p;
    const comment: SocialComment = {
      id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      authorName: user.name,
      authorEmail: user.email,
      text: trimmed,
      createdAt: Date.now(),
    };
    if (p.authorEmail !== user.email) {
      pushNotification({ forEmail: p.authorEmail, fromName: user.name, kind: 'comment', text: `commented: "${trimmed.slice(0, 60)}"`, postId });
    }
    return { ...p, comments: [...p.comments, comment] };
  });
  savePosts(all);
  return all;
}

export function deleteComment(postId: string, commentId: string, userEmail: string): SocialPost[] {
  const all = getPosts().map(p => {
    if (p.id !== postId) return p;
    return { ...p, comments: p.comments.filter(c => !(c.id === commentId && c.authorEmail === userEmail)) };
  });
  savePosts(all);
  return all;
}

/** Share: web-share when available, returns a copyable URL otherwise. */
export async function sharePost(post: SocialPost, user: { name: string; email: string }): Promise<{ shared: boolean; url: string }> {
  const url = `${location.origin}${location.pathname}#/feed?post=${post.id}`;
  const title = `${post.authorName} on AcademiaIQ`;
  try {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      await (navigator as any).share({ title, text: post.text, url });
      bumpShare(post);
      return { shared: true, url };
    }
  } catch { /* user cancelled → fall through to copy */ }
  try { await navigator.clipboard.writeText(url); } catch { /* ignore */ }
  bumpShare(post);
  if (post.authorEmail !== user.email) {
    pushNotification({ forEmail: post.authorEmail, fromName: user.name, kind: 'share', text: 'shared your post', postId: post.id });
  }
  return { shared: false, url };
}

function bumpShare(post: SocialPost) {
  const all = getPosts().map(p => (p.id === post.id ? { ...p, shares: p.shares + 1 } : p));
  savePosts(all);
}

/* ------------------------------------------------------------------ */
/* Seeded campus feed (classmates)                                     */
/* ------------------------------------------------------------------ */

const HOUR = 3600000;

function seedPosts(): SocialPost[] {
  const now = Date.now();
  const mk = (
    i: number,
    authorName: string,
    authorEmail: string,
    type: PostType,
    text: string,
    meta: string | undefined,
    hoursAgo: number,
    likes: number,
    comments: Array<[string, string, string]>
  ): SocialPost => ({
    id: `seed_p_${i}`,
    authorName,
    authorEmail,
    authorRole: 'student',
    type,
    text,
    meta,
    createdAt: now - hoursAgo * HOUR,
    likes: Array.from({ length: likes }, (_, k) => `seedlike${i}_${k}@unipulse.io`),
    comments: comments.map(([n, e, t], ci) => ({
      id: `seed_c_${i}_${ci}`,
      authorName: n,
      authorEmail: e,
      text: t,
      createdAt: now - hoursAgo * HOUR + (ci + 1) * 600000,
    })),
    shares: Math.floor(likes / 3),
  });

  return [
    mk(1, 'Amina Bello', 'amina.bello@unipulse.io', 'achievement', 'Just unlocked the "Task Master" badge — 5 tasks done this week!', 'Achievement · Task Master', 1, 12, [['David Adewale', 'david.adewale@unipulse.io', 'Congrats Amina! 🎉'], ['Grace Okonkwo', 'grace.okonkwo@unipulse.io', 'Well deserved.']]),
    mk(2, 'David Adewale', 'david.adewale@unipulse.io', 'study', 'Finished a 2h focus session on Calculus II. Focus score 8/10.', 'Study · 120 min', 3, 8, [['Samuel Obi', 'samuel.obi@unipulse.io', 'Respect. What worked for you?']]),
    mk(3, 'Grace Okonkwo', 'grace.okonkwo@unipulse.io', 'resource', 'Added a Genetics summary to the Content Library — check the Biology tag.', 'Content · Genetics', 6, 15, [['Zainab Yusuf', 'zainab.yusuf@unipulse.io', 'This saved my revision, thank you!']]),
    mk(4, 'Samuel Obi', 'samuel.obi@unipulse.io', 'question', 'Anyone else finding PHY202 induction problems tricky? Want to form a study room at 5pm.', 'Question · PHY202', 9, 6, [['Ibrahim Musa', 'ibrahim.musa@unipulse.io', 'I am in. Room code please.'], ['Blessing Eze', 'blessing.eze@unipulse.io', 'I can help with the basics.']]),
    mk(5, 'Chioma Nwosu', 'chioma.nwosu@unipulse.io', 'result', 'Scored 85% on the Media Law CBT practice exam. Progress!', 'CBT · 85%', 20, 19, [['Fatima Aliyu', 'fatima.aliyu@unipulse.io', 'Brilliant!']]),
    mk(6, 'Tunde Bakare', 'tunde.bakare@unipulse.io', 'update', 'Accountancy study group now meets Wednesdays in the Business block. All welcome.', undefined, 28, 5, []),
  ];
}
