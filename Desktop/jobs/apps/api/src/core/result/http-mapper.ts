import { HttpException, HttpStatus } from '@nestjs/common';
import { AppError, Result } from '@nexahire/types';

export function mapAppErrorToHttpException(error: AppError): HttpException {
  switch (error.kind) {
    case 'NotFound':
      return new HttpException(error.message, HttpStatus.NOT_FOUND);
    case 'Validation':
      return new HttpException(error.message, HttpStatus.BAD_REQUEST);
    case 'Unauthorized':
      return new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    case 'RateLimited':
      return new HttpException(error.message, HttpStatus.TOO_MANY_REQUESTS);
    case 'ExternalFailure':
      return new HttpException(error.message, HttpStatus.BAD_GATEWAY);
    case 'Internal':
    default:
      return new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export function unwrapOrThrow<T>(result: Result<T, AppError>): T {
  if (!result.ok) {
    throw mapAppErrorToHttpException(result.error);
  }
  return result.value;
}
