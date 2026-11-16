import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { api } from '../lib/api';
import TopNavbar from './TopNavbar';

const Harness = ({ children }: { children: (nav: (t: string) => void) => React.ReactNode }) => {
  const { login, user } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) {
        const res = await api.authLogin({ email: 'student@unipulse.io', password: 'student123' });
        if (!cancelled) login(res.user, res.token);
      }
      if (!cancelled) setReady(true);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ready ? <>{children(() => {})}</> : null;
};

const renderNav = (onNavigate = vi.fn()) =>
  render(
    <AuthProvider>
      <ThemeProvider>
        <Harness>
          {() => <TopNavbar activeTab="dashboard" onNavigate={onNavigate} />}
        </Harness>
      </ThemeProvider>
    </AuthProvider>
  );

describe('TopNavbar (desktop)', () => {
  beforeEach(() => localStorage.clear());

  it('renders all categorized groups', async () => {
    renderNav();
    for (const title of ['Overview', 'Academic', 'Community', 'Progress', 'Account']) {
      await waitFor(() => expect(screen.getByRole('button', { name: new RegExp(title, 'i') })).toBeInTheDocument());
    }
  });

  it('opens a category dropdown with its destinations', async () => {
    renderNav();
    const academic = await screen.findByRole('button', { name: /Academic/i });
    fireEvent.click(academic);
    await waitFor(() => expect(screen.getByRole('menuitem', { name: /Tasks/i })).toBeInTheDocument());
    expect(screen.getByRole('menuitem', { name: /Study Tracker/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Education RSS/i })).toBeInTheDocument();
  });

  it('navigates when a destination is clicked', async () => {
    const onNavigate = vi.fn();
    renderNav(onNavigate);
    fireEvent.click(await screen.findByRole('button', { name: /Academic/i }));
    const tasks = await screen.findByRole('menuitem', { name: /Tasks/i });
    fireEvent.click(tasks);
    expect(onNavigate).toHaveBeenCalledWith('tasks');
  });

  it('does not show admin/lecturer routes to students', async () => {
    renderNav();
    expect(screen.queryByRole('button', { name: /Management/i })).not.toBeInTheDocument();
  });
});
