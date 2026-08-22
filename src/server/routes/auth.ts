import { Router, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.ts';
import { config } from '../config/env.ts';
import { validateRegisterInput, validateLoginInput } from '../auth/authSchemas.ts';
import { registerUser, loginUser, logoutSession, logoutAllUserSessions } from '../auth/authService.ts';
import { requireAuth, extractSessionToken } from '../auth/authMiddleware.ts';
import { SESSION_COOKIE_NAME, getSessionCookieOptions } from '../auth/authUtils.ts';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user account, create initial session, set HttpOnly cookie
 */
router.post(
  '/register',
  asyncHandler(async (req: Request, res: Response) => {
    const validatedInput = validateRegisterInput(req.body);
    const { user, rawToken } = await registerUser(validatedInput);

    // Set secure HttpOnly cookie
    res.cookie(SESSION_COOKIE_NAME, rawToken, getSessionCookieOptions(config.isProduction));

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user,
    });
  })
);

/**
 * POST /api/auth/login
 * Authenticate existing user, create session, set HttpOnly cookie
 */
router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const validatedInput = validateLoginInput(req.body);
    const { user, rawToken } = await loginUser(validatedInput);

    // Set secure HttpOnly cookie
    res.cookie(SESSION_COOKIE_NAME, rawToken, getSessionCookieOptions(config.isProduction));

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      user,
    });
  })
);

/**
 * POST /api/auth/logout
 * Revoke active session and clear session cookie
 */
router.post(
  '/logout',
  asyncHandler(async (req: Request, res: Response) => {
    const token = extractSessionToken(req);
    if (token) {
      await logoutSession(token);
    }

    res.clearCookie(SESSION_COOKIE_NAME, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: config.isProduction,
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  })
);

/**
 * GET /api/auth/me
 * Validate current session and return authenticated user
 */
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  })
);

/**
 * POST /api/auth/logout-all
 * Revoke all active sessions for current authenticated user
 */
router.post(
  '/logout-all',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.id) {
      await logoutAllUserSessions(req.user.id);
    }

    res.clearCookie(SESSION_COOKIE_NAME, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: config.isProduction,
    });

    return res.status(200).json({
      success: true,
      message: 'All sessions logged out successfully.',
    });
  })
);

/**
 * GET /api/auth/protected-test
 * Endpoint to test authentication status
 */
router.get(
  '/protected-test',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    return res.status(200).json({
      success: true,
      message: 'Authenticated request successful.',
      user: req.user,
    });
  })
);

export default router;
