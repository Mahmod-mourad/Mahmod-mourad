import { JobSource } from './job-source.interface';
import { JobQuery, NormalizedJob, RawJob } from '@nexahire/types';
import { AppError, err, ok, Result } from '../../../core/result';
import { tagVisaEligibility } from '../utils/visa-eligibility';
import crypto from 'crypto';

export class GreenhouseAdapter implements JobSource {
  readonly id: string;
  private readonly companyId: string;

  constructor(companyId: string) {
    this.companyId = companyId;
    this.id = `greenhouse:${companyId}`;
  }

  async fetch(params: JobQuery): Promise<Result<RawJob[], AppError>> {
    try {
      const url = `https://boards-api.greenhouse.io/v1/boards/${this.companyId}/jobs?content=true`;
      const res = await globalThis.fetch(url, {
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) {
        return err(new AppError('ExternalFailure', `Greenhouse returned ${res.status}`));
      }
      const data = await res.json() as any;
      return ok(data.jobs || []);
    } catch (error) {
      return err(new AppError('ExternalFailure', `Failed to fetch from Greenhouse: ${this.companyId}`));
    }
  }

  normalize(raw: RawJob): NormalizedJob {
    const dedupeHash = crypto.createHash('sha1').update(`${this.id}:${raw.id}`).digest('hex');
    const location = raw.location?.name || null;
    const remote = location?.toLowerCase().includes('remote') || raw.title?.toLowerCase().includes('remote');
    
    return {
      source: this.id,
      externalId: String(raw.id),
      dedupeHash,
      title: raw.title,
      companyName: this.companyId, // The best we have since the API doesn't always return the pretty name
      location,
      remote: !!remote,
      applyUrl: raw.absolute_url,
      postedAt: raw.updated_at ? new Date(raw.updated_at) : new Date(), // Greenhouse doesn't always provide postedAt, fallback to updated
      visaTags: tagVisaEligibility(raw, location),
      raw,
    };
  }
}
