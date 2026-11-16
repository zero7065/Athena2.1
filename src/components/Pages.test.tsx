import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import ContentLibrary from './ContentLibrary';
import SyllabusManager from './SyllabusManager';
import Social from './Social';
import FindFellowStudents from './FindFellowStudents';
import EduRSS from './EduRSS';

/**
 * Renders a real page inside AuthProvider after performing a real
 * (local) login, so we assert on the content users actually see.
 */
const Harness = ({ children }: { children: React.ReactNode }) => {
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

  return ready ? <>{children}</> : null;
};

const renderPage = (node: React.ReactNode) =>
  render(<AuthProvider><Harness>{node}</Harness></AuthProvider>);

describe('Pages render real content (not empty states)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('Content Library shows seeded resources and a count', async () => {
    renderPage(<ContentLibrary />);
    await waitFor(() => expect(screen.getByText(/of \d+ resources/)).toBeInTheDocument());
    const hits = await screen.findAllByText(/MDN Web Docs|freeCodeCamp/i);
    expect(hits.length).toBeGreaterThan(0);
  });

  it('Syllabus page shows seeded syllabi', async () => {
    renderPage(<SyllabusManager />);
    const hits = await screen.findAllByText(/Introduction to Programming/i);
    expect(hits.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Course Syllabi/i).length).toBeGreaterThan(0);
  });

  it('Social page offers classmates to add', async () => {
    renderPage(<Social />);
    const addTabs = await screen.findAllByRole('button', { name: /Add Friend/i });
    addTabs[0].click();
    await waitFor(() => expect(screen.getByText(/Suggested classmates/i)).toBeInTheDocument());
  });

  it('Find Fellow Students lists the classmate directory', async () => {
    renderPage(<FindFellowStudents />);
    await waitFor(() => expect(screen.getByText(/classmates? found/i)).toBeInTheDocument());
    const names = await screen.findAllByText(/Amina Bello|David Adewale|Grace Okonkwo/i);
    expect(names.length).toBeGreaterThan(0);
  });

  it('Education RSS always shows articles (curated fallback when offline)', async () => {
    renderPage(<EduRSS />);
    // Feed selector + category chips always render
    expect(await screen.findByText(/Education RSS/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Feed/)).toBeInTheDocument();
    // Even with no network, curated fallback articles are shown
    await waitFor(() => {
      const links = document.querySelectorAll('a[target="_blank"]');
      expect(links.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });
});
