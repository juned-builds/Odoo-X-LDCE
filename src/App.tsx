import React, { useState } from 'react';
import { AuthLayout } from './components/auth/AuthLayout';
import { AuthView, AuthenticatedUser } from './types/auth';

export default function App() {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUser | null>(null);

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
