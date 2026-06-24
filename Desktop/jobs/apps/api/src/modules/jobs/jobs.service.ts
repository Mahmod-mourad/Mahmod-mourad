import { Injectable } from '@nestjs/common';
import { JobsRepository } from './jobs.repository';
import { AppError, Result } from '@nexahire/types';
import { Job, Company } from '@prisma/client';

@Injectable()
export class JobsService {
  constructor(private readonly repo: JobsRepository) {}

  findMany(filters: { remote?: boolean; visaTags?: string[] }): Promise<Result<(Job & { company: Company })[], AppError>> {
    return this.repo.findMany(filters);
  }
}
