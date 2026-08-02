import { ArbeitnowAdapter } from './arbeitnow.adapter';
import { RemoteOkAdapter } from './remoteok.adapter';
import { GreenhouseAdapter } from './greenhouse.adapter';
import { BundesagenturAdapter } from './bundesagentur.adapter';
import * as fs from 'fs';
import * as path from 'path';
import { describe, it, expect } from 'vitest';

describe('Job Source Adapters', () => {
  const loadFixture = (name: string) => {
    const filePath = path.join(__dirname, '..', '__fixtures__', name);
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  };

  it('normalizes arbeitnow job', () => {
    const raw = loadFixture('arbeitnow.json');
    const adapter = new ArbeitnowAdapter();
    const out = adapter.normalize(raw);

    expect(out.source).toBe('arbeitnow');
    expect(out.dedupeHash).toMatch(/^[a-f0-9]{40}$/);
    expect(out.title).toBe('Frontend Engineer');
    expect(out.companyName).toBe('Tech Corp');
    expect(out.location).toBe('Berlin, Germany');
    expect(out.remote).toBe(true);
    expect(out.visaTags).toContain('DE Blue Card Eligible');
    expect(out.visaTags).toContain('Visa Sponsorship');
  });

  it('normalizes remoteok job', () => {
    const raw = loadFixture('remoteok.json');
    const adapter = new RemoteOkAdapter();
    const out = adapter.normalize(raw);

    expect(out.source).toBe('remoteok');
    expect(out.title).toBe('Senior React Developer');
    expect(out.companyName).toBe('RemoteStart');
    expect(out.remote).toBe(true);
  });

  it('normalizes greenhouse job', () => {
    const raw = loadFixture('greenhouse.json');
    const adapter = new GreenhouseAdapter('stripe');
    const out = adapter.normalize(raw);

    expect(out.source).toBe('greenhouse:stripe');
    expect(out.title).toBe('Fullstack Engineer');
    expect(out.companyName).toBe('stripe');
    expect(out.remote).toBe(true); // "Remote - EMEA"
  });

  it('normalizes bundesagentur job', () => {
    const raw = loadFixture('bundesagentur.json');
    const adapter = new BundesagenturAdapter();
    const out = adapter.normalize(raw);

    expect(out.source).toBe('bundesagentur');
    expect(out.title).toBe('Softwareentwickler (m/w/d)');
    expect(out.companyName).toBe('AutoMakers GmbH');
    expect(out.location).toBe('München');
    expect(out.visaTags).toContain('DE Blue Card Eligible'); // München is in Germany
  });
});
