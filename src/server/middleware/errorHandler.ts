import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.ts';

export const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Handle explicit ApiError instances
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  // Handle malformed JSON body parser errors
  if ('type' in err && (err as { type: string }).type === 'entity.parse.failed') {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON_BODY',
        message: 'The request body contains invalid JSON syntax.',
      },
    });
    return;
  }

  // Server-side logging for unexpected errors (without leaking sensitive data)
  console.error('[SERVER_ERROR]', err.message || err);

  // Safe client response for unexpected exceptions
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal server error occurred.',
    },
  });
};
