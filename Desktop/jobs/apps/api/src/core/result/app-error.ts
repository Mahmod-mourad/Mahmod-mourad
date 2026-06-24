import type { AppErrorKind } from '@nexahire/types';

/**
 * The one error type that flows through the service layer. Repositories catch
 * external/Prisma exceptions and turn them into an `AppError`; controllers map
 * `kind` to an HTTP status through a single shared mapper (see `http.ts`).
 */
export class AppError {
  constructor(
    readonly kind: AppErrorKind,
    readonly message: string,
    readonly details?: Record<string, unknown>,
  ) {}

  static validation(message = 'Validation failed', details?: Record<string, unknown>): AppError {
    return new AppError('Validation', message, details);
  }

  static notFound(message = 'Not found', details?: Record<string, unknown>): AppError {
    return new AppError('NotFound', message, details);
  }

  static unauthorized(message = 'Unauthorized', details?: Record<string, unknown>): AppError {
    return new AppError('Unauthorized', message, details);
  }

  static forbidden(message = 'Forbidden', details?: Record<string, unknown>): AppError {
    return new AppError('Forbidden', message, details);
  }

  static conflict(message = 'Conflict', details?: Record<string, unknown>): AppError {
    return new AppError('Conflict', message, details);
  }

  static rateLimited(message = 'Too many requests', details?: Record<string, unknown>): AppError {
    return new AppError('RateLimited', message, details);
  }

  static external(message = 'External service failed', details?: Record<string, unknown>): AppError {
    return new AppError('ExternalFailure', message, details);
  }

  static unexpected(message = 'Unexpected error', details?: Record<string, unknown>): AppError {
    return new AppError('Unexpected', message, details);
  }
}
