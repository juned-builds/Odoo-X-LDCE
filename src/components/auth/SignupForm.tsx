import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { Alert } from '../ui/Alert';
import { AuthView, FormErrors, SignupFormData, AuthenticatedUser } from '../../types/auth';
import { registerUserApi } from '../../utils/authApi';

interface SignupFormProps {
  onNavigate: (view: AuthView) => void;
  onSuccess: (user: AuthenticatedUser) => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onNavigate, onSuccess }) => {
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strengthScore = getPasswordStrength(formData.password);

  const getStrengthLabel = (score: number) => {
    if (!formData.password) return { label: 'Password strength', color: 'bg-slate-200', text: 'text-slate-400' };
    if (score <= 1) return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' };
    if (score === 2 || score === 3) return { label: 'Good', color: 'bg-amber-500', text: 'text-amber-600' };
    return { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' };
  };

  const strengthInfo = getStrengthLabel(strengthScore);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must accept the terms & privacy policy to continue';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    setIsLoading(true);

    try {
      const newUser = await registerUserApi({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        preferredStyle: 'Cultural Explorer',
      });
      setIsLoading(false);
      onSuccess(newUser);
    } catch (err: any) {
      setIsLoading(false);
      setGeneralError(err.message || 'Failed to create your travel account.');
    }
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
          Begin your journey
        </h1>
        <p className="text-sm text-slate-500 mt-1.5">
          Join GlobeTrotter to craft personalized, unforgettable travel experiences.
        </p>
      </div>

      {generalError && (
        <Alert
          type="error"
          title="Account Creation Issue"
          className="mb-5"
          onClose={() => setGeneralError(null)}
        >
          {generalError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Full Name */}
        <Input
          id="signup-name"
          type="text"
          label="Full Name"
          placeholder="e.g. Maya Chen"
          value={formData.fullName}
          onChange={(e) => {
            setFormData({ ...formData, fullName: e.target.value });
            if (errors.fullName) setErrors({ ...errors, fullName: undefined });
          }}
          error={errors.fullName}
          leftIcon={<User className="w-4 h-4" />}
          autoComplete="name"
          disabled={isLoading}
        />

        {/* Email */}
        <Input
          id="signup-email"
          type="email"
          label="Email address"
          placeholder="maya@wanderlust.com"
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

        {/* Password */}
        <div className="space-y-2">
          <Input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="Create a strong password"
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
            autoComplete="new-password"
            disabled={isLoading}
          />

          {/* Password Strength Meter */}
          {formData.password && (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Security strength:</span>
                <span className={`font-semibold ${strengthInfo.text}`}>{strengthInfo.label}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-1.5">
                <div className={`rounded-full transition-all duration-300 ${strengthScore >= 1 ? strengthInfo.color : 'bg-slate-200'}`} />
                <div className={`rounded-full transition-all duration-300 ${strengthScore >= 2 ? strengthInfo.color : 'bg-slate-200'}`} />
                <div className={`rounded-full transition-all duration-300 ${strengthScore >= 3 ? strengthInfo.color : 'bg-slate-200'}`} />
                <div className={`rounded-full transition-all duration-300 ${strengthScore >= 4 ? strengthInfo.color : 'bg-slate-200'}`} />
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500 pt-0.5">
                <span className={`inline-flex items-center gap-1 ${formData.password.length >= 8 ? 'text-teal-700 font-medium' : ''}`}>
                  <CheckCircle2 className={`w-3 h-3 ${formData.password.length >= 8 ? 'text-teal-600' : 'text-slate-300'}`} />
                  8+ chars
                </span>
                <span className={`inline-flex items-center gap-1 ${/[A-Z]/.test(formData.password) ? 'text-teal-700 font-medium' : ''}`}>
                  <CheckCircle2 className={`w-3 h-3 ${/[A-Z]/.test(formData.password) ? 'text-teal-600' : 'text-slate-300'}`} />
                  Uppercase
                </span>
                <span className={`inline-flex items-center gap-1 ${/[0-9]/.test(formData.password) ? 'text-teal-700 font-medium' : ''}`}>
                  <CheckCircle2 className={`w-3 h-3 ${/[0-9]/.test(formData.password) ? 'text-teal-600' : 'text-slate-300'}`} />
                  Number
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <Input
          id="signup-confirm-password"
          type={showConfirmPassword ? 'text' : 'password'}
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={formData.confirmPassword}
          onChange={(e) => {
            setFormData({ ...formData, confirmPassword: e.target.value });
            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
          }}
          error={errors.confirmPassword}
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
              className="text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-md transition-colors"
              aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          autoComplete="new-password"
          disabled={isLoading}
        />

        {/* Terms and conditions */}
        <div className="pt-1">
          <Checkbox
            id="signup-agree-terms"
            label={
              <span>
                I agree to GlobeTrotter's{' '}
                <span className="text-teal-600 font-medium hover:underline">Terms of Service</span> and{' '}
                <span className="text-teal-600 font-medium hover:underline">Privacy Policy</span>.
              </span>
            }
            checked={formData.agreeToTerms}
            onChange={(e) => {
              setFormData({ ...formData, agreeToTerms: e.target.checked });
              if (errors.agreeToTerms) setErrors({ ...errors, agreeToTerms: undefined });
            }}
            error={errors.agreeToTerms}
            disabled={isLoading}
          />
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
            Create My Travel Account
          </Button>
        </div>
      </form>

      {/* Switch to Sign In */}
      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500">
          Already have a GlobeTrotter account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="font-semibold text-teal-600 hover:text-teal-700 hover:underline transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
          >
            Sign in
          </button>
        </p>
      </div>
    </motion.div>
  );
};
