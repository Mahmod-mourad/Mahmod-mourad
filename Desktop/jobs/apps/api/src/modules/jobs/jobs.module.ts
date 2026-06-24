import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobsRepository } from './jobs.repository';
import { JobsAggregationService } from './services/jobs-aggregation.service';
import { JobsProcessor } from './processors/jobs.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'jobs-queue',
    }),
  ],
  controllers: [JobsController],
  providers: [JobsService, JobsRepository, JobsAggregationService, JobsProcessor],
  exports: [JobsService],
})
export class JobsModule implements OnModuleInit {
  constructor(@InjectQueue('jobs-queue') private readonly jobsQueue: Queue) {}

  async onModuleInit() {
    // Schedule the repeatable aggregate job every 6 hours
    await this.jobsQueue.add(
      'aggregate',
      {},
      {
        repeat: { pattern: '0 */6 * * *' },
        jobId: 'aggregate-jobs-repeatable', // stable ID prevents duplicates
      },
    );
  }
}
