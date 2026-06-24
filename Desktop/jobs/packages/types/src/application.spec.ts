import { describe, expect, it } from 'vitest';
import { createApplicationSchema, updateApplicationSchema } from './application';

describe('createApplicationSchema', () => {
  it('defaults status to "applied" and trims input', () => {
    const parsed = createApplicationSchema.parse({ company: '  Acme  ', role: 'Backend Eng' });
    expect(parsed.status).toBe('applied');
    expect(parsed.company).toBe('Acme');
  });

  it('rejects an empty company', () => {
    expect(createApplicationSchema.safeParse({ company: '', role: 'x' }).success).toBe(false);
  });

  it('rejects a malformed url', () => {
    const result = createApplicationSchema.safeParse({
      company: 'Acme',
      role: 'x',
      url: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateApplicationSchema', () => {
  it('allows a status-only move (drag across the board)', () => {
    const result = updateApplicationSchema.safeParse({ status: 'interview' });
    expect(result.success).toBe(true);
  });
});
