import { HttpException, HttpStatus } from '@nestjs/common';
import type { AppErrorKind } from '@nexahire/types';
import { AppError } from './app-error';
import type { Result } from './result';

/**
 * The ONE place an AppError kind becomes an HTTP status. Controllers never
 * hand-roll error responses — they call `unwrapOrThrow`.
 *
 * The map is exhaustive over `AppErrorKind` (the union lives in @nexahire/types),
 * so adding a kind without a status is a compile error — a missing case can never
 * silently fall through to a 500.
 */
const statusByKind: Record<AppErrorKind, HttpStatus> = {
  Validation: HttpStatus.BAD_REQUEST,
  NotFound: HttpStatus.NOT_FOUND,
  Unauthorized: HttpStatus.UNAUTHORIZED,
  Forbidden: HttpStatus.FORBIDDEN,
  Conflict: HttpStatus.CONFLICT,
  RateLimited: HttpStatus.TOO_MANY_REQUESTS,
  ExternalFailure: HttpStatus.BAD_GATEWAY,
  Unexpected: HttpStatus.INTERNAL_SERVER_ERROR,
};

/**
 * Map an `AppError` to an HttpException carrying the shared error body:
 * `{ error: { kind, message, details? } }` — the exact shape the web `ApiError`
 * parses (see `apiErrorBodySchema` in @nexahire/types).
 */
export function mapAppErrorToHttpException(error: AppError): HttpException {
  return new HttpException(
    {
      error: {
        kind: error.kind,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    },
    statusByKind[error.kind],
  );
}

/**
 * Unwrap a service `Result` in a controller: the value on success, the mapped
 * HTTP exception on failure.
 */
export function unwrapOrThrow<T>(result: Result<T, AppError>): T {
  if (!result.ok) {
    throw mapAppErrorToHttpException(result.error);
  }
  return result.value;
}
