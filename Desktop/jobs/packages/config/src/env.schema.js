"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverEnvSchema = void 0;
const zod_1 = require("zod");
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
exports.serverEnvSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    API_PORT: zod_1.z.coerce.number().int().positive().default(3001),
    WEB_ORIGIN: zod_1.z.string().url().default('http://localhost:5173'),
    DATABASE_URL: zod_1.z.string().min(1, 'DATABASE_URL is required'),
    REDIS_URL: zod_1.z.string().min(1, 'REDIS_URL is required'),
    JWT_SECRET: zod_1.z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    // env vars are strings; coerce explicitly so "false" doesn't become truthy.
    COOKIE_SECURE: zod_1.z
        .enum(['true', 'false'])
        .default('false')
        .transform((value) => value === 'true'),
    // Server-side ONLY. Optional so the stack boots before AI is wired (Sprint 2).
    ANTHROPIC_API_KEY: zod_1.z.string().min(1).optional(),
    ANTHROPIC_MODEL: zod_1.z.string().default('claude-opus-4-8'),
});
//# sourceMappingURL=env.schema.js.map