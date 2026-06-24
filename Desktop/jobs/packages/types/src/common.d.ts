import { z } from 'zod';
/**
 * The error contract shared across the boundary. The api maps every `AppError`
 * to one of these kinds (see `core/result`), and the web api client rebuilds a
 * typed `ApiError` from the same shape — so failure handling is symmetrical.
 */
export declare const appErrorKinds: readonly ["Validation", "NotFound", "Unauthorized", "Forbidden", "Conflict", "RateLimited", "ExternalFailure", "Unexpected"];
export declare const appErrorKindSchema: z.ZodEnum<["Validation", "NotFound", "Unauthorized", "Forbidden", "Conflict", "RateLimited", "ExternalFailure", "Unexpected"]>;
export type AppErrorKind = (typeof appErrorKinds)[number];
/** The JSON body every error response carries. */
export declare const apiErrorBodySchema: z.ZodObject<{
    error: z.ZodObject<{
        kind: z.ZodEnum<["Validation", "NotFound", "Unauthorized", "Forbidden", "Conflict", "RateLimited", "ExternalFailure", "Unexpected"]>;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        kind: "Validation" | "NotFound" | "Unauthorized" | "Forbidden" | "Conflict" | "RateLimited" | "ExternalFailure" | "Unexpected";
        details?: Record<string, unknown> | undefined;
    }, {
        message: string;
        kind: "Validation" | "NotFound" | "Unauthorized" | "Forbidden" | "Conflict" | "RateLimited" | "ExternalFailure" | "Unexpected";
        details?: Record<string, unknown> | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    error: {
        message: string;
        kind: "Validation" | "NotFound" | "Unauthorized" | "Forbidden" | "Conflict" | "RateLimited" | "ExternalFailure" | "Unexpected";
        details?: Record<string, unknown> | undefined;
    };
}, {
    error: {
        message: string;
        kind: "Validation" | "NotFound" | "Unauthorized" | "Forbidden" | "Conflict" | "RateLimited" | "ExternalFailure" | "Unexpected";
        details?: Record<string, unknown> | undefined;
    };
}>;
export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;
/** Cursor-paginated list envelope. Lists are never unbounded. */
export interface Page<T> {
    items: T[];
    nextCursor: string | null;
}
export declare const paginationQuerySchema: z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    cursor?: string | undefined;
}, {
    cursor?: string | undefined;
    limit?: number | undefined;
}>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
//# sourceMappingURL=common.d.ts.map