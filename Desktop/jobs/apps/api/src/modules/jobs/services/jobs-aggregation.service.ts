import { Injectable, Logger } from '@nestjs/common';
import { JobSource } from '../sources/job-source.interface';
import { ArbeitnowAdapter } from '../sources/arbeitnow.adapter';
import { BundesagenturAdapter } from '../sources/bundesagentur.adapter';
import { RemoteOkAdapter } from '../sources/remoteok.adapter';
import { GreenhouseAdapter } from '../sources/greenhouse.adapter';
import { JobsRepository } from '../jobs.repository';
import { NormalizedJob } from '@nexahire/types';

@Injectable()
export class JobsAggregationService {
  private readonly logger = new Logger(JobsAggregationService.name);
  private sources: JobSource[] = [];

  constructor(private readonly repo: JobsRepository) {
    this.sources = [
      new ArbeitnowAdapter(),
      new BundesagenturAdapter(),
      new RemoteOkAdapter(),
      new GreenhouseAdapter('stripe'), // Example company
      new GreenhouseAdapter('gitlab'), // Example company
    ];
  }

  async aggregate(query: string = 'engineer'): Promise<void> {
    this.logger.log(`Starting job aggregation for query: ${query}`);
    let totalInserted = 0;

    for (const source of this.sources) {
      try {
        this.logger.log(`Fetching from ${source.id}...`);
        const result = await source.fetch({ q: query });
        if (!result.ok) {
          this.logger.error(`Failed to fetch from ${source.id}: ${result.error.message}`);
          continue;
        }

        const rawJobs = result.value;
        const normalizedJobs: NormalizedJob[] = [];

        for (const raw of rawJobs) {
          try {
            normalizedJobs.push(source.normalize(raw));
          } catch (err) {
            this.logger.warn(`Failed to normalize job from ${source.id}`, err);
          }
        }

        if (normalizedJobs.length > 0) {
          const insertResult = await this.repo.upsertJobs(normalizedJobs);
          if (insertResult.ok) {
            totalInserted += insertResult.value;
            this.logger.log(`Inserted ${insertResult.value} new jobs from ${source.id}`);
          } else {
            this.logger.error(`Failed to upsert jobs from ${source.id}: ${insertResult.error.message}`);
          }
        }
      } catch (err) {
        this.logger.error(`Unhandled error aggregating from ${source.id}`, err);
      }
    }

    this.logger.log(`Aggregation complete. Total new jobs inserted: ${totalInserted}`);
  }
}
