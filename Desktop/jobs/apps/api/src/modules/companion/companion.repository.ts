import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { PushSubscriptionDto } from '@nexahire/types';

@Injectable()
export class CompanionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertPushSubscription(userId: string, sub: PushSubscriptionDto) {
    return this.prisma.pushSubscription.upsert({
      where: { endpoint: sub.endpoint },
      create: {
        userId,
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
      },
      update: {
        userId,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
      },
    });
  }

  async findPushSubscriptionsByUser(userId: string) {
    return this.prisma.pushSubscription.findMany({
      where: { userId },
    });
  }

  async deletePushSubscription(id: string) {
    return this.prisma.pushSubscription.delete({ where: { id } });
  }

  async getFirstUser() {
    return this.prisma.user.findFirst();
  }

  async upsertTelegramChat(userId: string, chatId: string) {
    return this.prisma.telegramChat.upsert({
      where: { userId },
      update: { chatId },
      create: { userId, chatId },
    });
  }

  async findTelegramChat(chatId: string) {
    return this.prisma.telegramChat.findUnique({
      where: { chatId },
      include: { user: true },
    });
  }

  async findTelegramChatByUserId(userId: string) {
    return this.prisma.telegramChat.findUnique({
      where: { userId },
    });
  }

  async getDailyFocus(userId: string, date: Date) {
    return this.prisma.dailyFocus.findUnique({
      where: { userId_date: { userId, date } },
    });
  }
}
