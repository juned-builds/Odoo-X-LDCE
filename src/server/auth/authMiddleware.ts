import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.ts';
import { asyncHandler } from '../utils/asyncHandler.ts';
import { SESSION_COOKIE_NAME, SanitizedUser } from './authUtils.ts';
import { getUserFromSession } from './authService.ts';

declare global {
  namespace Express {
    interface Request {
      user?: SanitizedUser;
      sessionToken?: string;
    }
  }
}

export function extractSessionToken(req: Request): string | null {
  // 1. Check HTTP-only cookie
  if (req.cookies && req.cookies[SESSION_COOKIE_NAME]) {
    return req.cookies[SESSION_COOKIE_NAME];
  }

  // 2. Check Authorization Bearer header (for API clients/testing)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return null;
}

export const requireAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractSessionToken(req);

  if (!token) {
    throw ApiError.unauthorized('Authentication required.', 'UNAUTHORIZED');
  }

  const user = await getUserFromSession(token);
  if (!user) {
    throw ApiError.unauthorized('Authentication required.', 'UNAUTHORIZED');
  }

  req.user = user;
  req.sessionToken = token;
  next();
});

export const optionalAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractSessionToken(req);

  if (token) {
    const user = await getUserFromSession(token);
    if (user) {
      req.user = user;
      req.sessionToken = token;
    }
  }

  next();
});
