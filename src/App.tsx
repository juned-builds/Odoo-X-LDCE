import React, { useState } from 'react';
import { AuthLayout } from './components/auth/AuthLayout';
import { AppShell } from './components/layout/AppShell';
import { AuthView, AuthenticatedUser } from './types/auth';
import { Compass, Sparkles } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<AuthView>('dashboard');
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUser | null>({
    fullName: 'Alex Morgan',
    email: 'alex.traveler@globetrotter.io',
    memberSince: 'August 2026',
    preferredStyle: 'Cultural Explorer & Scenic Wanderer',
  });

  const handleLoginSuccess = (user: AuthenticatedUser) => {
    setAuthenticatedUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setAuthenticatedUser(null);
    setCurrentView('login');
  };

  const handleDeleteAccount = () => {
    setAuthenticatedUser(null);
    setCurrentView('login');
  };

  const handleQuickDemoToggle = () => {
    if (currentView === 'dashboard') {
      setCurrentView('login');
    } else {
      if (!authenticatedUser) {
        setAuthenticatedUser({
          fullName: 'Alex Morgan',
          email: 'alex.traveler@globetrotter.io',
          memberSince: 'August 2026',
          preferredStyle: 'Cultural Explorer & Scenic Wanderer',
          language: 'en',
          homeCity: 'San Francisco, CA',
        });
      }
      setCurrentView('dashboard');
    }
  };

  // When in dashboard view, render the Module 2 AppShell
  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 selection:bg-teal-500 selection:text-white">
        <AppShell
          user={authenticatedUser}
          onUpdateUser={(updated) => setAuthenticatedUser(updated)}
          onLogout={handleLogout}
          onDeleteAccount={handleDeleteAccount}
        />
      </div>
    );
  }

  // Otherwise, render AuthLayout
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased">
      <AuthLayout
        currentView={currentView}
        setCurrentView={setCurrentView}
        authenticatedUser={authenticatedUser}
        setAuthenticatedUser={setAuthenticatedUser}
      />
    </div>
  );
}
