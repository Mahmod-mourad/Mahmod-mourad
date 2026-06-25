import { JobSource } from './job-source.interface';
import { JobQuery, NormalizedJob, RawJob } from '@nexahire/types';
import { AppError, err, ok, Result } from '../../../core/result';
import { tagVisaEligibility } from '../utils/visa-eligibility';
import crypto from 'crypto';

export class BundesagenturAdapter implements JobSource {
  readonly id = 'bundesagentur';

  async fetch(params: JobQuery): Promise<Result<RawJob[], AppError>> {
    try {
      const url = new URL('https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs');
      if (params.q) url.searchParams.append('was', params.q);
      // Let's ask for remote jobs too just in case
      url.searchParams.append('arbeitszeit', 'ho'); // home-office

      const res = await globalThis.fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'X-API-Key': 'jobboerse-jobsuche',
        },
      });
      if (!res.ok) {
        return err(new AppError('ExternalFailure', `Bundesagentur returned ${res.status}`));
      }
      const data = await res.json() as any;
      return ok(data.stellenangebote || []);
    } catch (error) {
      return err(new AppError('ExternalFailure', 'Failed to fetch from Bundesagentur'));
    }
  }

  normalize(raw: RawJob): NormalizedJob {
    const dedupeHash = crypto.createHash('sha1').update(`${this.id}:${raw.refnr}`).digest('hex');
    const location = raw.arbeitsort?.ort || null;
    
    return {
      source: this.id,
      externalId: raw.refnr,
      dedupeHash,
      title: raw.titel,
      companyName: raw.arbeitgeber,
      location,
      remote: true, // we requested 'ho'
      applyUrl: `https://www.arbeitsagentur.de/jobsuche/jobdetail/${raw.refnr}`,
      postedAt: raw.veroeffentlichungsdatum ? new Date(raw.veroeffentlichungsdatum) : new Date(),
      visaTags: tagVisaEligibility(raw, location || 'Germany'), // assume DE for DE job board
      raw,
    };
  }
}
