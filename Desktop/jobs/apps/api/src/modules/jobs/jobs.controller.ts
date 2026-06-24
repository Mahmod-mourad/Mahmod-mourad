import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { unwrapOrThrow } from '../../core/result/http-mapper';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly service: JobsService) {}

  @Get()
  async list(@Query('remote') remote?: string, @Query('visaTag') visaTag?: string) {
    const filters: any = {};
    if (remote === 'true') filters.remote = true;
    if (visaTag) filters.visaTags = [visaTag];

    const result = await this.service.findMany(filters);
    const jobs = unwrapOrThrow(result);
    return jobs.map(job => ({
      id: job.id,
      companyId: job.companyId,
      company: {
        id: job.company.id,
        name: job.company.name,
      },
      source: job.source,
      externalId: job.externalId,
      dedupeHash: job.dedupeHash,
      title: job.title,
      location: job.location,
      remote: job.remote,
      applyUrl: job.applyUrl,
      postedAt: job.postedAt.toISOString(),
      visaTags: job.visaTags,
      createdAt: job.createdAt.toISOString(),
    }));
  }
}
