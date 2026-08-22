import React, { useState, useEffect } from 'react';
import { AuthLayout } from './components/auth/AuthLayout';
import { AppShell } from './components/layout/AppShell';
import { AuthView, AuthenticatedUser } from './types/auth';
import { fetchCurrentUser, logoutUserApi } from './utils/authApi';

export default function App() {
  const [currentView, setCurrentView] = useState<AuthView>('dashboard');
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Check authenticated session on application mount
  useEffect(() => {
    let isMounted = true;
    async function initAuth() {
      try {
        const user = await fetchCurrentUser();
        if (isMounted) {
          if (user) {
            setAuthenticatedUser(user);
            setCurrentView('dashboard');
          } else {
            // Default to auth screen when no session exists
            setCurrentView('login');
          }
        }
      } catch (err) {
        console.error('Session initialization error:', err);
        if (isMounted) setCurrentView('login');
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    }
    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLoginSuccess = (user: AuthenticatedUser) => {
    setAuthenticatedUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    await logoutUserApi();
    setAuthenticatedUser(null);
    setCurrentView('login');
  };

  const handleDeleteAccount = async () => {
    await logoutUserApi();
    setAuthenticatedUser(null);
    setCurrentView('login');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500 font-display">Loading GlobeTrotter...</p>
        </div>
      </div>
    );
  }

  // When in dashboard view, render AppShell
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
