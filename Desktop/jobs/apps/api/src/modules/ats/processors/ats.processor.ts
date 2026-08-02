import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AiService } from '../../../core/ai/ai.service';
import { CvRepository } from '../../cv/cv.repository';

@Processor('ats-queue')
export class AtsProcessor extends WorkerHost {
  constructor(
    private readonly aiService: AiService,
    private readonly cvRepo: CvRepository,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { userId, cvVersionId, jobDescription } = job.data;

    const cvResult = await this.cvRepo.findById(cvVersionId, userId);
    if (!cvResult.ok) {
      throw new Error('CV Version not found or unauthorized');
    }

    const cvContent = cvResult.value.content;

    if (job.name === 'score') {
      const result = await this.aiService.scoreAts(cvContent, jobDescription);
      if (!result.ok) throw new Error(result.error.message);
      return { type: 'score', data: result.value };
    }

    if (job.name === 'tailor') {
      const result = await this.aiService.tailorCv(cvContent, jobDescription);
      if (!result.ok) throw new Error(result.error.message);
      return { type: 'tailor', data: result.value };
    }

    throw new Error(`Unknown job type: ${job.name}`);
  }
}
