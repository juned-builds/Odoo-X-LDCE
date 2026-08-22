import React, { useState, useEffect } from 'react';
import { AuthLayout } from './components/auth/AuthLayout';
import { AppShell } from './components/layout/AppShell';
import { AuthView, AuthenticatedUser } from './types/auth';
import { fetchCurrentUser, logoutUserApi } from './utils/authApi';
import { Compass, Sparkles } from 'lucide-react';

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
            // Default demo fallback user if not authenticated, or display auth screen
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

  const handleQuickDemoToggle = () => {
    if (currentView === 'dashboard') {
      setCurrentView('login');
    } else {
      if (!authenticatedUser) {
        setAuthenticatedUser({
          id: 'demo-user',
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

  // When in dashboard view, render the Module 2 AppShell
  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 selection:bg-teal-500 selection:text-white">
        {/* Top Demo Mode Bar for Module Testing */}
        <div className="bg-slate-900 text-white px-4 py-1.5 text-xs flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-teal-400">GlobeTrotter Prototype</span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="hidden sm:inline text-slate-300">Modules 1–11 Active (Profile, Settings & Saved Destinations)</span>
          </div>
          <button
            type="button"
            onClick={handleQuickDemoToggle}
            className="text-[11px] font-medium text-teal-300 hover:text-white underline px-2 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ← View Module 1 (Auth Screen)
          </button>
        </div>

        <AppShell
          user={authenticatedUser}
          onUpdateUser={(updated) => setAuthenticatedUser(updated)}
          onLogout={handleLogout}
          onDeleteAccount={handleDeleteAccount}
        />
      </div>
    );
  }

  // Otherwise, render Module 1 AuthLayout
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased">
      {/* Top Demo Mode Bar on Auth Screen to jump straight to Dashboard */}
      <div className="bg-slate-900 text-white px-4 py-2 text-xs flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="font-semibold text-teal-400">GlobeTrotter Prototype</span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden sm:inline text-slate-300">Module 1 (Auth) & Module 2 (Dashboard)</span>
        </div>
        <button
          type="button"
          onClick={handleQuickDemoToggle}
          className="text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white px-3 py-1 rounded-lg transition-all shadow-xs flex items-center gap-1.5"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Launch Module 2 Dashboard →</span>
        </button>
      </div>

      <AuthLayout
        currentView={currentView}
        setCurrentView={setCurrentView}
        authenticatedUser={authenticatedUser}
        setAuthenticatedUser={setAuthenticatedUser}
      />
    </div>
  );
}
