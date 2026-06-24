import { describe, expect, it } from 'vitest';
import { loadServerEnv } from './index';

const valid: NodeJS.ProcessEnv = {
  DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
  REDIS_URL: 'redis://localhost:6379',
  JWT_SECRET: 'x'.repeat(32),
};

describe('loadServerEnv', () => {
  it('applies defaults for optional values', () => {
    const env = loadServerEnv(valid);
    expect(env.NODE_ENV).toBe('development');
    expect(env.API_PORT).toBe(3001);
    expect(env.COOKIE_SECURE).toBe(false);
  });

  it('coerces COOKIE_SECURE="true" to a real boolean', () => {
    const env = loadServerEnv({ ...valid, COOKIE_SECURE: 'true' });
    expect(env.COOKIE_SECURE).toBe(true);
  });

  it('throws a readable error when JWT_SECRET is too short', () => {
    expect(() => loadServerEnv({ ...valid, JWT_SECRET: 'short' })).toThrow(/JWT_SECRET/);
  });

  it('throws when a required variable is missing', () => {
    const { DATABASE_URL: _omit, ...rest } = valid;
    expect(() => loadServerEnv(rest)).toThrow(/DATABASE_URL/);
  });
});
