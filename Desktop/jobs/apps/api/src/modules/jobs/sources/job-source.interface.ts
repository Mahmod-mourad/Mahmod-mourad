import { AppError, JobQuery, NormalizedJob, RawJob, Result } from '@nexahire/types';

export interface JobSource {
  readonly id: string;
  fetch(params: JobQuery): Promise<Result<RawJob[], AppError>>;
  normalize(raw: RawJob): NormalizedJob;
}
