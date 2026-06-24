import { z } from 'zod';

/**
 * The error contract shared across the boundary. The api maps every `AppError`
 * to one of these kinds (see `core/result`), and the web api client rebuilds a
 * typed `ApiError` from the same shape — so failure handling is symmetrical.
 */
export const appErrorKinds = [
  'Validation',
  'NotFound',
  'Unauthorized',
  'Forbidden',
  'Conflict',
  'RateLimited',
  'ExternalFailure',
  'Unexpected',
] as const;

export const appErrorKindSchema = z.enum(appErrorKinds);
export type AppErrorKind = (typeof appErrorKinds)[number];

/** The JSON body every error response carries. */
export const apiErrorBodySchema = z.object({
  error: z.object({
    kind: appErrorKindSchema,
    message: z.string(),
    details: z.record(z.string(), z.unknown()).optional(),
  }),
});
export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;

/** Cursor-paginated list envelope. Lists are never unbounded. */
export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

export const paginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
