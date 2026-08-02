import { JobQuery, NormalizedJob, RawJob } from '@nexahire/types';
import { AppError, Result } from '../../../core/result';

export interface JobSource {
  readonly id: string;
  fetch(params: JobQuery): Promise<Result<RawJob[], AppError>>;
  normalize(raw: RawJob): NormalizedJob;
}
