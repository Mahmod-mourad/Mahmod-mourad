import { HttpException, HttpStatus } from '@nestjs/common';
import type { AppErrorKind } from '@nexahire/types';
import { AppError } from './app-error';
import type { Result } from './result';

/** The ONE place an AppError kind becomes an HTTP status. Controllers never
 *  hand-roll error responses — they call `unwrapOrThrow`. */
const statusByKind: Record<AppErrorKind, HttpStatus> = {
  Validation: HttpStatus.BAD_REQUEST,
  NotFound: HttpStatus.NOT_FOUND,
  Unauthorized: HttpStatus.UNAUTHORIZED,
  Forbidden: HttpStatus.FORBIDDEN,
  Conflict: HttpStatus.CONFLICT,
  RateLimited: HttpStatus.TOO_MANY_REQUESTS,
  ExternalFailure: HttpStatus.BAD_GATEWAY,
  Unexpected: HttpStatus.INTERNAL_SERVER_ERROR,
  Internal: HttpStatus.INTERNAL_SERVER_ERROR,
};

export function toHttpException(error: AppError): HttpException {
  return new HttpException(
    { error: { kind: error.kind, message: error.message, details: error.details } },
    statusByKind[error.kind],
  );
}

/** Unwrap a service Result in a controller: value on success, mapped HTTP
 *  exception on failure. */
export function unwrapOrThrow<T>(result: Result<T, AppError>): T {
  if (result.ok) return result.value;
  throw toHttpException(result.error);
}
