import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { AppError, err, NormalizedJob, ok, Result } from '@nexahire/types';
import { Job, Company } from '@prisma/client';

@Injectable()
export class JobsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertJobs(normalizedJobs: NormalizedJob[]): Promise<Result<number, AppError>> {
    try {
      let inserted = 0;
      for (const job of normalizedJobs) {
        // Upsert Company
        const company = await this.prisma.company.upsert({
          where: { name: job.companyName },
          update: {},
          create: { name: job.companyName },
        });

        // Insert Job if dedupeHash doesn't exist
        const existing = await this.prisma.job.findUnique({
          where: { dedupeHash: job.dedupeHash },
        });

        if (!existing) {
          await this.prisma.job.create({
            data: {
              companyId: company.id,
              source: job.source,
              externalId: job.externalId,
              dedupeHash: job.dedupeHash,
              title: job.title,
              location: job.location,
              remote: job.remote,
              applyUrl: job.applyUrl,
              postedAt: job.postedAt,
              visaTags: job.visaTags,
            },
          });
          inserted++;
        }
      }
      return ok(inserted);
    } catch (error) {
      return err(new AppError('Internal', 'Failed to upsert jobs'));
    }
  }

  async findMany(filters: { remote?: boolean; visaTags?: string[] }): Promise<Result<(Job & { company: Company })[], AppError>> {
    try {
      const where: any = {};
      if (filters.remote !== undefined) {
        where.remote = filters.remote;
      }
      if (filters.visaTags && filters.visaTags.length > 0) {
        where.visaTags = { hasSome: filters.visaTags };
      }

      const jobs = await this.prisma.job.findMany({
        where,
        include: { company: true },
        orderBy: { postedAt: 'desc' },
        take: 100, // Limit for now
      });
      return ok(jobs);
    } catch (error) {
      return err(new AppError('Internal', 'Failed to fetch jobs'));
    }
  }
}
