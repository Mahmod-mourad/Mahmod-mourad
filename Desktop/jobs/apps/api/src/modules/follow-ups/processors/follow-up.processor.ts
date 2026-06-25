import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { FollowUpsRepository } from '../follow-ups.repository';
import { AiService } from '../../../core/ai/ai.service';

@Processor('follow-ups-queue')
export class FollowUpProcessor extends WorkerHost {
  constructor(
    private readonly repo: FollowUpsRepository,
    private readonly aiService: AiService,
    @InjectQueue('notifications-queue') private notifyQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'check-due') {
      const dueFollowUps = await this.repo.getDuePendingFollowUps();

      for (const followUp of dueFollowUps) {
        // Draft message
        const company = followUp.application.company;
        const role = followUp.application.role;
        const appliedAt = followUp.application.appliedAt.toLocaleDateString();

        const draftRes = await this.aiService.draftFollowUp(company, role, appliedAt);

        let draftedMessage = '';
        if (draftRes.ok) {
          draftedMessage = draftRes.value;
        } else {
          draftedMessage = `Hi, I applied for the ${role} position on ${appliedAt} and wanted to check on the status of my application. Thank you!`; // Fallback
        }

        // Update followUp status to drafted
        await this.repo.updateStatusAndMessage(followUp.id, 'drafted', draftedMessage);

        // Queue notification
        await this.notifyQueue.add('send-notification', {
          userId: followUp.application.userId,
          message: `⏰ Follow-up due for ${role} at ${company}!\n\nDraft:\n${draftedMessage}`,
          followUpId: followUp.id,
        });
      }

      return { processed: dueFollowUps.length };
    }
  }
}
