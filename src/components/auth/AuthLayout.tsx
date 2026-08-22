import React from 'react';
import { Compass, Heart, Sparkles } from 'lucide-react';
import { Logo } from '../brand/Logo';
import { TravelShowcase } from './TravelShowcase';
import { AuthView, AuthenticatedUser } from '../../types/auth';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { AuthSuccessView } from './AuthSuccessView';
import { AnimatePresence } from 'motion/react';

interface AuthLayoutProps {
  currentView: AuthView;
  setCurrentView: (view: AuthView) => void;
  authenticatedUser: AuthenticatedUser | null;
  setAuthenticatedUser: (user: AuthenticatedUser | null) => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  currentView,
  setCurrentView,
  authenticatedUser,
  setAuthenticatedUser,
}) => {
  return (
    <main className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-3 sm:p-6 lg:p-8 selection:bg-teal-500 selection:text-white">
      {/* Central Glass Frame Container */}
      <div className="w-full max-w-6xl min-h-[640px] lg:min-h-[720px] bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all duration-300">
        
        {/* Left Column: Form & Brand Section (Desktop: 6 cols, Mobile: full) */}
        <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-10 xl:p-12 relative z-10 bg-white">
          {/* Header with Logo */}
          <div className="flex items-center justify-between pb-6 sm:pb-8">
            <Logo size="md" />
            
            {!authenticatedUser && (
              <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setCurrentView('login')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    currentView === 'login'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('signup')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    currentView === 'signup'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Form Content Area with Motion Transitions */}
          <div className="my-auto py-2 w-full max-w-md mx-auto">
            <AnimatePresence mode="wait">
              {authenticatedUser ? (
                <AuthSuccessView
                  key="auth-success"
                  user={authenticatedUser}
                  onLogout={() => {
                    setAuthenticatedUser(null);
                    setCurrentView('login');
                  }}
                  onEnterDashboard={() => {
                    setCurrentView('dashboard');
                  }}
                />
              ) : currentView === 'login' ? (
                <LoginForm
                  key="login-form"
                  onNavigate={setCurrentView}
                  onSuccess={(user) => setAuthenticatedUser(user)}
                />
              ) : currentView === 'signup' ? (
                <SignupForm
                  key="signup-form"
                  onNavigate={setCurrentView}
                  onSuccess={(user) => setAuthenticatedUser(user)}
                />
              ) : (
                <ForgotPasswordForm
                  key="forgot-password-form"
                  onNavigate={setCurrentView}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Footer Area */}
          <div className="pt-6 sm:pt-8 mt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 font-medium">
              <Compass className="w-3.5 h-3.5 text-teal-600" />
              <span>Personalized travel planning prototype</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span>© 2026 GlobeTrotter</span>
              <span>·</span>
              <span className="hover:text-slate-600 transition-colors cursor-pointer">Privacy</span>
              <span>·</span>
              <span className="hover:text-slate-600 transition-colors cursor-pointer">Terms</span>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Travel Showcase (Desktop: 6 cols, hidden on very small viewports or collapsed smoothly) */}
        <div className="hidden lg:block lg:col-span-6 relative">
          <TravelShowcase />
        </div>
      </div>
    </main>
  );
};
