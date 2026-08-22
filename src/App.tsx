import React, { useState } from 'react';
import { AuthLayout } from './components/auth/AuthLayout';
import { AppShell } from './components/layout/AppShell';
import { AuthView, AuthenticatedUser } from './types/auth';
<<<<<<< Updated upstream
import { Compass, Sparkles } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<AuthView>('dashboard');
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUser | null>({
    fullName: 'Alex Morgan',
    email: 'alex.traveler@globetrotter.io',
    memberSince: 'August 2026',
    preferredStyle: 'Cultural Explorer & Scenic Wanderer',
  });
=======
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
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
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
=======
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
>>>>>>> Stashed changes
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
