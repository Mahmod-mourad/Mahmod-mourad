import { JobSource } from './job-source.interface';
import { JobQuery, NormalizedJob, RawJob } from '@nexahire/types';
import { AppError, err, ok, Result } from '../../../core/result';
import { tagVisaEligibility } from '../utils/visa-eligibility';
import crypto from 'crypto';

export class ArbeitnowAdapter implements JobSource {
  readonly id = 'arbeitnow';

  async fetch(params: JobQuery): Promise<Result<RawJob[], AppError>> {
    try {
      const url = new URL('https://www.arbeitnow.com/api/job-board-api');
      url.searchParams.append('visa_sponsorship', 'true');
      if (params.location) url.searchParams.append('location', params.location);

      const res = await globalThis.fetch(url.toString(), {
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) {
        return err(new AppError('ExternalFailure', `Arbeitnow returned ${res.status}`));
      }
      const data = await res.json() as any;
      return ok(data.data || []);
    } catch (error) {
      return err(new AppError('ExternalFailure', 'Failed to fetch from Arbeitnow'));
    }
  }

  normalize(raw: RawJob): NormalizedJob {
    const dedupeHash = crypto.createHash('sha1').update(`${this.id}:${raw.slug}`).digest('hex');
    const location = raw.location || null;
    
    return {
      source: this.id,
      externalId: raw.slug,
      dedupeHash,
      title: raw.title,
      companyName: raw.company_name,
      location,
      remote: raw.remote === true,
      applyUrl: raw.url,
      postedAt: new Date(raw.created_at * 1000),
      visaTags: tagVisaEligibility(raw, location),
      raw,
    };
  }
}
