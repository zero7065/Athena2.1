import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as icons from 'lucide-react';
import {
  Activity, AlertTriangle, Bot, BookOpen, CheckCircle2, Rss,
  Sparkles, Target, Trophy, Users, Zap,
} from 'lucide-react';

/**
 * Regression guard for the production crash:
 * "Uncaught TypeError: Cannot set properties of undefined (setting 'Activity')"
 *
 * Root cause: lucide-react v1.x uses React 19.2's `Activity` export, whose
 * CJS->ESM namespace interop breaks under Vite's code-splitting, crashing the
 * app on boot. The app is pinned to lucide-react 0.546.0, which does not.
 *
 * These tests fail loudly if a future dependency bump reintroduces the bug.
 */
describe('Icon Library Integrity (lucide-react)', () => {
  it('should be pinned to the 0.5xx major (React 19.2 safe)', () => {
    // v1.x is the incompatible major. Guard against accidental upgrades.
    const pkg = require('../../package.json');
    expect(pkg.dependencies['lucide-react']).toMatch(/^0\./);
  });

  it('should export every icon used across the app', () => {
    const required = [
      Activity, AlertTriangle, Bot, BookOpen, CheckCircle2,
      Rss, Sparkles, Target, Trophy, Users, Zap,
    ];
    for (const icon of required) {
      expect(icon).toBeDefined();
    }
  });

  it('should export icons as renderable components', () => {
    const required = ['Activity', 'AlertTriangle', 'Bot', 'Rss', 'Trophy', 'Sparkles'];
    const iconMap = icons as unknown as Record<string, unknown>;
    for (const name of required) {
      expect(iconMap[name]).toBeDefined();
      expect(['function', 'object']).toContain(typeof iconMap[name]);
    }
  });

  it('should render an Activity icon without throwing', () => {
    const { container } = render(<Activity aria-label="activity" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render a batch of icons together without crashing', () => {
    const { container } = render(
      <>
        <Activity aria-label="a" />
        <AlertTriangle aria-label="b" />
        <Bot aria-label="c" />
        <Rss aria-label="d" />
        <Trophy aria-label="e" />
        <Sparkles aria-label="f" />
      </>
    );
    expect(container.querySelectorAll('svg').length).toBe(6);
  });
});
