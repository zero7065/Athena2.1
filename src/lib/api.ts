/**
 * AcademiaIQ API Client
 * Centralized API calls with JWT auth and error handling
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, options.headers);
    }
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Auth
  authRegister: (data: { email: string; password: string; name: string; role?: string; department?: string; student_id?: string }) =>
    apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  authLogin: (data: { email: string; password: string }) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  authProfile: () => apiRequest('/auth/profile', { method: 'GET' }),
  authUpdateProfile: (data: any) =>
    apiRequest('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Tasks
  tasksList: (params?: { status?: string; priority?: string }) => {
    const qs = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
    return apiRequest(`/tasks${qs ? '?' + qs : ''}`, { method: 'GET' });
  },
  tasksCreate: (data: any) =>
    apiRequest('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  tasksUpdate: (id: string, data: any) =>
    apiRequest(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  tasksDelete: (id: string) =>
    apiRequest(`/tasks/${id}`, { method: 'DELETE' }),
  tasksStats: () => apiRequest('/tasks/stats', { method: 'GET' }),

  // Skills
  skillsList: () => apiRequest('/skills', { method: 'GET' }),
  skillsUpdateXP: (id: string, xpGain: number) =>
    apiRequest(`/skills/${id}/xp`, { method: 'POST', body: JSON.stringify({ xp_gain: xpGain }) }),
  skillsSeed: () => apiRequest('/skills/seed', { method: 'POST' }),

  // Submissions
  submissionsStudent: () => apiRequest('/submissions/student', { method: 'GET' }),
  submissionsLecturer: () => apiRequest('/submissions/lecturer', { method: 'GET' }),
  submissionsCreate: (data: any) =>
    apiRequest('/submissions', { method: 'POST', body: JSON.stringify(data) }),
  submissionsGrade: (id: string, data: { score: number; feedback?: string }) =>
    apiRequest(`/submissions/${id}/grade`, { method: 'POST', body: JSON.stringify(data) }),
  submissionsStats: () => apiRequest('/submissions/stats', { method: 'GET' }),

  // Courses
  coursesList: () => apiRequest('/courses', { method: 'GET' }),
  coursesCreate: (data: any) =>
    apiRequest('/courses', { method: 'POST', body: JSON.stringify(data) }),

  // RSS
  rssFetch: (url?: string) => apiRequest(`/rss${url ? '?url=' + encodeURIComponent(url) : ''}`, { method: 'GET' }),
};

export default api;
export { API_BASE };
