import { z } from 'zod';
export declare const passwordSchema: z.ZodString;
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type LoginInput = z.infer<typeof loginSchema>;
/** The authenticated principal carried on every request and returned by /me. */
export declare const authUserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    email: string;
}, {
    id: string;
    createdAt: string;
    email: string;
}>;
export type AuthUser = z.infer<typeof authUserSchema>;
//# sourceMappingURL=auth.d.ts.map