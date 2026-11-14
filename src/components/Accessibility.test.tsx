import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

const TestPage = () => (
  <div>
    <nav aria-label="Main navigation">
      <button>Home</button>
      <button>Dashboard</button>
      <button>Profile</button>
    </nav>
    <main>
      <h1>Welcome</h1>
      <img src="/test.png" alt="Test image" />
      <button>Click me</button>
      <input type="text" aria-label="Search" />
    </main>
  </div>
);

describe('Accessibility', () => {
  it('should have proper heading structure', () => {
    const { getByRole } = render(<TestPage />);
    expect(getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('should have alt text on images', () => {
    const { getByAltText } = render(<TestPage />);
    expect(getByAltText('Test image')).toBeInTheDocument();
  });

  it('should have labels for inputs', () => {
    const { getByLabelText } = render(<TestPage />);
    expect(getByLabelText('Search')).toBeInTheDocument();
  });

  it('should have nav landmark', () => {
    const { getByRole } = render(<TestPage />);
    expect(getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  });
});
