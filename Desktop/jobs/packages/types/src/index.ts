export * from './auth';
export * from './application';
export * from './cv';
export * from './ats';
export * from './jobs';

import { z } from 'zod';

// Shared AppError
export type AppErrorKind =
  | 'NotFound'
  | 'Validation'
  | 'Unauthorized'
  | 'Forbidden'
  | 'Conflict'
  | 'ExternalFailure'
  | 'RateLimited'
  | 'Unexpected'
  | 'Internal';

export class AppError extends Error {
  constructor(
    public kind: AppErrorKind,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Result pattern type
export type Result<T, E = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

// DTOs (Zod schemas for shared validation)
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type LoginDto = z.infer<typeof LoginSchema>;

export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  visaProfile: z.any().optional(), // Adjust based on JSON type
});
export type UserResponseDto = z.infer<typeof UserResponseSchema>;
