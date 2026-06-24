import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { JobsAggregationService } from '../services/jobs-aggregation.service';
import { Logger } from '@nestjs/common';

@Processor('jobs-queue')
export class JobsProcessor extends WorkerHost {
  private readonly logger = new Logger(JobsProcessor.name);

  constructor(private readonly aggregationService: JobsAggregationService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'aggregate') {
      this.logger.log('Executing scheduled aggregate job');
      await this.aggregationService.aggregate('engineer');
      return { success: true };
    }
    
    throw new Error(`Unknown job type: ${job.name}`);
  }
}
