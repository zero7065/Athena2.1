import { describe, it, expect, beforeEach } from 'vitest';
import { api } from './api';

/**
 * These tests exercise the REAL api module (no mocks) to guarantee that
 * sign-in / sign-up / demo accounts work with no backend configured —
 * which is how the app is deployed on Vercel and Render (static).
 */
describe('Local auth fallback (no backend)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('logs in the student demo account', async () => {
    const res = await api.authLogin({ email: 'student@unipulse.io', password: 'student123' });
    expect(res.token).toBeTruthy();
    expect(res.user.email).toBe('student@unipulse.io');
    expect(res.user.role).toBe('student');
  });

  it('logs in the lecturer demo account', async () => {
    const res = await api.authLogin({ email: 'lecturer@unipulse.io', password: 'lecturer123' });
    expect(res.user.role).toBe('lecturer');
  });

  it('logs in the admin demo account', async () => {
    const res = await api.authLogin({ email: 'admin@unipulse.io', password: 'admin123' });
    expect(res.user.role).toBe('admin');
  });

  it('is case-insensitive on email', async () => {
    const res = await api.authLogin({ email: 'STUDENT@unipulse.io', password: 'student123' });
    expect(res.user.email.toLowerCase()).toBe('student@unipulse.io');
  });

  it('rejects a wrong password with a helpful message', async () => {
    await expect(api.authLogin({ email: 'student@unipulse.io', password: 'nope' }))
      .rejects.toThrow(/incorrect password/i);
  });

  it('rejects an unknown email', async () => {
    await expect(api.authLogin({ email: 'ghost@unipulse.io', password: 'whatever' }))
      .rejects.toThrow(/no account/i);
  });

  it('registers a new account and then logs in', async () => {
    const reg = await api.authRegister({
      email: 'new.student@unipulse.io',
      password: 'Secret123',
      name: 'New Student',
      role: 'student',
      department: 'Mathematics',
      student_id: 'STU999',
    });
    expect(reg.token).toBeTruthy();
    expect(reg.user.email).toBe('new.student@unipulse.io');

    const login = await api.authLogin({ email: 'new.student@unipulse.io', password: 'Secret123' });
    expect(login.user.name).toBe('New Student');
  });

  it('prevents duplicate registration', async () => {
    await expect(api.authRegister({
      email: 'student@unipulse.io',
      password: 'Another123',
      name: 'Duplicate',
      role: 'student',
    })).rejects.toThrow(/already registered/i);
  });
});
