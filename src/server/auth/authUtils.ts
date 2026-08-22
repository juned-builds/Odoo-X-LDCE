import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { CookieOptions } from 'express';
import { users } from '../../db/schema/users.ts';

export const SESSION_COOKIE_NAME = 'gt_session';
export const SESSION_EXPIRY_DAYS = 30;

export interface SanitizedUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  preferredStyle?: string | null;
  language?: string | null;
  homeCity?: string | null;
  bio?: string | null;
  memberSince: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRecord = typeof users.$inferSelect;

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function formatMemberSince(date: Date): string {
  try {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch {
    return 'August 2026';
  }
}

export function sanitizeUser(user: UserRecord): SanitizedUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl || null,
    preferredStyle: user.preferredStyle || 'Cultural Explorer',
    language: user.language || 'en',
    homeCity: user.homeCity || null,
    bio: user.bio || null,
    memberSince: formatMemberSince(new Date(user.createdAt)),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function getSessionCookieOptions(isProduction: boolean): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    path: '/',
    maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  };
}
