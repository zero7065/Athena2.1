import { describe, it, expect, beforeEach } from 'vitest';
import {
  getPosts, createPost, toggleLike, addComment, deleteComment,
  editPost, deletePost, getNotifications, unreadNotificationCount,
  markNotificationsRead, sharePost,
} from './social';

const me = { name: 'Ada Student', email: 'ada@unipulse.io' };
const other = { name: 'Amina Bello', email: 'amina.bello@unipulse.io' };

describe('Campus social layer', () => {
  beforeEach(() => localStorage.clear());

  it('seeds a campus feed with classmates', () => {
    const posts = getPosts();
    expect(posts.length).toBeGreaterThanOrEqual(6);
    expect(posts.some(p => p.authorName === 'Amina Bello')).toBe(true);
    expect(posts.every(p => p.id && p.authorEmail && p.createdAt)).toBe(true);
  });

  it('creates a post and lists it first', () => {
    const post = createPost({ authorName: me.name, authorEmail: me.email, text: 'Hello campus!' });
    const posts = getPosts();
    expect(posts[0].id).toBe(post.id);
    expect(posts[0].likes).toEqual([]);
    expect(posts[0].comments).toEqual([]);
  });

  it('toggles like on and off', () => {
    const post = createPost({ authorName: me.name, authorEmail: me.email, text: 'like me' });
    let posts = toggleLike(post.id, me.email, me.name);
    expect(posts.find(p => p.id === post.id)!.likes).toContain(me.email);
    posts = toggleLike(post.id, me.email, me.name);
    expect(posts.find(p => p.id === post.id)!.likes).not.toContain(me.email);
  });

  it('adds a comment and notifies the post author', () => {
    const post = createPost({ authorName: other.name, authorEmail: other.email, text: 'my post' });
    addComment(post.id, me, 'Great post!');
    const updated = getPosts().find(p => p.id === post.id)!;
    expect(updated.comments).toHaveLength(1);
    expect(updated.comments[0].text).toBe('Great post!');

    const notifs = getNotifications(other.email);
    expect(notifs.length).toBe(1);
    expect(notifs[0].kind).toBe('comment');
    expect(unreadNotificationCount(other.email)).toBe(1);
  });

  it('does not notify yourself on your own post', () => {
    const post = createPost({ authorName: me.name, authorEmail: me.email, text: 'self' });
    addComment(post.id, me, 'note to self');
    expect(getNotifications(me.email).filter(n => n.kind === 'comment')).toHaveLength(0);
  });

  it('deletes own comment only', () => {
    const post = createPost({ authorName: other.name, authorEmail: other.email, text: 'x' });
    addComment(post.id, me, 'mine');
    addComment(post.id, other, 'theirs');
    let updated = getPosts().find(p => p.id === post.id)!;
    const mine = updated.comments.find(c => c.text === 'mine')!;
    updated = (deleteComment(post.id, mine.id, me.email), getPosts().find(p => p.id === post.id)!);
    expect(updated.comments).toHaveLength(1);
    // Deleting with the wrong email does nothing
    const theirs = updated.comments[0];
    deleteComment(post.id, theirs.id, me.email);
    expect(getPosts().find(p => p.id === post.id)!.comments).toHaveLength(1);
  });

  it('edits and deletes only own posts', () => {
    const post = createPost({ authorName: me.name, authorEmail: me.email, text: 'v1' });
    editPost(post.id, other.email, 'hacked');
    expect(getPosts().find(p => p.id === post.id)!.text).toBe('v1');
    editPost(post.id, me.email, 'v2');
    expect(getPosts().find(p => p.id === post.id)!.text).toBe('v2');
    deletePost(post.id, other.email);
    expect(getPosts().some(p => p.id === post.id)).toBe(true);
    deletePost(post.id, me.email);
    expect(getPosts().some(p => p.id === post.id)).toBe(false);
  });

  it('increments shares and produces a link', async () => {
    const post = createPost({ authorName: me.name, authorEmail: me.email, text: 'share me' });
    const res = await sharePost(post, me);
    expect(res.url).toContain('#/feed');
    expect(getPosts().find(p => p.id === post.id)!.shares).toBe(1);
  });

  it('marks notifications read', () => {
    const post = createPost({ authorName: other.name, authorEmail: other.email, text: 'p' });
    addComment(post.id, me, 'hi');
    expect(unreadNotificationCount(other.email)).toBe(1);
    markNotificationsRead(other.email);
    expect(unreadNotificationCount(other.email)).toBe(0);
  });
});
