export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details?: unknown;

  constructor(statusCode: number, errorCode: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static badRequest(message: string, errorCode = 'BAD_REQUEST', details?: unknown): ApiError {
    return new ApiError(400, errorCode, message, details);
  }

  static unauthorized(message = 'Authentication required', errorCode = 'UNAUTHORIZED'): ApiError {
    return new ApiError(401, errorCode, message);
  }

  static forbidden(message = 'Access forbidden', errorCode = 'FORBIDDEN'): ApiError {
    return new ApiError(403, errorCode, message);
  }

  static notFound(message = 'Resource not found', errorCode = 'NOT_FOUND'): ApiError {
    return new ApiError(404, errorCode, message);
  }

  static internal(message = 'Internal server error', errorCode = 'INTERNAL_SERVER_ERROR'): ApiError {
    return new ApiError(500, errorCode, message);
  }
}
