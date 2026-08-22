import { eq, and, isNull, gt } from 'drizzle-orm';
import { db } from '../../db/index.ts';
import { users } from '../../db/schema/users.ts';
import { sessions } from '../../db/schema/sessions.ts';
import { ApiError } from '../utils/apiError.ts';
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  hashSessionToken,
  sanitizeUser,
  SESSION_EXPIRY_DAYS,
  SanitizedUser,
} from './authUtils.ts';
import { RegisterInput, LoginInput } from './authSchemas.ts';

export interface AuthResult {
  user: SanitizedUser;
  rawToken: string;
}

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  // 1. Check if user with normalized email already exists
  const existingUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (existingUsers.length > 0) {
    throw ApiError.conflict('An account with this email address already exists.', 'EMAIL_ALREADY_EXISTS');
  }

  // 2. Hash password
  const passwordHash = await hashPassword(input.password);

  // 3. Create user record
  const [newUser] = await db
    .insert(users)
    .values({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      avatarUrl: input.avatarUrl || null,
      preferredStyle: input.preferredStyle || 'Cultural Explorer',
      language: input.language || 'en',
      homeCity: input.homeCity || null,
      bio: input.bio || null,
    })
    .returning();

  // 4. Create new secure session
  const rawToken = generateSessionToken();
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(sessions).values({
    userId: newUser.id,
    tokenHash,
    expiresAt,
  });

  return {
    user: sanitizeUser(newUser),
    rawToken,
  };
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  // 1. Find user by normalized email
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (!user) {
    // Generic error message to prevent enumeration
    throw ApiError.unauthorized('Invalid email or password.', 'INVALID_CREDENTIALS');
  }

  // 2. Verify password with bcrypt
  const isPasswordValid = await verifyPassword(input.password, user.passwordHash);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password.', 'INVALID_CREDENTIALS');
  }

  // 3. Create new session
  const rawToken = generateSessionToken();
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(sessions).values({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  return {
    user: sanitizeUser(user),
    rawToken,
  };
}

export async function getUserFromSession(rawToken: string): Promise<SanitizedUser | null> {
  if (!rawToken || typeof rawToken !== 'string' || rawToken.trim() === '') {
    return null;
  }

  const tokenHash = hashSessionToken(rawToken);
  const now = new Date();

  // Query active session and join user
  const result = await db
    .select({
      session: sessions,
      user: users,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.tokenHash, tokenHash),
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, now)
      )
    )
    .limit(1);

  if (!result || result.length === 0) {
    return null;
  }

  return sanitizeUser(result[0].user);
}

export async function logoutSession(rawToken?: string): Promise<void> {
  if (!rawToken || typeof rawToken !== 'string' || rawToken.trim() === '') {
    return;
  }

  const tokenHash = hashSessionToken(rawToken);
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.tokenHash, tokenHash), isNull(sessions.revokedAt)));
}

export async function logoutAllUserSessions(userId: string): Promise<void> {
  if (!userId) return;

  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
}
