import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { CompanionRepository } from './companion.repository';
import { PushSubscriptionDto } from '@nexahire/types';
import { AppError, err, ok, Result } from '../../core/result';

@Injectable()
export class PushNotificationsService implements OnModuleInit {
  private isConfigured = false;

  constructor(
    private readonly config: ConfigService,
    private readonly repo: CompanionRepository,
  ) {}

  onModuleInit() {
    const publicKey = this.config.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.config.get<string>('VAPID_PRIVATE_KEY');
    const subject = this.config.get<string>('VAPID_SUBJECT');

    if (publicKey && privateKey && subject) {
      webpush.setVapidDetails(subject, publicKey, privateKey);
      this.isConfigured = true;
    } else {
      console.warn('VAPID keys not configured. Web Push will be disabled.');
    }
  }

  getPublicKey(): string | null {
    return this.config.get<string>('VAPID_PUBLIC_KEY') || null;
  }

  async saveSubscription(userId: string, sub: PushSubscriptionDto): Promise<Result<boolean, AppError>> {
    try {
      await this.repo.upsertPushSubscription(userId, sub);
      return ok(true);
    } catch (error) {
      return err(new AppError('Unexpected', 'Failed to save push subscription'));
    }
  }

  async sendToUser(userId: string, payload: any): Promise<void> {
    if (!this.isConfigured) return;

    const subs = await this.repo.findPushSubscriptionsByUser(userId);

    for (const sub of subs) {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
      } catch (error: any) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          // Subscription has expired or is no longer valid
          await this.repo.deletePushSubscription(sub.id);
        } else {
          console.error('Error sending push notification', error);
        }
      }
    }
  }
}
