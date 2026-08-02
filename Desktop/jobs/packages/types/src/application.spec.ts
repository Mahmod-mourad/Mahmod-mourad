import { describe, expect, it } from 'vitest';
import { CreateApplicationSchema, UpdateApplicationStatusSchema } from './application';

describe('CreateApplicationSchema', () => {
  it('defaults status to "applied" and trims input', () => {
    const parsed = CreateApplicationSchema.parse({ company: '  Acme  ', role: 'Backend Eng' });
    expect(parsed.status).toBe('applied');
    expect(parsed.company).toBe('Acme');
  });

  it('rejects an empty company', () => {
    expect(CreateApplicationSchema.safeParse({ company: '', role: 'x' }).success).toBe(false);
  });

  it('rejects a malformed url', () => {
    const result = CreateApplicationSchema.safeParse({
      company: 'Acme',
      role: 'x',
      url: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });
});

describe('UpdateApplicationStatusSchema', () => {
  it('allows a status-only move (drag across the board)', () => {
    const result = UpdateApplicationStatusSchema.safeParse({ status: 'interview' });
    expect(result.success).toBe(true);
  });
});
