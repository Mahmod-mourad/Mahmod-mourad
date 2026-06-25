import { JobSource } from './job-source.interface';
import { JobQuery, NormalizedJob, RawJob } from '@nexahire/types';
import { AppError, err, ok, Result } from '../../../core/result';
import { tagVisaEligibility } from '../utils/visa-eligibility';
import crypto from 'crypto';

export class RemoteOkAdapter implements JobSource {
  readonly id = 'remoteok';

  async fetch(params: JobQuery): Promise<Result<RawJob[], AppError>> {
    try {
      // RemoteOK API allows tags. Defaulting to 'dev' to avoid pulling irrelevant jobs.
      const url = new URL('https://remoteok.com/api');
      if (params.q) url.searchParams.append('tags', params.q);

      const res = await globalThis.fetch(url.toString(), {
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) {
        return err(new AppError('ExternalFailure', `RemoteOK returned ${res.status}`));
      }
      const data = await res.json() as any;
      // The first element is often a legal/meta object, filter it out.
      const jobs = data.filter((item: any) => item.id !== undefined && item.legal === undefined);
      return ok(jobs);
    } catch (error) {
      return err(new AppError('ExternalFailure', 'Failed to fetch from RemoteOK'));
    }
  }

  normalize(raw: RawJob): NormalizedJob {
    const dedupeHash = crypto.createHash('sha1').update(`${this.id}:${raw.id}`).digest('hex');
    const location = raw.location || null;
    
    return {
      source: this.id,
      externalId: String(raw.id),
      dedupeHash,
      title: raw.position,
      companyName: raw.company,
      location,
      remote: true, // It's remoteok
      applyUrl: raw.url,
      postedAt: new Date(raw.date),
      visaTags: tagVisaEligibility(raw, location),
      raw,
    };
  }
}
