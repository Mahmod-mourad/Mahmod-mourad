import { z } from 'zod';
/**
 * The single source of truth for server-side configuration.
 *
 * Anything the api/worker reads from the environment is declared here and
 * validated once at boot. The app fails fast with a readable error rather than
 * crashing at 2 a.m. on an undefined variable.
 *
 * NOTE: this is the SERVER contract only. The web app reads `VITE_*` variables
 * through Vite's own typed `import.meta.env` — secrets never live here.
 */
export declare const serverEnvSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "test", "production"]>>;
    API_PORT: z.ZodDefault<z.ZodNumber>;
    WEB_ORIGIN: z.ZodDefault<z.ZodString>;
    DATABASE_URL: z.ZodString;
    REDIS_URL: z.ZodString;
    JWT_SECRET: z.ZodString;
    JWT_EXPIRES_IN: z.ZodDefault<z.ZodString>;
    COOKIE_SECURE: z.ZodEffects<z.ZodDefault<z.ZodEnum<["true", "false"]>>, boolean, "true" | "false" | undefined>;
    ANTHROPIC_API_KEY: z.ZodOptional<z.ZodString>;
    ANTHROPIC_MODEL: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "test" | "production";
    API_PORT: number;
    WEB_ORIGIN: string;
    DATABASE_URL: string;
    REDIS_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    COOKIE_SECURE: boolean;
    ANTHROPIC_MODEL: string;
    ANTHROPIC_API_KEY?: string | undefined;
}, {
    DATABASE_URL: string;
    REDIS_URL: string;
    JWT_SECRET: string;
    NODE_ENV?: "development" | "test" | "production" | undefined;
    API_PORT?: number | undefined;
    WEB_ORIGIN?: string | undefined;
    JWT_EXPIRES_IN?: string | undefined;
    COOKIE_SECURE?: "true" | "false" | undefined;
    ANTHROPIC_API_KEY?: string | undefined;
    ANTHROPIC_MODEL?: string | undefined;
}>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
//# sourceMappingURL=env.schema.d.ts.map