import { AuthenticatedUser } from '../types/auth.ts';

export interface AuthApiResponse {
  success: boolean;
  message?: string;
  user?: AuthenticatedUser;
  error?: {
    code: string;
    message: string;
  };
}

export async function fetchCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data: AuthApiResponse = await response.json();
    if (data.success && data.user) {
      return data.user;
    }
    return null;
  } catch (err) {
    console.error('Failed to fetch current authenticated user:', err);
    return null;
  }
}

export async function loginUserApi(email: string, password: string): Promise<AuthenticatedUser> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data: AuthApiResponse = await response.json();

  if (!response.ok || !data.success || !data.user) {
    const errorMessage = data.error?.message || 'Invalid email or password.';
    throw new Error(errorMessage);
  }

  return data.user;
}

export async function registerUserApi(input: {
  email: string;
  password: string;
  fullName: string;
  avatarUrl?: string;
  preferredStyle?: string;
  language?: string;
  homeCity?: string;
  bio?: string;
}): Promise<AuthenticatedUser> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data: AuthApiResponse = await response.json();

  if (!response.ok || !data.success || !data.user) {
    const errorMessage = data.error?.message || 'Failed to create an account. Please try again.';
    throw new Error(errorMessage);
  }

  return data.user;
}

export async function logoutUserApi(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });
  } catch (err) {
    console.error('Logout error:', err);
  }
}
