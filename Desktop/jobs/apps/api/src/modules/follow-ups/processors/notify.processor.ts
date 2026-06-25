import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { TelegramService } from '../../companion/telegram.service';
import { PushNotificationsService } from '../../companion/push-notifications.service';
import { FollowUpsRepository } from '../follow-ups.repository';

@Processor('notifications-queue')
export class NotifyProcessor extends WorkerHost {
  constructor(
    private readonly telegram: TelegramService,
    private readonly push: PushNotificationsService,
    private readonly repo: FollowUpsRepository,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'send-notification') {
      const { userId, message, followUpId } = job.data;

      // 1. Send via Telegram
      await this.telegram.sendMessageToUser(userId, message);

      // 2. Send via Web Push
      await this.push.sendToUser(userId, {
        title: 'NexaHire Reminder',
        body: message,
        data: { followUpId },
      });

      // Update follow-up status to sent
      if (followUpId) {
        await this.repo.markAsSent(followUpId);
      }

      return { success: true };
    }
  }
}
