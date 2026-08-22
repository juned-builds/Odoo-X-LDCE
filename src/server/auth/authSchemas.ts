import { ApiError } from '../utils/apiError.ts';

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  avatarUrl?: string | null;
  preferredStyle?: string | null;
  language?: string | null;
  homeCity?: string | null;
  bio?: string | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegisterInput(body: unknown): RegisterInput {
  if (!body || typeof body !== 'object') {
    throw ApiError.badRequest('Request body must be a JSON object.');
  }

  const { email, password, fullName, avatarUrl, preferredStyle, language, homeCity, bio } = body as Record<string, unknown>;

  if (!email || typeof email !== 'string' || !email.trim()) {
    throw ApiError.badRequest('Email address is required.', 'INVALID_EMAIL');
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail) || normalizedEmail.length > 255) {
    throw ApiError.badRequest('Please enter a valid email address.', 'INVALID_EMAIL');
  }

  if (!password || typeof password !== 'string') {
    throw ApiError.badRequest('Password is required.', 'INVALID_PASSWORD');
  }

  if (password.length < 6) {
    throw ApiError.badRequest('Password must be at least 6 characters long.', 'PASSWORD_TOO_SHORT');
  }

  if (password.length > 128) {
    throw ApiError.badRequest('Password cannot exceed 128 characters.', 'PASSWORD_TOO_LONG');
  }

  if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
    throw ApiError.badRequest('Full name is required.', 'INVALID_NAME');
  }

  const trimmedFullName = fullName.trim();
  if (trimmedFullName.length < 2 || trimmedFullName.length > 150) {
    throw ApiError.badRequest('Full name must be between 2 and 150 characters.', 'INVALID_NAME');
  }

  return {
    email: normalizedEmail,
    password,
    fullName: trimmedFullName,
    avatarUrl: typeof avatarUrl === 'string' && avatarUrl.trim() ? avatarUrl.trim() : null,
    preferredStyle: typeof preferredStyle === 'string' && preferredStyle.trim() ? preferredStyle.trim().slice(0, 100) : 'Cultural Explorer',
    language: typeof language === 'string' && language.trim() ? language.trim().slice(0, 10) : 'en',
    homeCity: typeof homeCity === 'string' && homeCity.trim() ? homeCity.trim().slice(0, 150) : null,
    bio: typeof bio === 'string' && bio.trim() ? bio.trim() : null,
  };
}

export function validateLoginInput(body: unknown): LoginInput {
  if (!body || typeof body !== 'object') {
    throw ApiError.badRequest('Request body must be a JSON object.');
  }

  const { email, password } = body as Record<string, unknown>;

  if (!email || typeof email !== 'string' || !email.trim()) {
    throw ApiError.badRequest('Email address is required.', 'INVALID_EMAIL');
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw ApiError.badRequest('Please enter a valid email address.', 'INVALID_EMAIL');
  }

  if (!password || typeof password !== 'string') {
    throw ApiError.badRequest('Password is required.', 'INVALID_PASSWORD');
  }

  return {
    email: normalizedEmail,
    password,
  };
}
