import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
  api: {
    authRegister: vi.fn(),
    authLogin: vi.fn(),
  },
}));

const TestComponent = () => {
  const { user, token, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="user">{user?.name || 'Guest'}</div>
      <div data-testid="token">{token || 'none'}</div>
      <button onClick={() => login({ name: 'Test User', email: 'test@test.com', studentId: 'T001', role: 'student', department: 'CS' }, 'fake-token')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

const renderWithAuth = (ui: React.ReactElement) =>
  render(
    <AuthProvider>{ui}</AuthProvider>
  );

describe('AuthContext', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should start with no user', () => {
    const { getByTestId } = renderWithAuth(<TestComponent />);
    expect(getByTestId('user').textContent).toBe('Guest');
    expect(getByTestId('token').textContent).toBe('none');
  });

  it('should login and store user/token', async () => {
    const { getByTestId } = renderWithAuth(<TestComponent />);
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    
    expect(getByTestId('user').textContent).toBe('Test User');
    expect(getByTestId('token').textContent).toBe('fake-token');
    
    const stored = localStorage.getItem('unipulse_auth');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.token).toBe('fake-token');
    expect(parsed.user.email).toBe('test@test.com');
  });

  it('should logout and clear state', async () => {
    const { getByTestId } = renderWithAuth(<TestComponent />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(getByTestId('user').textContent).toBe('Test User');
    
    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));
    expect(getByTestId('user').textContent).toBe('Guest');
    expect(getByTestId('token').textContent).toBe('none');
    
    expect(localStorage.getItem('unipulse_auth')).toBeNull();
  });

  it('api.authRegister should be mocked and callable', async () => {
    vi.mocked(api.authRegister).mockResolvedValue({
      token: 'reg-token',
      user: { name: 'New User', email: 'new@test.com', studentId: 'N001', role: 'student', department: 'CS' },
    });
    
    await api.authRegister({
      email: 'new@test.com',
      password: 'password123',
      name: 'New User',
      role: 'student',
      department: 'CS',
      student_id: 'N001',
    });
    
    expect(api.authRegister).toHaveBeenCalledWith({
      email: 'new@test.com',
      password: 'password123',
      name: 'New User',
      role: 'student',
      department: 'CS',
      student_id: 'N001',
    });
  });
});
