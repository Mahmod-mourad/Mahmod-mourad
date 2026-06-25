export * from './env.schema';

import { serverEnvSchema, type ServerEnv } from './env.schema';

/**
 * The single entry point for server configuration. Validates the environment
 * against `serverEnvSchema` (the ONE schema — see ./env.schema) and throws a
 * readable error naming the offending variables, so the app fails fast at boot
 * rather than at 2 a.m. on an undefined value. Nothing else in the api/worker
 * reads `process.env` directly — they read validated config through this (via
 * Nest's ConfigService).
 */
export function loadServerEnv(
  env: Record<string, string | undefined> = process.env,
): ServerEnv {
  const parsed = serverEnvSchema.safeParse(env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid server environment — ${details}`);
  }
  return parsed.data;
}
