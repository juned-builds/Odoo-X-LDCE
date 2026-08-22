import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle2, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { AuthView, FormErrors, ForgotPasswordFormData } from '../../types/auth';

interface ForgotPasswordFormProps {
  onNavigate: (view: AuthView) => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({ email: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    // Simulate password reset request
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      setResendCooldown(45);
    }, 800);
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setResendCooldown(45);
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full"
    >
      {/* Back button */}
      <button
        type="button"
        onClick={() => onNavigate('login')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-6 group focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded px-1 -ml-1"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
        Back to sign in
      </button>

      {!isSubmitted ? (
        <>
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
              Reset your password
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              Enter the email associated with your GlobeTrotter account and we’ll send a link to safely reset your credentials.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              id="forgot-email"
              type="email"
              label="Account email address"
              placeholder="e.g. wanderer@globetrotter.io"
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

            <div className="pt-2">
              <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={isLoading}
                rightIcon={<Send className="w-4 h-4" />}
              >
                Send Reset Link
              </Button>
            </div>
          </form>
        </>
      ) : (
        <div className="space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-2">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
              Check your inbox
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              We've dispatched password reset instructions to{' '}
              <span className="font-semibold text-slate-900">{formData.email}</span>.
            </p>
          </div>

          <Alert type="info" title="Important note">
            The recovery link expires in 15 minutes. If you don’t see it shortly, check your spam or junk folder.
          </Alert>

          <div className="pt-2 flex flex-col gap-3">
            <Button
              type="button"
              variant="outline"
              fullWidth
              size="md"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isLoading}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              {resendCooldown > 0 ? `Resend email in ${resendCooldown}s` : 'Resend reset link'}
            </Button>

            <Button
              type="button"
              variant="secondary"
              fullWidth
              size="md"
              onClick={() => onNavigate('login')}
            >
              Return to Sign In
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
