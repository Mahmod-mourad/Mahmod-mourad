import { z } from 'zod';
declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    PORT: z.ZodDefault<z.ZodString>;
    DATABASE_URL: z.ZodString;
    REDIS_URL: z.ZodString;
    JWT_SECRET: z.ZodString;
    ANTHROPIC_API_KEY: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "test" | "production";
    DATABASE_URL: string;
    REDIS_URL: string;
    JWT_SECRET: string;
    PORT: string;
    ANTHROPIC_API_KEY?: string | undefined;
}, {
    DATABASE_URL: string;
    REDIS_URL: string;
    JWT_SECRET: string;
    NODE_ENV?: "development" | "test" | "production" | undefined;
    ANTHROPIC_API_KEY?: string | undefined;
    PORT?: string | undefined;
}>;
export type Env = z.infer<typeof envSchema>;
export declare function validateEnv(env: Record<string, string | undefined>): Env;
export {};
//# sourceMappingURL=index.d.ts.map