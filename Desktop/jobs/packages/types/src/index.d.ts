import { z } from 'zod';
export type ErrorKind = 'NotFound' | 'Validation' | 'Unauthorized' | 'ExternalFailure' | 'RateLimited' | 'Internal';
export declare class AppError extends Error {
    kind: ErrorKind;
    message: string;
    details?: Record<string, any> | undefined;
    constructor(kind: ErrorKind, message: string, details?: Record<string, any> | undefined);
}
export type Result<T, E = AppError> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: E;
};
export declare const ok: <T>(value: T) => Result<T, never>;
export declare const err: <E>(error: E) => Result<never, E>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type LoginDto = z.infer<typeof LoginSchema>;
export declare const UserResponseSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    visaProfile: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    id: string;
    email: string;
    visaProfile?: any;
}, {
    id: string;
    email: string;
    visaProfile?: any;
}>;
export type UserResponseDto = z.infer<typeof UserResponseSchema>;
//# sourceMappingURL=index.d.ts.map