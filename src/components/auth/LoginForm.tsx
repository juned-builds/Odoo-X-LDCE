import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { Alert } from '../ui/Alert';
import { AuthView, FormErrors, LoginFormData, AuthenticatedUser } from '../../types/auth';

interface LoginFormProps {
  onNavigate: (view: AuthView) => void;
  onSuccess: (user: AuthenticatedUser) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onNavigate, onSuccess }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    setIsLoading(true);

    // Simulate authentication delay for smooth UX demonstration
    setTimeout(() => {
      setIsLoading(false);
      
      // Simulate realistic login validation
      if (formData.password === 'error') {
        setGeneralError('Invalid email or password combination. Try demo credentials.');
        return;
      }

      const displayName = formData.email.split('@')[0].replace(/[._]/g, ' ') || 'Traveler';
      const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

      onSuccess({
        fullName: formattedName,
        email: formData.email,
        memberSince: 'August 2026',
        preferredStyle: 'Cultural Explorer & Slow Travel',
      });
    }, 850);
  };

  const handleDemoFill = () => {
    setFormData({
      email: 'alex.traveler@globetrotter.io',
      password: 'Adventure2026!',
      rememberMe: true,
    });
    setErrors({});
    setGeneralError(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full"
    >
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
          Welcome back
        </h1>
        <p className="text-sm text-slate-500 mt-1.5">
          Sign in to access your customized itineraries and travel memories.
        </p>
      </div>

      {generalError && (
        <Alert
          type="error"
          title="Sign In Failed"
          className="mb-5"
          onClose={() => setGeneralError(null)}
        >
          {generalError}
        </Alert>
      )}

      {/* Demo Credentials Quick-Fill Banner */}
      <div className="mb-5 p-3 rounded-xl bg-teal-50/70 border border-teal-200/70 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-teal-900 font-medium">
          <Zap className="w-4 h-4 text-teal-600 shrink-0" />
          <span>Demo mode active: Quick test account available</span>
        </div>
        <button
          type="button"
          onClick={handleDemoFill}
          className="text-xs font-semibold text-teal-700 bg-white hover:bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-300 shadow-xs transition-colors shrink-0"
        >
          Auto-fill
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email Field */}
        <Input
          id="login-email"
          type="email"
          label="Email address"
          placeholder="name@example.com"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            if (errors.email) setErrors({ ...errors, email: undefined });
          }}
          error={errors.email}
          leftIcon={<Mail className="w-4 h-4" />}
          autoComplete="email"
          disabled={isLoading}
        />

        {/* Password Field */}
        <div className="space-y-1">
          <Input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            error={errors.password}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-md transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            autoComplete="current-password"
            disabled={isLoading}
          />
        </div>

        {/* Remember me & Forgot Password */}
        <div className="flex items-center justify-between pt-1">
          <Checkbox
            id="login-remember-me"
            label="Remember this device"
            checked={formData.rememberMe}
            onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
            disabled={isLoading}
          />

          <button
            type="button"
            onClick={() => onNavigate('forgot-password')}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In to GlobeTrotter
          </Button>
        </div>
      </form>

      {/* Switch to Sign Up */}
      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500">
          Don't have an explorer account yet?{' '}
          <button
            type="button"
            onClick={() => onNavigate('signup')}
            className="font-semibold text-teal-600 hover:text-teal-700 hover:underline transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
          >
            Create an account
          </button>
        </p>
      </div>
    </motion.div>
  );
};
