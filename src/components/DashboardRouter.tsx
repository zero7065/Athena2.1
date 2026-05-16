/*
 * ATHENA - Student Success Platform
 * Section: DASHBOARD ROUTER
 *
 * Routes users to the correct dashboard based on their role:
 * - Student → Dashboard
 * - Lecturer → LecturerPortal
 * - Admin → AdminPanel
 */

import React from 'react';
import { User } from '../context/AuthContext';
import Dashboard from './Dashboard';
import LecturerPortal from './LecturerPortal';
import AdminPanel from './AdminPanel';
import { useAuth } from '../context/AuthContext';

export default function DashboardRouter({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { user, appData } = useAuth();

  if (!user) return null;

  if (user.role === 'admin') {
    return <AdminPanel />;
  }

  if (user.role === 'lecturer') {
    return <LecturerPortal />;
  }

  // Default: student
  return <Dashboard setActiveTab={setActiveTab} />;
}