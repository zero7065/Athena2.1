import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskBoard from './TaskBoard';
import { useAuth } from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));
vi.mock('../lib/api', () => ({
  api: {
    tasksList: vi.fn(),
    tasksCreate: vi.fn(),
    tasksUpdate: vi.fn(),
    tasksDelete: vi.fn(),
    tasksStats: vi.fn(),
  },
}));

const mockUser = {
  id: 'user1',
  name: 'Test User',
  email: 'test@test.com',
  role: 'student' as const,
  department: 'Computer Science',
  studentId: 'STU001',
  xp: 0,
  streak: 0,
};

const renderTaskBoard = (user = mockUser, tasks: Array<{ id: string; title: string; description: string; status: 'todo' | 'in-progress' | 'done'; priority: 'low' | 'medium' | 'high'; createdAt: number }> = []) => {
  const updateAppData = vi.fn((updater) => {
    const newData = updater({ ...userAppData, tasks: [...userAppData.tasks] });
    userAppData.tasks = newData.tasks;
  });
  const userAppData = { tasks, sessions: [], achievements: [], friends: [], gameScores: {}, pomodoro: { sessionCount: 0, totalSessions: 0, lastDate: '' } };
  
  vi.mocked(useAuth).mockReturnValue({
    user,
    appData: userAppData,
    updateAppData,
    addUserXp: vi.fn(),
    logout: vi.fn(),
    switchAccount: vi.fn(),
    knownAccounts: [],
    isLoading: false,
    adminClickCount: 0,
    setAdminClickCount: vi.fn(),
    showTerminal: false,
    setShowTerminal: vi.fn(),
    managementRequests: [],
    setManagementRequests: vi.fn(),
    addManagementRequest: vi.fn(),
    approveManagementRequest: vi.fn(),
    rejectManagementRequest: vi.fn(),
    register: vi.fn(),
    login: vi.fn(),
  } as any);
  
  return { ...render(<TaskBoard />), updateAppData };
};

describe('TaskBoard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should render task board with empty state', () => {
    const { getAllByText } = renderTaskBoard(mockUser, []);
    expect(getAllByText('No tasks here').length).toBeGreaterThan(0);
  });

  it('should display tasks', () => {
    const tasks = [
      { id: '1', title: 'Math Homework', description: 'Complete algebra problems', status: 'todo' as const, priority: 'high' as const, createdAt: Date.now() },
      { id: '2', title: 'Read Chapter 1', description: 'History reading', status: 'done' as const, priority: 'medium' as const, createdAt: Date.now() },
    ];
    const { getByText } = renderTaskBoard(mockUser, tasks);
    expect(getByText('Math Homework')).toBeInTheDocument();
    expect(getByText('Read Chapter 1')).toBeInTheDocument();
  });

  it('should add a new task', async () => {
    const { getByPlaceholderText, getByRole } = renderTaskBoard(mockUser, []);
    
    // Click "New Task" to open the form
    fireEvent.click(getByRole('button', { name: 'New Task' }));
    
    // Type in the task title input
    fireEvent.change(getByPlaceholderText('Task Title'), { target: { value: 'New Task' } });
    
    // Click the submit button
    fireEvent.click(getByRole('button', { name: 'Create Task' }));
    
    // Verify the task appears as a heading in the To Do column
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'New Task' })).toBeInTheDocument();
    });
  });

  it('should show validation error for empty title', async () => {
    const { getByRole, updateAppData } = renderTaskBoard(mockUser, []);
    
    fireEvent.click(getByRole('button', { name: 'New Task' }));
    fireEvent.click(getByRole('button', { name: 'Create Task' }));
    
    // Verify validation prevented form submission (updateAppData not called)
    expect(updateAppData).not.toHaveBeenCalled();
  });
});
