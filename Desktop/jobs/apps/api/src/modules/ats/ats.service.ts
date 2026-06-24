import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AppError, err, ok, Result, AtsRequestDto, AtsJobStatusDto } from '@nexahire/types';

@Injectable()
export class AtsService {
  constructor(@InjectQueue('ats-queue') private readonly atsQueue: Queue) {}

  async submitScoreJob(userId: string, dto: AtsRequestDto): Promise<Result<{ jobId: string }, AppError>> {
    try {
      const job = await this.atsQueue.add('score', { userId, ...dto });
      if (!job.id) return err(new AppError('Internal', 'Failed to enqueue job'));
      return ok({ jobId: job.id });
    } catch (error) {
      return err(new AppError('Internal', 'Failed to submit ATS score job'));
    }
  }

  async submitTailorJob(userId: string, dto: AtsRequestDto): Promise<Result<{ jobId: string }, AppError>> {
    try {
      const job = await this.atsQueue.add('tailor', { userId, ...dto });
      if (!job.id) return err(new AppError('Internal', 'Failed to enqueue job'));
      return ok({ jobId: job.id });
    } catch (error) {
      return err(new AppError('Internal', 'Failed to submit CV tailor job'));
    }
  }

  async getJobStatus(jobId: string, userId: string): Promise<Result<AtsJobStatusDto, AppError>> {
    try {
      const job = await this.atsQueue.getJob(jobId);
      if (!job) return err(new AppError('NotFound', 'Job not found'));
      
      // Ensure the user owns the job
      if (job.data.userId !== userId) {
        return err(new AppError('Unauthorized', 'You do not have access to this job'));
      }

      const state = await job.getState();
      
      let status: 'pending' | 'processing' | 'completed' | 'failed' = 'pending';
      if (state === 'active') status = 'processing';
      else if (state === 'completed') status = 'completed';
      else if (state === 'failed') status = 'failed';
      else if (state === 'delayed' || state === 'waiting' || state === 'prioritized') status = 'pending';

      const resultObj: AtsJobStatusDto = {
        status,
        progress: job.progress as number,
        result: job.returnvalue ? job.returnvalue : undefined,
        error: job.failedReason,
      };

      return ok(resultObj);
    } catch (error) {
      return err(new AppError('Internal', 'Failed to fetch job status'));
    }
  }
}
