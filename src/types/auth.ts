export type AuthView = 'login' | 'signup' | 'forgot-password' | 'dashboard';

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface AuthenticatedUser {
  id?: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  memberSince: string;
  preferredStyle?: string;
  language?: string;
  homeCity?: string;
  bio?: string;
}
