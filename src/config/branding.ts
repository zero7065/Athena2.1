export const CAMPUSIQ_BRANDING = {
  platformName: 'CampusIQ',
  shortName: 'CampusIQ',
  motto: 'Intelligence. Integrity. Innovation.',
  emblemUrl: '/campusiq-logo.svg',
  established: 2025,
  colors: {
    primary: '#00843D',
    secondary: '#FFD700',
    accent: '#1a1a2e',
    dark: '#0f172a',
  },
  contact: {
    email: 'support@campusiq.io',
    website: 'https://campusiq.io',
    address: 'Multi-Tenant Platform',
  },
  version: '3.0.0',
};

export const DEMO_USERS = [
  { name: 'Admin User', email: 'admin@campusiq.io', password: 'admin123', role: 'admin' as const, studentId: 'ADM001', department: 'Administration' },
  { name: 'Lecturer User', email: 'lecturer@campusiq.io', password: 'lecturer123', role: 'lecturer' as const, studentId: 'LEC001', department: 'Computer Science' },
  { name: 'Student User', email: 'student@campusiq.io', password: 'student123', role: 'student' as const, studentId: 'STU001', department: 'Computer Science' },
];