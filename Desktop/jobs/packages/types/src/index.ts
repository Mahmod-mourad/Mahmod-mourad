export * from './auth';
export * from './application';
export * from './cv';
export * from './ats';
export * from './jobs';
export * from './companion';
export * from './outreach';
export * from './negotiation';
export * from './prep';
export * from './analytics';

// The shared error contract — the `AppErrorKind` union and the error-body Zod
// schema — plus pagination helpers live in ./common. This is the ONLY place
// they are defined. The api's `Result`/`ok`/`err`/`AppError` live in
// apps/api/src/core/result and reference this `AppErrorKind`; the web `ApiError`
// parses `apiErrorBodySchema`. Nothing redefines them here.
export * from './common';

import { z } from 'zod';

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
